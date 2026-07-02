const Groq = require('groq-sdk');

const groqClient = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// Log Groq status on startup
if (groqClient) {
  console.log('✅ Groq API Client initialized with API key');
} else {
  console.warn('⚠️ Groq API key not found in GROQ_API_KEY environment variable');
}

const LANGUAGE_LABELS = {
  python: 'Python',
  java: 'Java',
  c: 'C Language',
};

/**
 * Clean and fix malformed JSON from Groq API
 * Handles unescaped control characters in strings
 */
function cleanAndFixJSON(jsonStr) {
  try {
    // First, try direct parse
    return JSON.parse(jsonStr);
  } catch (e) {
    console.log(`   ⚙️ Direct JSON parse failed: ${e.message}`);
    console.log(`   🔧 Attempting to fix malformed JSON (likely has unescaped control chars)...`);
    
    // If that fails, attempt to fix common issues using state machine
    let inString = false;
    let escaped = false;
    let result = '';
    let fixes = 0;
    
    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr[i];
      
      if (char === '\\' && !escaped) {
        escaped = true;
        result += char;
        continue;
      }
      
      if (char === '"' && !escaped) {
        inString = !inString;
        result += char;
        escaped = false;
        continue;
      }
      
      // Replace literal control characters with escaped versions when inside strings
      if (inString && !escaped) {
        if (char === '\n') {
          result += '\\n';
          fixes++;
          escaped = false;
          continue;
        }
        if (char === '\r') {
          result += '\\r';
          fixes++;
          escaped = false;
          continue;
        }
        if (char === '\t') {
          result += '\\t';
          fixes++;
          escaped = false;
          continue;
        }
      }
      
      result += char;
      escaped = false;
    }
    
    console.log(`   ✅ Fixed ${fixes} control character issues`);
    
    try {
      return JSON.parse(result);
    } catch (e2) {
      console.error(`   ❌ Still cannot parse after fixes: ${e2.message}`);
      throw e2;
    }
  }
}

/**
 * Analyze assessment results to identify weak topics
 * @param {Object|Map} topicBreakdown - Map or plain object of topics with correct/total counts
 * @returns {Array} Array of weak topics sorted by weakness
 */
function analyzeWeakTopics(topicBreakdown) {
  if (!topicBreakdown) {
    return [];
  }

  const weakTopics = [];

  // Handle both Map and plain object
  const entries = topicBreakdown instanceof Map 
    ? Array.from(topicBreakdown.entries())
    : Object.entries(topicBreakdown);

  entries.forEach(([topic, stats]) => {
    if (!stats || typeof stats.total !== 'number') return;
    
    const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    
    // Topics with < 70% accuracy are weak
    if (accuracy < 70) {
      weakTopics.push({
        topic,
        accuracy,
        correct: stats.correct || 0,
        total: stats.total,
        weakness: 100 - accuracy, // Higher = weaker
      });
    }
  });

  // Sort by weakness (descending)
  return weakTopics.sort((a, b) => b.weakness - a.weakness);
}

/**
 * Generate REAL coding questions with test cases using Groq API
 */
// Number of coding tasks per learning-path cycle, generated in difficulty-tiered
// batches so each Groq call stays small enough to return reliable JSON.
const TASKS_PER_PATH = 10;
const QUESTION_BATCH_SIZE = 5;

const LEVEL_GUIDELINES = {
  Beginner: 'Problems must be VERY simple syntax exercises using only basic variables, loops, and if statements. Absolute fundamentals — NO recursion, NO complex data structures, NO advanced algorithms, NO tricky edge cases.',
  Intermediate: 'Problems should include logic puzzles, simple algorithms like sorting/searching, basic OOP concepts, and simple recursion.',
  Advanced: 'Problems should cover advanced algorithms, optimization, complex OOP patterns, and require algorithmic thinking.',
};

/**
 * Choose how many easy / medium / hard problems to generate for a learner.
 * A Beginner (low assessment score, weak topics) gets mostly basics and
 * NEVER advanced (hard) problems; the mix shifts harder as the level rises.
 * Totals always add up to TASKS_PER_PATH.
 */
function buildDifficultyPlan(proficiencyLevel, assessmentScore) {
  const raw = Number(assessmentScore);
  const score = Number.isFinite(raw) ? raw : 50;

  if (proficiencyLevel === 'Advanced') {
    return { easy: 1, medium: 4, hard: 5 };
  }
  if (proficiencyLevel === 'Intermediate') {
    return { easy: 3, medium: 5, hard: 2 };
  }
  // Beginner — keep it basic; no advanced problems at all.
  // A weak beginner (low score) gets ALL trivial problems, no medium.
  if (score < 40) return { easy: 10, medium: 0, hard: 0 };
  return { easy: 8, medium: 2, hard: 0 };
}

/**
 * Concrete, per-batch style guidance so Groq generates problems at the RIGHT
 * complexity — especially "easy for a Beginner" meaning genuinely trivial.
 */
const BATCH_GUIDANCE = {
  'Beginner:easy': `ABSOLUTE BASICS ONLY. Each problem must be solvable in 1-4 lines of real logic by someone who has JUST learned the syntax.
ALLOWED: printing text, storing a value in a variable and printing it, reading input, ONE arithmetic operation (+, -, *, /, %), or a single formula.
STRICTLY FORBIDDEN: loops, if/else, arrays/lists, string manipulation, functions (other than main), recursion.
Example problems: "Print 'Hello, World!'", "Add two numbers and print the sum", "Given length and width, print the area of a rectangle", "Convert Celsius to Fahrenheit using the formula".`,
  'Beginner:medium': `STILL VERY BASIC. Allowed: a SINGLE if/else OR one simple counting loop — never both, never nested.
Example problems: "Check whether a number is even or odd", "Find the larger of two numbers", "Print all numbers from 1 to N".`,
  'Intermediate:easy': `Simple warm-ups combining basic loops and conditionals, or simple array/string access.`,
  'Intermediate:medium': `Small algorithms: sum or average of a list, find the max, simple linear search.`,
  'Intermediate:hard': `Moderate logic: sorting, simple recursion, multi-step problems.`,
  'Advanced:easy': `Review-level: arrays, loops and conditionals combined.`,
  'Advanced:medium': `Algorithms: searching, sorting, recursion.`,
  'Advanced:hard': `Advanced: optimization, complex data structures, real algorithmic thinking.`,
};

function getBatchGuidance(proficiencyLevel, difficultyTier) {
  return BATCH_GUIDANCE[`${proficiencyLevel}:${difficultyTier}`] || '';
}

/**
 * Split a difficulty plan into Groq batches no larger than QUESTION_BATCH_SIZE,
 * so each API call stays small and returns reliable JSON.
 */
function splitIntoBatches(plan) {
  const specs = [];
  ['easy', 'medium', 'hard'].forEach((difficultyTier) => {
    let remaining = plan[difficultyTier] || 0;
    while (remaining > 0) {
      const count = Math.min(QUESTION_BATCH_SIZE, remaining);
      specs.push({ difficultyTier, count });
      remaining -= count;
    }
  });
  return specs;
}

/**
 * Request a single batch of raw coding problems from Groq for one difficulty tier.
 * Returns an array of raw question objects (empty array on failure).
 */
async function requestQuestionBatch({ language, proficiencyLevel, focusAreas, assessmentScore, count, difficultyTier, contentGuidance, avoidTitles = [] }) {
  const languageLabel = LANGUAGE_LABELS[language] || language;

  const systemPrompt = `You are an expert programming problem setter like those on LeetCode or HackerRank.
Generate exactly ${count} REAL, SOLVABLE programming problems with clear test cases.
CRITICAL: Problems must be appropriate for the specified proficiency level.

LEVEL GUIDELINES:
- Beginner: Simple syntax, basic concepts, no complex logic, single function problems
- Intermediate: Logic puzzles, small programs, basic algorithms, debugging
- Advanced: Algorithms, optimization, OOP design, complex problems

RULES:
1. Return ONLY valid JSON with key "questions" containing exactly ${count} problem objects
2. Each problem must have: title, description, difficulty, topic, starterCode, testCases, hints
3. Target "${difficultyTier}" difficulty within the ${proficiencyLevel} level for this batch
4. Each problem should focus on ONE specific concept and be DISTINCT from the others
5. testCases: array with at least 2-3 items, each with: input (string), expectedOutput (string), description
6. starterCode must be valid, runnable skeleton code specific to ${languageLabel}
7. Include 2-3 helpful hints per problem (light, medium, heavy)
8. Output NOTHING except the JSON object - no markdown, no explanations`;

  const userPrompt = `Generate ${count} REAL ${languageLabel} coding problems for a ${proficiencyLevel} level learner.

PROFICIENCY LEVEL: ${proficiencyLevel}
${LEVEL_GUIDELINES[proficiencyLevel] || LEVEL_GUIDELINES.Beginner}

PROBLEM STYLE FOR THIS BATCH (difficulty: ${difficultyTier}):
${contentGuidance || `Keep every problem at "${difficultyTier}" difficulty within the ${proficiencyLevel} level.`}

Student Performance:
- Overall Score: ${assessmentScore}%
- Weak Areas to Focus On: ${focusAreas || 'fundamentals'}
- Difficulty for THIS batch: ${difficultyTier}

For EACH problem:
1. Difficulty should be "${difficultyTier}" within the ${proficiencyLevel} level
2. Create a REAL practical problem (not abstract exercises)
3. Provide a clear problem statement with input/output examples
4. Include 2-3 test cases with actual input/output values
5. Write working starter code (skeleton) they can build on
6. Add 2-3 progressive hints (light → medium → heavy)
7. Focus on weak areas when possible, and keep every problem distinct

${avoidTitles.length ? `ALREADY USED — do NOT repeat or rephrase any of these problems (pick different concepts/titles):\n- ${avoidTitles.join('\n- ')}\n` : ''}
IMPORTANT: Do NOT exceed the ${proficiencyLevel} level complexity. STRICTLY follow the PROBLEM STYLE for this batch above — never make problems harder than described. Make all ${count} problems distinct from each other AND from the already-used list.

Return JSON object with key "questions" containing an array of ${count} problem objects.
Structure: {
  "questions": [
    {
      "title": "Problem Title",
      "description": "Problem description with example",
      "difficulty": "${difficultyTier}",
      "topic": "Variables|Loops|Functions|Arrays|etc",
      "starterCode": "code skeleton",
      "testCases": [{"input": "example input", "expectedOutput": "example output", "description": "what this tests"}],
      "hints": [{"text": "hint 1", "difficulty": "light"}]
    }
  ]
}`;

  try {
    const message = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const content = message.choices?.[0]?.message?.content || '{}';

    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) jsonStr = jsonMatch[1];

    let parsed;
    try {
      parsed = cleanAndFixJSON(jsonStr);
    } catch (parseError) {
      const jsonObjectMatch = content.match(/\{[\s\S]*"questions"[\s\S]*\}/);
      if (!jsonObjectMatch) throw new Error('No JSON object found in response');
      parsed = cleanAndFixJSON(jsonObjectMatch[0]);
    }

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return [];
    }

    console.log(`   ✅ Batch "${difficultyTier}": ${parsed.questions.length} questions`);
    return parsed.questions;
  } catch (error) {
    console.warn(`   ⚠️ Batch "${difficultyTier}" generation failed: ${error.message}`);
    return [];
  }
}

async function generateRealQuestions(language, proficiencyLevel, topicBreakdown, assessmentScore) {
  if (!groqClient) {
    console.warn('⚠️ Groq API not configured. Using fallback questions.');
    return generateFallbackQuestions(language, proficiencyLevel, topicBreakdown, TASKS_PER_PATH);
  }

  const weakTopics = analyzeWeakTopics(topicBreakdown);
  const languageLabel = LANGUAGE_LABELS[language] || language;

  let focusAreas = 'fundamentals';
  if (weakTopics.length > 0) {
    focusAreas = weakTopics.slice(0, 3).map(t => t.topic).join(', ');
  }

  console.log(`🎯 [REAL QUESTIONS] Generating ${TASKS_PER_PATH} for: ${languageLabel} (${proficiencyLevel})`);
  console.log(`📍 Focus areas: ${focusAreas} | Assessment score: ${assessmentScore}%`);

  // Difficulty mix is chosen from the learner's level + score, so a weak
  // Beginner gets mostly basics and NO advanced (hard) problems.
  const plan = buildDifficultyPlan(proficiencyLevel, assessmentScore);
  const batchSpecs = splitIntoBatches(plan);
  console.log(`🎚️ Difficulty plan (${proficiencyLevel}, ${assessmentScore}%): easy ${plan.easy}, medium ${plan.medium}, hard ${plan.hard}`);

  // Generate batches SEQUENTIALLY, feeding already-used titles into each next
  // batch and de-duplicating, so no two tasks repeat the same problem.
  const normTitle = (s) => (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
  const seenKeys = new Set();
  const usedTitles = [];
  let rawQuestions = [];

  for (const { difficultyTier, count } of batchSpecs) {
    const batch = await requestQuestionBatch({
      language,
      proficiencyLevel,
      focusAreas,
      assessmentScore,
      count,
      difficultyTier,
      contentGuidance: getBatchGuidance(proficiencyLevel, difficultyTier),
      avoidTitles: usedTitles,
    });

    for (const q of batch) {
      const key = normTitle(q?.title);
      if (!key || seenKeys.has(key)) continue; // skip repeats
      seenKeys.add(key);
      usedTitles.push(q.title);
      rawQuestions.push(q);
    }
  }

  console.log(`✅ Groq returned ${rawQuestions.length}/${TASKS_PER_PATH} distinct questions across ${batchSpecs.length} batches`);

  // Top up with template questions if Groq under-delivered, skipping any that
  // would duplicate a title we already have.
  if (rawQuestions.length < TASKS_PER_PATH) {
    const needed = TASKS_PER_PATH - rawQuestions.length;
    console.warn(`⚠️ Only ${rawQuestions.length} distinct — topping up with up to ${needed} template question(s)`);
    const fallback = generateFallbackQuestions(language, proficiencyLevel, topicBreakdown, TASKS_PER_PATH);
    for (const q of fallback) {
      if (rawQuestions.length >= TASKS_PER_PATH) break;
      const key = normTitle(q?.title);
      if (!key || seenKeys.has(key)) continue;
      seenKeys.add(key);
      rawQuestions.push(q);
    }
  }

  if (rawQuestions.length === 0) {
    return generateFallbackQuestions(language, proficiencyLevel, topicBreakdown, TASKS_PER_PATH);
  }

  const questions = normalizeRealQuestions(rawQuestions, language, proficiencyLevel, weakTopics);
  console.log(`✅ [SUCCESS] Prepared ${questions.length} questions for the learning path`);
  return questions;
}

/**
 * Normalize real questions to match schema
 */
function normalizeRealQuestions(questions, language, proficiencyLevel, weakTopics) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return generateFallbackQuestions(language, proficiencyLevel, new Map());
  }

  const difficultyMap = { 'easy': 'easy', 'medium': 'medium', 'hard': 'hard' };
  const topicMap = {
    'variables': 'Variables',
    'conditionals': 'Conditionals',
    'loops': 'Loops',
    'functions': 'Functions',
    'arrays': 'Arrays',
    'objects': 'Objects',
    'oop': 'OOP',
    'strings': 'Variables',
    'math': 'Functions',
  };

  return questions.slice(0, TASKS_PER_PATH).map((q, index) => {
    const normalizedTopic = topicMap[q?.topic?.toLowerCase()] || 'Functions';
    
    return {
      taskId: `${language}-real-${index + 1}`,
      title: (q?.title || `${LANGUAGE_LABELS[language]} Problem ${index + 1}`).toString().slice(0, 120),
      description: (q?.description || 'Solve the coding problem.').toString().slice(0, 500),
      explanation: (q?.description || 'Write solution based on the problem statement.').toString().slice(0, 500),
      difficulty: difficultyMap[q?.difficulty?.toLowerCase()] || 'medium',
      topic: normalizedTopic,
      starterCode: (q?.starterCode || `// Solution for ${LANGUAGE_LABELS[language]}\n`).toString(),
      testCases: Array.isArray(q?.testCases)
        ? q.testCases.slice(0, 3).map(tc => ({
            input: (tc?.input || '').toString().slice(0, 500),
            expectedOutput: (tc?.expectedOutput || '').toString().slice(0, 500),
            description: (tc?.description || 'Test case').toString().slice(0, 200),
          }))
        : [],
      hints: Array.isArray(q?.hints)
        ? q.hints.slice(0, 3).map(h => ({
            hint: (h?.text || h?.hint || '').toString().slice(0, 200),
            difficulty: ['light', 'medium', 'heavy'].includes(h?.difficulty) ? h.difficulty : 'light',
          }))
        : [],
      proficiencyLevel,
      order: index + 1,
      status: index === 0 ? 'unlocked' : 'locked',
    };
  });
}

/**
 * Fallback questions when AI is not available
 */
function generateFallbackQuestions(language, proficiencyLevel, topicBreakdown, count = TASKS_PER_PATH) {
  const level = ['Beginner', 'Intermediate', 'Advanced'].includes(proficiencyLevel) ? proficiencyLevel : 'Beginner';

  // Language-agnostic problem specs, 10 DISTINCT per level so a full path never
  // needs to repeat a problem. Difficulty roughly follows the level's plan.
  const PROBLEMS = {
    Beginner: [
      { title: 'Print a Greeting', description: 'Print the exact message: Hello, World!', topic: 'Variables', difficulty: 'easy' },
      { title: 'Add Two Numbers', description: 'Read two numbers and print their sum. Example: 2 and 3 → 5.', topic: 'Variables', difficulty: 'easy' },
      { title: 'Multiply Two Numbers', description: 'Read two numbers and print their product. Example: 4 and 5 → 20.', topic: 'Variables', difficulty: 'easy' },
      { title: 'Area of a Rectangle', description: 'Given length and width, print the area (length * width). Example: 5, 3 → 15.', topic: 'Variables', difficulty: 'easy' },
      { title: 'Celsius to Fahrenheit', description: 'Convert a Celsius temperature to Fahrenheit using c * 9 / 5 + 32. Example: 0 → 32.', topic: 'Variables', difficulty: 'easy' },
      { title: 'Double a Number', description: 'Read a number and print its double. Example: 5 → 10.', topic: 'Variables', difficulty: 'easy' },
      { title: 'Square a Number', description: 'Read a number and print its square. Example: 4 → 16.', topic: 'Variables', difficulty: 'easy' },
      { title: 'Subtract Two Numbers', description: 'Read two numbers and print the first minus the second. Example: 10, 4 → 6.', topic: 'Variables', difficulty: 'easy' },
      { title: 'Perimeter of a Square', description: 'Given the side length, print the perimeter (4 * side). Example: 5 → 20.', topic: 'Variables', difficulty: 'easy' },
      { title: 'Print a Number', description: 'Read a number and print it back exactly. Example: 7 → 7.', topic: 'Variables', difficulty: 'easy' },
    ],
    Intermediate: [
      { title: 'Even or Odd', description: 'Read a number and print whether it is "Even" or "Odd".', topic: 'Conditionals', difficulty: 'medium' },
      { title: 'Larger of Two Numbers', description: 'Read two numbers and print the larger one.', topic: 'Conditionals', difficulty: 'easy' },
      { title: 'Sum from 1 to N', description: 'Read N and print the sum of all integers from 1 to N.', topic: 'Loops', difficulty: 'medium' },
      { title: 'Factorial of a Number', description: 'Read N and print N! (the product 1*2*...*N).', topic: 'Loops', difficulty: 'medium' },
      { title: 'Count Vowels', description: 'Read a string and print how many vowels (a, e, i, o, u) it contains.', topic: 'Strings', difficulty: 'medium' },
      { title: 'Reverse a String', description: 'Read a string and print it reversed. Example: "hello" → "olleh".', topic: 'Strings', difficulty: 'medium' },
      { title: 'Maximum in an Array', description: 'Given a list of numbers, print the largest value.', topic: 'Arrays', difficulty: 'medium' },
      { title: 'Check Prime', description: 'Read a number and print whether it is a prime number.', topic: 'Loops', difficulty: 'medium' },
      { title: 'Sum of Array Elements', description: 'Given a list of numbers, print their sum.', topic: 'Arrays', difficulty: 'easy' },
      { title: 'Fibonacci Series', description: 'Read N and print the first N Fibonacci numbers.', topic: 'Loops', difficulty: 'medium' },
    ],
    Advanced: [
      { title: 'Binary Search', description: 'Given a sorted array and a target, return the target index using binary search, or -1 if absent.', topic: 'Algorithms', difficulty: 'hard' },
      { title: 'Bubble Sort', description: 'Sort an array of integers in ascending order using bubble sort.', topic: 'Sorting', difficulty: 'medium' },
      { title: 'Check Palindrome', description: 'Return whether a string reads the same forwards and backwards.', topic: 'Strings', difficulty: 'medium' },
      { title: 'GCD of Two Numbers', description: 'Compute the greatest common divisor of two integers using the Euclidean algorithm.', topic: 'Algorithms', difficulty: 'medium' },
      { title: 'Merge Two Sorted Arrays', description: 'Merge two sorted arrays into a single sorted array.', topic: 'Arrays', difficulty: 'hard' },
      { title: 'Word Frequency Count', description: 'Given a sentence, print how many times each word appears.', topic: 'Strings', difficulty: 'hard' },
      { title: 'Matrix Transpose', description: 'Given a 2D matrix, produce and print its transpose.', topic: 'Arrays', difficulty: 'hard' },
      { title: 'Second Largest in Array', description: 'Find the second-largest distinct value in an array.', topic: 'Arrays', difficulty: 'medium' },
      { title: 'Recursive Power', description: 'Compute a raised to the power b using recursion.', topic: 'Recursion', difficulty: 'medium' },
      { title: 'Find Duplicate in Array', description: 'Return the first value that appears more than once in an array.', topic: 'Arrays', difficulty: 'hard' },
    ],
  };

  // Simple, language-appropriate starter stubs (AI evaluates the final code).
  const STUBS = {
    python: (title) => `# ${title}\n# Write your solution below\n`,
    java: (title) => `public class Solution {\n    public static void main(String[] args) {\n        // ${title}\n        // Write your solution here\n    }\n}\n`,
    c: (title) => `#include <stdio.h>\n\nint main() {\n    // ${title}\n    // Write your solution here\n    return 0;\n}\n`,
  };

  const problems = PROBLEMS[level];
  const makeStub = STUBS[language] || STUBS.python;

  const limit = Math.min(count, problems.length);
  const out = [];
  for (let i = 0; i < limit; i++) {
    const p = problems[i];
    out.push({
      taskId: `${language}-real-${i + 1}`,
      title: p.title,
      description: p.description,
      explanation: `Problem: ${p.description}\n\nApproach: Break it into small steps and test with simple inputs first.`,
      difficulty: p.difficulty,
      topic: p.topic,
      starterCode: makeStub(p.title),
      testCases: [],
      hints: [
        { hint: 'Read the problem carefully and note the expected output', difficulty: 'light' },
        { hint: 'Start with the simplest input, then handle the rest', difficulty: 'medium' },
        { hint: 'Check edge cases before finishing', difficulty: 'heavy' },
      ],
      proficiencyLevel,
      order: i + 1,
      status: i === 0 ? 'unlocked' : 'locked',
    });
  }
  return out;
}

/**
 * Generate personalized coding tasks based on assessment performance
 * Uses Groq API for fast, free generation
 */
async function generatePersonalizedTasks(language, proficiencyLevel, topicBreakdown, assessmentScore) {
  // Use real questions instead of generic tasks
  return generateRealQuestions(language, proficiencyLevel, topicBreakdown, assessmentScore);
}

/**
 * Evaluate student code using Groq AI with test case validation
 */
async function evaluateCodeWithAI({ 
  language, 
  proficiencyLevel, 
  taskTitle, 
  taskDescription, 
  code,
  testCases = [] 
}) {
  if (!groqClient) {
    console.warn('⚠️ Groq client not configured. Using default feedback.');
    return {
      feedback: 'AI evaluation not available. Review your code for logic errors, edge cases, and code style.',
      suggestions: [
        'Handle edge cases and invalid inputs.',
        'Add comments for complex logic.',
        'Test with multiple inputs.',
      ],
      qualityScore: 5,
    };
  }

  const testCaseSummary = testCases.length > 0 
    ? `\n\nTest Cases to Pass:\n${testCases.map(tc => `Input: ${tc.input}\nExpected: ${tc.expectedOutput}`).join('\n---\n')}`
    : '';

  const systemPrompt = `You are an expert code reviewer. Analyze the code and provide constructive feedback.
Return ONLY valid JSON with keys: feedback (string), suggestions (array of 2-3 strings), qualityScore (1-10).
Be encouraging but honest about improvements needed.
Quality Score: 1-3 (doesn't work), 4-6 (works with issues), 7-8 (good), 9-10 (excellent).`;

  const userPrompt = `Review this ${language} code for the task "${taskTitle}":

Task: ${taskDescription}${testCaseSummary}
Proficiency Level: ${proficiencyLevel}

Code:
\`\`\`${language}
${code}
\`\`\`

1. Does it appear to handle the test cases?
2. Is the code logic correct?
3. What improvements are needed?

Provide feedback as JSON only.`;

  try {
    console.log(`📝 Evaluating ${language} code for: ${taskTitle}`);
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const message = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1000,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    });

    clearTimeout(timeoutId);

    const content = message.choices?.[0]?.message?.content || '{}';
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsed = cleanAndFixJSON(jsonStr);
    let qualityScore = Math.min(10, Math.max(1, Number(parsed.qualityScore) || 5));
    
    // Boost score if test cases are handled well
    if (qualityScore >= 7 && parsed.feedback?.toLowerCase().includes('pass')) {
      qualityScore = Math.min(10, qualityScore + 1);
    }

    console.log(`✅ Code evaluated: Score ${qualityScore}/10`);

    return {
      feedback: parsed.feedback || 'Good attempt. Consider edge cases and code clarity.',
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.slice(0, 3)
        : ['Handle edge cases', 'Add error handling', 'Improve code clarity'],
      qualityScore: qualityScore,
    };
  } catch (error) {
    console.error('❌ Code evaluation error:', error.message);
    
    // If timeout or network error, return a generic score
    if (error.code === 'ABORT_ERR' || error.message.includes('timeout')) {
      console.log('⚠️ Evaluation timeout - returning neutral score');
      return {
        feedback: 'Evaluation took too long. Please review: Does your code handle all test cases?',
        suggestions: ['Check for infinite loops', 'Verify all edge cases', 'Test your logic step by step'],
        qualityScore: 5,
      };
    }

    return {
      feedback: 'Review completed. Check if your code handles all test cases correctly.',
      suggestions: ['Trace through test cases', 'Check edge cases', 'Ensure output format matches'],
      qualityScore: 5,
    };
  }
}

/**
 * Logical topic sequence - order matters for learning progression
 */
const TOPIC_SEQUENCE = [
  'Variables',
  'Conditionals',
  'Loops',
  'Functions',
  'Arrays',
  'Objects',
  'OOP',
  'Error Handling',
  'Recursion',
  'Sorting'
];

/**
 * Generate a structured learning path with difficulty stages
 * Creates multiple difficulty stages per topic with progressive challenges
 */
async function generateStructuredLearningPath(language, proficiencyLevel, topicBreakdown, assessmentScore) {
  try {
    console.log(`📚 Generating structured learning path for ${language} (${proficiencyLevel})`);
    
    const weakTopics = analyzeWeakTopics(topicBreakdown);
    const weakTopicNames = weakTopics.map(t => t.topic);
    
    console.log(`🎯 Weak topics identified: ${weakTopicNames.length > 0 ? weakTopicNames.join(', ') : 'none'}`);

    // Build topic priority list: weak topics first, then other relevant topics
    const priorityTopics = [];
    
    // Add weak topics in order of weakness
    weakTopics.slice(0, 3).forEach(wt => {
      const idx = TOPIC_SEQUENCE.findIndex(t => t.toLowerCase() === wt.topic.toLowerCase());
      if (idx !== -1 && !priorityTopics.find(t => t.name === TOPIC_SEQUENCE[idx])) {
        priorityTopics.push({ name: TOPIC_SEQUENCE[idx], isWeak: true });
      }
    });

    // Add next relevant topics from sequence for learning progression
    const baseCount = proficiencyLevel === 'Advanced' ? 5 : proficiencyLevel === 'Intermediate' ? 4 : 3;
    const sequenceIdx = priorityTopics.length > 0 
      ? TOPIC_SEQUENCE.findIndex(t => t === priorityTopics[0].name)
      : 0;

    for (let i = sequenceIdx + 1; priorityTopics.length < baseCount && i < TOPIC_SEQUENCE.length; i++) {
      if (!priorityTopics.find(t => t.name === TOPIC_SEQUENCE[i])) {
        priorityTopics.push({ name: TOPIC_SEQUENCE[i], isWeak: false });
      }
    }

    console.log(`📋 Priority topics: ${priorityTopics.map(t => t.name).join(' → ')}`);

    // Generate questions for each topic with difficulty progression
    const allTasks = [];
    let taskOrder = 1;

    for (const topicInfo of priorityTopics) {
      const topic = topicInfo.name;
      const difficulties = ['easy', 'medium', 'hard'];
      
      for (const difficulty of difficulties) {
        console.log(`   Generating: ${topic} (${difficulty})`);
        
        try {
          const questions = await generateQuestionsForTopic(
            language,
            proficiencyLevel,
            topic,
            difficulty,
            topicInfo.isWeak ? 2 : 1  // Generate more questions for weak topics
          );

          questions.forEach((q, idx) => {
            allTasks.push({
              ...q,
              taskId: `${language}-${taskOrder}`,
              order: taskOrder,
              status: taskOrder === 1 ? 'unlocked' : 'locked',
            });
            taskOrder++;
          });
        } catch (topicErr) {
          console.warn(`   Failed to generate for ${topic}/${difficulty}:`, topicErr.message);
        }
      }
    }

    console.log(`✅ Structured path generated with ${allTasks.length} tasks`);
    
    // If we couldn't generate enough, fall back to personalized tasks
    if (allTasks.length < 3) {
      console.warn('⚠️ Insufficient tasks generated, using fallback approach');
      return await generatePersonalizedTasks(language, proficiencyLevel, topicBreakdown, assessmentScore);
    }

    return allTasks;
  } catch (error) {
    console.error('❌ Structured path generation error:', error.message);
    console.log('   Falling back to personalized tasks');
    return await generatePersonalizedTasks(language, proficiencyLevel, topicBreakdown, assessmentScore);
  }
}

/**
 * Generate questions for a specific topic and difficulty level
 */
async function generateQuestionsForTopic(language, proficiencyLevel, topic, difficulty, count = 1) {
  if (!groqClient) {
    return generateFallbackQuestions(language, proficiencyLevel, new Map()).slice(0, count);
  }

  const languageLabel = LANGUAGE_LABELS[language] || language;
  const systemPrompt = `You are an expert programming educator generating educational problems.
Generate exactly ${count} ${difficulty.toUpperCase()} level ${language} problems focused on "${topic}" for ${proficiencyLevel} learners.

DIFFICULTY LEVELS:
- Easy: Basic syntax, simple operations, single function, obvious solution path
- Medium: Combines concepts, requires some logic, mini-algorithm  
- Hard: Complex logic, optimization, design thinking, edge cases

Requirements:
- Return ONLY valid JSON: { "questions": [question objects] }
- Each question: { "title", "description", "topic", "difficulty", "starterCode", "testCases": [], "hints": [] }
- TestCases: each with "input", "expectedOutput", "description"
- StarterCode: valid skeleton code in ${languageLabel}
- Hints: array of 2-3 hints with "text" and "difficulty" (light|medium|heavy)
- NO markdown, NO extra text, ONLY JSON`;

  const userPrompt = `Generate ${count} ${difficulty} ${languageLabel} problem(s) on topic: "${topic}"
Level: ${proficiencyLevel}
Ensure difficulty matches level and topic. Focus on practical, real-world scenarios.`;

  try {
    const message = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      temperature: 0.6,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    });

    const content = message.choices?.[0]?.message?.content || '{}';
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      const jsonObjectMatch = content.match(/\{[\s\S]*"questions"[\s\S]*\}/);
      if (jsonObjectMatch) {
        parsed = JSON.parse(jsonObjectMatch[0]);
      } else {
        throw new Error('No valid JSON found');
      }
    }

    if (!Array.isArray(parsed.questions)) {
      throw new Error('Invalid questions structure');
    }

    return parsed.questions.map((q, idx) => ({
      title: (q?.title || `${topic} - ${difficulty}`).toString().slice(0, 120),
      description: (q?.description || 'Solve this problem').toString().slice(0, 500),
      explanation: (q?.description || 'Write solution').toString().slice(0, 500),
      topic,
      difficulty,
      starterCode: (q?.starterCode || `// ${topic} - ${difficulty}\n`).toString(),
      testCases: Array.isArray(q?.testCases) ? q.testCases.map(tc => ({
        input: (tc?.input || '').toString().slice(0, 200),
        expectedOutput: (tc?.expectedOutput || '').toString().slice(0, 200),
        description: (tc?.description || 'test').toString().slice(0, 100),
      })) : [],
      hints: Array.isArray(q?.hints) ? q.hints.map(h => ({
        hint: (h?.text || h?.hint || '').toString().slice(0, 150),
        difficulty: h?.difficulty || 'light',
      })) : [],
      proficiencyLevel,
      draftCode: '',
      lastFeedback: '',
      lastFeedbackScore: null,
      lastWorkedAt: null,
      attempts: 0,
      completedAt: null,
    }));
  } catch (error) {
    console.warn(`Failed to generate questions for ${topic}/${difficulty}:`, error.message);
    return [];
  }
}

/**
 * Generate MCQ questions for a learning path stage
 */
async function generateMCQQuestions(language, proficiencyLevel, topic, difficulty, count = 3) {
  if (!groqClient) {
    return generateFallbackMCQQuestions(language, proficiencyLevel, topic, difficulty, count);
  }

  const languageLabel = LANGUAGE_LABELS[language] || language;
  
  const systemPrompt = `You are an expert programming educator creating MCQ questions.
Generate exactly ${count} multiple choice questions about "${topic}" for ${proficiencyLevel} level ${language} students.

DIFFICULTY GUIDELINES:
- Easy: Basic syntax, fundamental concepts, straightforward answer
- Medium: Requires understanding, some logic, common mistakes included
- Hard: Complex scenarios, edge cases, requires deep understanding

EACH QUESTION MUST HAVE:
- Clear, unambiguous question
- 4 options (A, B, C, D)
- Only one correct answer
- A helpful explanation

Return ONLY valid JSON:
{
  "questions": [
    {
      "question": "Question text here",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "correct": "A",
      "explanation": "Why A is correct and why others aren't"
    }
  ]
}`;

  const difficultyMap = {
    easy: 'basic syntax and simple concepts',
    medium: 'combines concepts and requires logic',
    hard: 'edge cases, optimization, and advanced thinking'
  };

  const userPrompt = `Generate ${count} ${difficulty} MCQ questions on "${topic}" for ${proficiencyLevel} level ${language} learners.

Focus: ${difficultyMap[difficulty]}
Include realistic code examples where relevant.
Make the questions practical and educational.
Do NOT include trick questions - all questions should have one clearly correct answer.`;

  try {
    console.log(`📝 Generating ${count} MCQ questions: ${topic}/${difficulty}`);
    
    const message = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    });

    const content = message.choices?.[0]?.message?.content || '{}';
    let jsonStr = content;
    
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      const jsonObjectMatch = content.match(/\{[\s\S]*"questions"[\s\S]*\}/);
      if (jsonObjectMatch) {
        parsed = JSON.parse(jsonObjectMatch[0]);
      } else {
        throw new Error('No valid JSON found');
      }
    }

    if (!Array.isArray(parsed.questions)) {
      throw new Error('Invalid questions structure');
    }

    return parsed.questions.slice(0, count).map((q, idx) => ({
      question: (q?.question || 'Question').toString().slice(0, 500),
      options: {
        A: (q?.options?.A || 'Option A').toString().slice(0, 200),
        B: (q?.options?.B || 'Option B').toString().slice(0, 200),
        C: (q?.options?.C || 'Option C').toString().slice(0, 200),
        D: (q?.options?.D || 'Option D').toString().slice(0, 200),
      },
      correctAnswer: String(q?.correct || q?.correct_answer || 'A').toUpperCase()[0],
      explanation: (q?.explanation || 'See course materials for more details').toString().slice(0, 300),
    }));
  } catch (error) {
    console.warn(`⚠️ MCQ generation failed:`, error.message);
    return generateFallbackMCQQuestions(language, proficiencyLevel, topic, difficulty, count);
  }
}

/**
 * Fallback MCQ questions
 */
function generateFallbackMCQQuestions(language, proficiencyLevel, topic, difficulty, count = 3) {
  const templates = {
    Variables: [
      {
        question: 'What is a variable?',
        options: {
          A: 'A named container that stores a value',
          B: 'A function that returns values',
          C: 'A type of loop in programming',
          D: 'A syntax error'
        },
        correctAnswer: 'A',
        explanation: 'Variables are containers for storing data values with a name.'
      },
      {
        question: 'Which is a valid variable name in most programming languages?',
        options: {
          A: '2myvar',
          B: 'my-var',
          C: 'my_var',
          D: 'my.var'
        },
        correctAnswer: 'C',
        explanation: 'Variable names should start with a letter or underscore, and can contain letters, numbers, and underscores.'
      },
      {
        question: 'What happens if you use a variable before declaring it?',
        options: {
          A: 'It automatically gets a default value',
          B: 'You get an error (undefined/not declared)',
          C: 'It creates the variable automatically',
          D: 'Nothing happens'
        },
        correctAnswer: 'B',
        explanation: 'In most languages, using an undeclared variable causes an error.'
      }
    ],
    Loops: [
      {
        question: 'How many times does this loop execute? for(let i=0; i<5; i++)',
        options: {
          A: '4 times',
          B: '5 times',
          C: '6 times',
          D: 'Infinite times'
        },
        correctAnswer: 'B',
        explanation: 'The loop runs while i is less than 5 (0,1,2,3,4), so 5 times total.'
      },
      {
        question: 'What is the difference between while and for loops?',
        options: {
          A: 'While loops are faster',
          B: 'For loops are for counting, while loops for conditions',
          C: 'No real difference',
          D: 'While loops can\'t be exited'
        },
        correctAnswer: 'B',
        explanation: 'For loops are typically used for counted iterations, while loops for condition-based iterations.'
      },
      {
        question: 'Which keyword exits a loop immediately?',
        options: {
          A: 'exit',
          B: 'stop',
          C: 'break',
          D: 'return'
        },
        correctAnswer: 'C',
        explanation: 'The break keyword immediately exits the current loop.'
      }
    ],
    Functions: [
      {
        question: 'What is a function?',
        options: {
          A: 'A block of reusable code',
          B: 'A mathematical operation',
          C: 'A type of variable',
          D: 'A loop structure'
        },
        correctAnswer: 'A',
        explanation: 'Functions are reusable blocks of code that perform specific tasks.'
      },
      {
        question: 'What does a return statement do?',
        options: {
          A: 'It ends the program',
          B: 'It sends a value back to the caller',
          C: 'It creates a new function',
          D: 'It deletes a variable'
        },
        correctAnswer: 'B',
        explanation: 'The return statement returns a value from a function to the code that called it.'
      },
      {
        question: 'Can a function call itself?',
        options: {
          A: 'No, that causes an error',
          B: 'Yes, this is called recursion',
          C: 'Only in advanced languages',
          D: 'Only once'
        },
        correctAnswer: 'B',
        explanation: 'A function can call itself, which is called recursion.'
      }
    ]
  };

  const topicQuestions = templates[topic] || templates['Variables'];
  return topicQuestions.slice(0, count);
}

/**
 * AI Agent - Explain and break down questions using Groq
 * Provides concept explanations, problem breakdowns, hints, and feedback
 */
async function getAIAgentExplanation({ question, description, language, proficiencyLevel, userQuery, taskCompleted, action }) {
  if (!groqClient) {
    return {
      explanation: '❌ AI Agent not available. Please ensure GROQ_API_KEY is configured.',
      suggestions: []
    };
  }

  const systemPrompt = `You are an expert programming tutor for a ${language} learner at the ${proficiencyLevel} level.

You are helping the student with this specific task:
TITLE: "${question}"
DESCRIPTION: ${description}

GUIDELINES:
- Begin by restating, in one short sentence, what this task ("${question}") is asking.
- Reply in clean, well-structured GitHub-flavored Markdown: use **bold** for key terms, short paragraphs, and "-" bullet lists. Keep it scannable.
- Be clear, concise, and encouraging; pitch the depth at the ${proficiencyLevel} level.
- Focus on building understanding. Do NOT write the full working solution unless the student explicitly asks for it — small illustrative snippets are fine.
- Put any code in fenced \`\`\`${language} code blocks.
- End with a short "**Suggestions:**" section of 2-3 bullet tips when useful.

IMPORTANT: Respond with the explanation ONLY, as plain Markdown text. Do NOT wrap it in JSON, and do NOT output a JSON object.`;

  let userPrompt = '';

  switch (action) {
    case 'explain':
   userPrompt = `Help me understand the important concepts in this problem:

Title: ${question}
Description: ${description}
Language: ${language}
Level: ${proficiencyLevel}

What are the key concepts I need to know? Break down the important ideas and explain them clearly.`;
      break;
      
    case 'breakdown':
      userPrompt = `Break down this problem into simple steps:

Title: ${question}
Description: ${description}
Language: ${language}

Show me the thinking process step-by-step. What should I consider first, second, etc?`;
      break;
      
    case 'hints':
      userPrompt = `Give me strategic hints for solving this problem:

Title: ${question}
Description: ${description}
Language: ${language}

Provide 3-4 hints that guide me WITHOUT giving away the solution. Help me think through the problem.`;
      break;
      
    case 'feedback':
      userPrompt = `Now that I've completed this task: ${question}

Give me feedback on my learning. What concepts did I practice? Suggest ways I could improve or optimize my approach.`;
      break;
      
    default:
      userPrompt = `Help me understand this programming question:

Title: ${question}
Description: ${description}
Language: ${language}
Level: ${proficiencyLevel}

User Question: ${userQuery}

Provide a helpful, clear explanation at the ${proficiencyLevel} level.`;
  }

  try {
    console.log(`🤖 AI Agent: ${action || 'general'} explanation for "${question}"`);
    
    const message = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    });

    const content = message.choices?.[0]?.message?.content || '';

    // The model is asked for plain Markdown, but be defensive: strip an
    // accidental ```json / ```markdown wrapper and unwrap legacy JSON output.
    let explanation = content.trim();
    let suggestions = [];

    const fenced = explanation.match(/^```(?:json|markdown)?\s*([\s\S]*?)\s*```$/);
    if (fenced) {
      explanation = fenced[1].trim();
    }

    if (explanation.startsWith('{') && explanation.endsWith('}')) {
      try {
        const parsed = JSON.parse(explanation);
        if (parsed.explanation) {
          explanation = String(parsed.explanation).trim();
          if (Array.isArray(parsed.suggestions)) suggestions = parsed.suggestions;
        }
      } catch {
        // Not valid JSON — keep the raw text as-is.
      }
    }

    console.log(`✅ AI Agent response generated`);

    return {
      explanation: explanation || 'Unable to generate explanation. Please try again.',
      suggestions,
    };
  } catch (error) {
    console.error('❌ AI Agent error:', error.message);
    
    return {
      explanation: `I encountered an error generating the explanation. Please try again. Error: ${error.message}`,
      suggestions: ['Check your internet connection', 'Try rephrasing your question', 'Contact support if the issue persists']
    };
  }
}

/* ────────────────────────────────────────────────────────────────────────
 * End-of-cycle quiz generation (7 MCQs + 3 coding questions)
 * Built from the tasks the learner just completed, used to gate progression.
 * ──────────────────────────────────────────────────────────────────────── */

function normalizeQuizCoding(q, language, index) {
  return {
    questionId: `${language}-quiz-${index + 1}`,
    title: (q?.title || `Coding Challenge ${index + 1}`).toString().slice(0, 120),
    description: (q?.description || 'Solve the coding problem.').toString().slice(0, 500),
    starterCode: (q?.starterCode || `// Write your solution here\n`).toString(),
    difficulty: q?.difficulty || 'medium',
    topic: q?.topic || 'Functions',
    testCases: Array.isArray(q?.testCases)
      ? q.testCases.slice(0, 3).map((tc) => ({
          input: (tc?.input || '').toString().slice(0, 500),
          expectedOutput: (tc?.expectedOutput || '').toString().slice(0, 500),
          description: (tc?.description || 'Test case').toString().slice(0, 200),
        }))
      : [],
    hints: Array.isArray(q?.hints)
      ? q.hints.slice(0, 3).map((h) => ({
          hint: (h?.text || h?.hint || '').toString().slice(0, 200),
          difficulty: ['light', 'medium', 'heavy'].includes(h?.difficulty) ? h.difficulty : 'light',
        }))
      : [],
  };
}

function assembleFallbackMCQs(language, proficiencyLevel, count) {
  const topics = ['Variables', 'Loops', 'Functions', 'Arrays'];
  let out = [];
  for (const t of topics) {
    if (out.length >= count) break;
    out = out.concat(generateFallbackMCQQuestions(language, proficiencyLevel, t, 'easy', count));
  }
  return out.slice(0, count).map((q) => ({
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || '',
    topic: '',
  }));
}

async function generateQuizMCQs(language, proficiencyLevel, topicList, titles, count = 7) {
  if (!groqClient) {
    return assembleFallbackMCQs(language, proficiencyLevel, count);
  }

  const languageLabel = LANGUAGE_LABELS[language] || language;
  const systemPrompt = `You are an expert programming educator building a review quiz.
Generate exactly ${count} multiple choice questions for ${proficiencyLevel} level ${languageLabel} learners.
The questions must review the concepts behind these topics: ${topicList}.

EACH QUESTION MUST HAVE: a clear question, 4 options (A, B, C, D), exactly one correct answer, and a short explanation.
Return ONLY valid JSON:
{
  "questions": [
    { "question": "...", "options": {"A":"..","B":"..","C":"..","D":".."}, "correct": "A", "explanation": ".." }
  ]
}`;
  const userPrompt = `Create ${count} MCQs for ${proficiencyLevel} ${languageLabel} learners covering: ${topicList}.
Review the concepts practiced in problems like: ${titles.slice(0, 10).join('; ') || 'core fundamentals'}.
Mix easy and medium difficulty. Each must have exactly one clearly correct answer. Output JSON only.`;

  try {
    const message = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 3000,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const content = message.choices?.[0]?.message?.content || '{}';
    let jsonStr = content;
    const m = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (m) jsonStr = m[1];

    let parsed;
    try {
      parsed = cleanAndFixJSON(jsonStr);
    } catch {
      const o = content.match(/\{[\s\S]*"questions"[\s\S]*\}/);
      if (!o) throw new Error('No JSON found');
      parsed = cleanAndFixJSON(o[0]);
    }
    if (!Array.isArray(parsed.questions)) throw new Error('Bad MCQ structure');

    let mcqs = parsed.questions.slice(0, count).map((q) => ({
      question: (q?.question || 'Question').toString().slice(0, 500),
      options: {
        A: (q?.options?.A || 'Option A').toString().slice(0, 200),
        B: (q?.options?.B || 'Option B').toString().slice(0, 200),
        C: (q?.options?.C || 'Option C').toString().slice(0, 200),
        D: (q?.options?.D || 'Option D').toString().slice(0, 200),
      },
      correctAnswer: String(q?.correct || q?.correct_answer || 'A').toUpperCase()[0],
      explanation: (q?.explanation || '').toString().slice(0, 300),
      topic: (q?.topic || '').toString().slice(0, 60),
    }));

    if (mcqs.length < count) {
      mcqs = mcqs.concat(assembleFallbackMCQs(language, proficiencyLevel, count - mcqs.length));
    }
    return mcqs.slice(0, count);
  } catch (error) {
    console.warn(`⚠️ Quiz MCQ generation failed: ${error.message}`);
    return assembleFallbackMCQs(language, proficiencyLevel, count);
  }
}

async function generateQuizCoding(language, proficiencyLevel, topicList, count = 3) {
  let raw = [];
  if (groqClient) {
    raw = await requestQuestionBatch({
      language,
      proficiencyLevel,
      focusAreas: topicList,
      assessmentScore: 60,
      count,
      difficultyTier: 'medium',
    });
  }
  if (raw.length < count) {
    raw = raw.concat(generateFallbackQuestions(language, proficiencyLevel, new Map(), count - raw.length));
  }
  return raw.slice(0, count).map((q, i) => normalizeQuizCoding(q, language, i));
}

/**
 * Build a full end-of-cycle quiz from the completed tasks.
 * Returns { mcqs: [7], codingQuestions: [3] }.
 */
async function generateCycleQuiz(language, proficiencyLevel, completedTasks = []) {
  const topics = [...new Set(completedTasks.map((t) => t.topic).filter(Boolean))];
  const titles = completedTasks.map((t) => t.title).filter(Boolean);
  const topicList = topics.length ? topics.join(', ') : 'core programming concepts';

  console.log(`🧩 Generating cycle quiz for ${language} (${proficiencyLevel}) covering: ${topicList}`);

  const [mcqs, codingQuestions] = await Promise.all([
    generateQuizMCQs(language, proficiencyLevel, topicList, titles, 7),
    generateQuizCoding(language, proficiencyLevel, topicList, 3),
  ]);

  console.log(`✅ Quiz ready: ${mcqs.length} MCQs + ${codingQuestions.length} coding questions`);
  return { mcqs, codingQuestions };
}

module.exports = {
  generatePersonalizedTasks,
  evaluateCodeWithAI,
  analyzeWeakTopics,
  generateStructuredLearningPath,
  generateQuestionsForTopic,
  generateMCQQuestions,
  getAIAgentExplanation,
  generateCycleQuiz,
};
