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
async function generateRealQuestions(language, proficiencyLevel, topicBreakdown, assessmentScore) {
  if (!groqClient) {
    console.warn('⚠️ Groq API not configured. Using fallback questions.');
    return generateFallbackQuestions(language, proficiencyLevel, topicBreakdown);
  }

  const weakTopics = analyzeWeakTopics(topicBreakdown);
  const languageLabel = LANGUAGE_LABELS[language] || language;

  // Build focus areas description
  let focusAreas = 'fundamentals';
  if (weakTopics.length > 0) {
    focusAreas = weakTopics.slice(0, 3).map(t => t.topic).join(', ');
  }

  console.log(`🎯 [REAL QUESTIONS] Generating for: ${languageLabel} (${proficiencyLevel})`);
  console.log(`📍 Focus areas: ${focusAreas}`);
  console.log(`📊 Assessment score: ${assessmentScore}%`);

  const systemPrompt = `You are an expert programming problem setter like those on LeetCode or HackerRank.
Generate exactly 5 REAL, SOLVABLE programming problems with clear test cases.
CRITICAL: Problems must be appropriate for the specified proficiency level.

LEVEL GUIDELINES:
- Beginner (0-40% score): Simple syntax, basic concepts, no complex logic, single function problems
  Examples: sum array, reverse string, find max, check palindrome, count elements
  NO: recursion, OOP, algorithms, nested loops, complex data structures
  
- Intermediate (41-70% score): Logic puzzles, small programs, basic algorithms, debugging
  Examples: sorting, searching, string manipulation, simple OOP, basic recursion
  NO: advanced algorithms, optimization, complex design patterns
  
- Advanced (71-100% score): Algorithms, optimization, OOP design, complex problems
  Examples: advanced data structures, algorithms, system design thinking, optimization

RULES:
1. Return ONLY valid JSON with key "questions" containing exactly 5 problem objects
2. Each problem must have: title, description, difficulty, topic, starterCode, testCases, hints
3. Problems progress from easy to harder within level
4. Each problem should focus on ONE specific concept
5. testCases: array with at least 2-3 items, each with: input (string), expectedOutput (string), description
6. starterCode must be valid, runnable skeleton code specific to ${languageLabel}
7. Include 2-3 helpful hints per problem (light, medium, heavy)
8. Output NOTHING except the JSON object - no markdown, no explanations`;

  const levelGuidelines = {
    Beginner: 'Problems should be simple syntax exercises. Use basic variables, loops, and if statements. NO recursion or complex data structures.',
    Intermediate: 'Problems should include logic puzzles, simple algorithms like sorting/searching, basic OOP concepts, and simple recursion.',
    Advanced: 'Problems should cover advanced algorithms, optimization, complex OOP patterns, and require algorithmic thinking.',
  };

  const userPrompt = `Generate 5 REAL ${languageLabel} coding problems for a ${proficiencyLevel} level learner.

PROFICIENCY LEVEL: ${proficiencyLevel}
${levelGuidelines[proficiencyLevel]}

Student Performance:
- Overall Score: ${assessmentScore}%
- Weak Areas to Focus On: ${focusAreas || 'fundamentals'}

For EACH problem:
1. Difficulty should match ${proficiencyLevel} level (easy, medium, or hard within this level)
2. Create a REAL practical problem (not abstract exercises)
3. Provide clear problem statement with input/output examples
4. Include 2-3 test cases with actual input/output values
5. Write working starter code (skeleton) they can build on
6. Add 2-3 progressive hints (light → medium → heavy)
7. Focus on weak areas when possible

IMPORTANT: Do NOT exceed the ${proficiencyLevel} level complexity. Better to be simpler than too complex.

Return JSON object with key "questions" containing array of 5 problem objects.
Structure: {
  "questions": [
    {
      "title": "Problem Title",
      "description": "Problem description with example",
      "difficulty": "easy|medium|hard",
      "topic": "Variables|Loops|Functions|Arrays|etc",
      "starterCode": "code skeleton",
      "testCases": [{"input": "example input", "expectedOutput": "example output", "description": "what this tests"}],
      "hints": [{"text": "hint 1", "difficulty": "light"}, ...]
    }
  ]
}`;

  try {
    console.log('📡 Calling Groq API for real questions...');
    console.log(`   Model: llama-3.3-70b-versatile`);
    console.log(`   Language: ${language}`);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const message = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    });

    clearTimeout(timeoutId);

    const content = message.choices?.[0]?.message?.content || '{}';
    console.log(`✅ Groq API response received (${content.length} chars)`);
    
    // Extract JSON if wrapped in markdown code blocks
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
      console.log(`📝 Extracted JSON from markdown code block`);
    }

    // Try to parse the JSON with automatic cleaning
    let parsed;
    try {
      parsed = cleanAndFixJSON(jsonStr);
    } catch (parseError) {
      console.error('   JSON parse error:', parseError.message);
      // Try to find JSON object in the content
      const jsonObjectMatch = content.match(/\{[\s\S]*"questions"[\s\S]*\}/);
      if (jsonObjectMatch) {
        console.log('   Trying to extract JSON object from content...');
        try {
          parsed = cleanAndFixJSON(jsonObjectMatch[0]);
        } catch (e2) {
          console.error('   Failed to parse extracted JSON:', e2.message);
          throw new Error('Could not parse JSON response from Groq');
        }
      } else {
        throw new Error('Could not find JSON object in Groq response');
      }
    }
    
    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('No questions array in response or empty');
    }

    const questions = normalizeRealQuestions(parsed.questions, language, proficiencyLevel, weakTopics);
    console.log(`✅ [SUCCESS] Generated ${questions.length} REAL questions from Groq API`);
    questions.forEach((q, idx) => {
      console.log(`   ${idx + 1}. "${q.title}" (${q.difficulty}) - Topic: ${q.topic} - ${q.testCases?.length || 0} test cases`);
    });
    return questions;
  } catch (error) {
    console.error('❌ Real questions generation error:', error.message);
    console.error('   Retrying with fallback questions...');
    console.log('⚠️ Using template questions as fallback');
    return generateFallbackQuestions(language, proficiencyLevel, topicBreakdown);
  }
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

  return questions.slice(0, 5).map((q, index) => {
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
function generateFallbackQuestions(language, proficiencyLevel, topicBreakdown) {
  const label = LANGUAGE_LABELS[language] || language;
  const weakTopics = analyzeWeakTopics(topicBreakdown);
  
  const templates = {
    python: [
      {
        title: 'Sum of Array Elements',
        description: 'Write a function that returns the sum of all elements in an array.',
        topic: 'Arrays',
        difficulty: 'easy',
        starterCode: 'def sum_array(arr):\n    # Return sum of all elements\n    pass',
        testCases: [
          { input: '[1, 2, 3]', expectedOutput: '6', description: 'Basic sum' },
          { input: '[0]', expectedOutput: '0', description: 'Single element' },
        ],
      },
      {
        title: 'Reverse a String',
        description: 'Write a function that reverses a given string.',
        topic: 'Functions',
        difficulty: 'easy',
        starterCode: 'def reverse_string(s):\n    # Return reversed string\n    pass',
        testCases: [
          { input: '"hello"', expectedOutput: '"olleh"', description: 'Basic string' },
          { input: '""', expectedOutput: '""', description: 'Empty string' },
        ],
      },
      {
        title: 'Find Maximum Number',
        description: 'Find and return the maximum number in a list.',
        topic: 'Arrays',
        difficulty: 'easy',
        starterCode: 'def find_max(arr):\n    # Return maximum element\n    pass',
        testCases: [
          { input: '[1, 5, 3]', expectedOutput: '5', description: 'Basic max' },
          { input: '[10]', expectedOutput: '10', description: 'Single element' },
        ],
      },
      {
        title: 'Check Palindrome',
        description: 'Check if a string is a palindrome (reads same forwards and backwards).',
        topic: 'Functions',
        difficulty: 'medium',
        starterCode: 'def is_palindrome(s):\n    # Return True if palindrome, False otherwise\n    pass',
        testCases: [
          { input: '"racecar"', expectedOutput: 'True', description: 'Valid palindrome' },
          { input: '"hello"', expectedOutput: 'False', description: 'Not palindrome' },
        ],
      },
      {
        title: 'Sort Array',
        description: 'Sort an array in ascending order.',
        topic: 'Sorting',
        difficulty: 'medium',
        starterCode: 'def sort_array(arr):\n    # Return sorted array\n    pass',
        testCases: [
          { input: '[3, 1, 4, 1, 5]', expectedOutput: '[1, 1, 3, 4, 5]', description: 'Basic sort' },
          { input: '[]', expectedOutput: '[]', description: 'Empty array' },
        ],
      },
    ],
    java: [
      {
        title: 'Sum of Array Elements',
        description: 'Write a method that returns the sum of all elements in an array.',
        topic: 'Arrays',
        difficulty: 'easy',
        starterCode: 'public int sumArray(int[] arr) {\n    // Return sum\n    return 0;\n}',
        testCases: [
          { input: '[1, 2, 3]', expectedOutput: '6', description: 'Basic sum' },
          { input: '[0]', expectedOutput: '0', description: 'Single element' },
        ],
      },
      {
        title: 'Reverse String',
        description: 'Write a method that reverses a given string.',
        topic: 'Functions',
        difficulty: 'easy',
        starterCode: 'public String reverseString(String s) {\n    // Return reversed string\n    return "";\n}',
        testCases: [
          { input: '"hello"', expectedOutput: '"olleh"', description: 'Basic string' },
          { input: '""', expectedOutput: '""', description: 'Empty string' },
        ],
      },
      {
        title: 'Find Maximum',
        description: 'Find and return the maximum number in an array.',
        topic: 'Arrays',
        difficulty: 'easy',
        starterCode: 'public int findMax(int[] arr) {\n    // Return maximum\n    return 0;\n}',
        testCases: [
          { input: '[1, 5, 3]', expectedOutput: '5', description: 'Basic max' },
          { input: '[10]', expectedOutput: '10', description: 'Single element' },
        ],
      },
      {
        title: 'Check Palindrome',
        description: 'Check if a string is a palindrome.',
        topic: 'Functions',
        difficulty: 'medium',
        starterCode: 'public boolean isPalindrome(String s) {\n    // Return true if palindrome\n    return false;\n}',
        testCases: [
          { input: '"racecar"', expectedOutput: 'true', description: 'Valid palindrome' },
          { input: '"hello"', expectedOutput: 'false', description: 'Not palindrome' },
        ],
      },
      {
        title: 'Bubble Sort',
        description: 'Implement bubble sort algorithm.',
        topic: 'Sorting',
        difficulty: 'medium',
        starterCode: 'public int[] bubbleSort(int[] arr) {\n    // Implement bubble sort\n    return arr;\n}',
        testCases: [
          { input: '[3, 1, 4, 1, 5]', expectedOutput: '[1, 1, 3, 4, 5]', description: 'Basic sort' },
          { input: '[]', expectedOutput: '[]', description: 'Empty array' },
        ],
      },
    ],
    c: [
      {
        title: 'Sum of Array Elements',
        description: 'Write a function that returns the sum of all elements in an array.',
        topic: 'Arrays',
        difficulty: 'easy',
        starterCode: 'int sum_array(int arr[], int n) {\n    // Return sum\n    return 0;\n}',
        testCases: [
          { input: '[1, 2, 3], size=3', expectedOutput: '6', description: 'Basic sum' },
          { input: '[5], size=1', expectedOutput: '5', description: 'Single element' },
        ],
      },
      {
        title: 'Find Maximum',
        description: 'Find and return the maximum number in an array.',
        topic: 'Arrays',
        difficulty: 'easy',
        starterCode: 'int find_max(int arr[], int n) {\n    // Return maximum\n    return 0;\n}',
        testCases: [
          { input: '[1, 5, 3], size=3', expectedOutput: '5', description: 'Basic max' },
          { input: '[10], size=1', expectedOutput: '10', description: 'Single element' },
        ],
      },
      {
        title: 'Count Occurrences',
        description: 'Count occurrences of a specific number in an array.',
        topic: 'Arrays',
        difficulty: 'easy',
        starterCode: 'int count_occurrences(int arr[], int n, int target) {\n    // Return count\n    return 0;\n}',
        testCases: [
          { input: '[1, 2, 2, 3, 2], target=2, size=5', expectedOutput: '3', description: 'Count 2s' },
          { input: '[5, 5, 5], target=5, size=3', expectedOutput: '3', description: 'All same' },
        ],
      },
      {
        title: 'Reverse Array',
        description: 'Reverse the elements of an array in place.',
        topic: 'Arrays',
        difficulty: 'medium',
        starterCode: 'void reverse_array(int arr[], int n) {\n    // Reverse in place\n}',
        testCases: [
          { input: '[1, 2, 3], size=3', expectedOutput: '[3, 2, 1]', description: 'Basic reverse' },
          { input: '[5], size=1', expectedOutput: '[5]', description: 'Single element' },
        ],
      },
      {
        title: 'Linear Search',
        description: 'Find the index of a target element in an array.',
        topic: 'Functions',
        difficulty: 'medium',
        starterCode: 'int linear_search(int arr[], int n, int target) {\n    // Return index or -1\n    return -1;\n}',
        testCases: [
          { input: '[1, 5, 3], target=5, size=3', expectedOutput: '1', description: 'Found at index 1' },
          { input: '[1, 2, 3], target=10, size=3', expectedOutput: '-1', description: 'Not found' },
        ],
      },
    ],
  };

  const langTemplates = templates[language] || templates.python;

  return langTemplates.map((q, index) => ({
    taskId: `${language}-real-${index + 1}`,
    title: q.title,
    description: q.description,
    explanation: `Problem: ${q.description}\n\nApproach: Think step by step. Consider edge cases.`,
    difficulty: q.difficulty,
    topic: q.topic,
    starterCode: q.starterCode,
    testCases: q.testCases || [],
    hints: [
      { hint: 'Read the problem carefully', difficulty: 'light' },
      { hint: 'Start with simple cases', difficulty: 'medium' },
      { hint: 'Think about edge cases', difficulty: 'heavy' },
    ],
    proficiencyLevel,
    order: index + 1,
    status: index === 0 ? 'unlocked' : 'locked',
  }));
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
 * Fallback tasks when AI is not available
 */
function generateFallbackTasks(language, proficiencyLevel, topicBreakdown) {
  const label = LANGUAGE_LABELS[language] || language;
  const weakTopics = analyzeWeakTopics(topicBreakdown);
  const topicStr = weakTopics.length > 0 
    ? `focusing on ${weakTopics[0].topic}`
    : 'to strengthen fundamentals';

  return [
    {
      taskId: `${language}-1`,
      title: `${label} Basic Practice ${topicStr}`,
      description: `Start with simple exercises to build confidence in ${label} fundamentals.`,
      explanation:
        'Read the problem carefully. Write simple, clear code that solves the exact problem. Test with the examples.',
      starterCode: `# Write your ${language} solution here\n`,
      hints: [
        { text: 'Start by understanding what the problem asks', difficulty: 'light' },
        { text: 'Trace through one example by hand first', difficulty: 'medium' },
      ],
      order: 1,
      status: 'unlocked',
    },
    {
      taskId: `${language}-2`,
      title: `${label} Logic Building`,
      description: 'Build confidence with multi-step problems.',
      explanation:
        'Break the problem into smaller parts. Solve each part separately, then combine.',
      starterCode: `# Define your solution here\n`,
      hints: [
        { text: 'What variables do you need?', difficulty: 'light' },
        { text: 'Try a simple case first', difficulty: 'medium' },
      ],
      order: 2,
      status: 'locked',
    },
    {
      taskId: `${language}-3`,
      title: `${label} Problem Solving`,
      description: 'Apply your skills to a slightly more complex problem.',
      explanation:
        'Choose your approach carefully. Verify your logic works before submitting.',
      starterCode: `# Write your solution here\n`,
      hints: [
        { text: 'Consider edge cases', difficulty: 'light' },
        { text: 'What happens with empty input?', difficulty: 'medium' },
      ],
      order: 3,
      status: 'locked',
    },
    {
      taskId: `${language}-4`,
      title: `${label} Optimization Challenge`,
      description: 'Solve efficiently with good code style.',
      explanation:
        'First get it working. Then optimize. Finally, ensure your code is readable.',
      starterCode: `# Optimize your solution here\n`,
      hints: [
        { text: 'Is there a more efficient approach?', difficulty: 'medium' },
        { text: 'Consider time and space complexity', difficulty: 'heavy' },
      ],
      order: 4,
      status: 'locked',
    },
    {
      taskId: `${language}-5`,
      title: `${label} Real-World Application`,
      description: 'Apply your skills to a practical scenario.',
      explanation:
        'Think like you are building actual software. Write clean, documented code.',
      starterCode: `# Build your solution here\n`,
      hints: [
        { text: 'What would a real user expect?', difficulty: 'medium' },
        { text: 'Make your code maintainable', difficulty: 'heavy' },
      ],
      order: 5,
      status: 'locked',
    },
  ];
}

/**
 * Normalize AI-generated tasks to match schema
 */
function normalizeAiTasks(tasks, language, proficiencyLevel) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return generateFallbackTasks(language, proficiencyLevel, new Map());
  }

  return tasks.slice(0, 5).map((task, index) => ({
    taskId: `${language}-${index + 1}`,
    title: (task?.title || `${LANGUAGE_LABELS[language]} Task ${index + 1}`).toString().slice(0, 120),
    description: (task?.description || 'Solve the coding task.').toString().slice(0, 300),
    explanation: (task?.explanation || 'Write clean, tested code.').toString().slice(0, 500),
    starterCode: (task?.starterCode || `# Solution for ${LANGUAGE_LABELS[language]}\n`).toString(),
    hints: Array.isArray(task?.hints)
      ? task.hints.slice(0, 3).map(h => ({
          hint: (h?.text || h?.hint || '').toString().slice(0, 200),
          difficulty: ['light', 'medium', 'heavy'].includes(h?.difficulty) ? h.difficulty : 'light',
        }))
      : [{ hint: 'Break the problem into steps', difficulty: 'light' }],
    draftCode: '',
    lastFeedback: '',
    lastFeedbackScore: null,
    lastWorkedAt: null,
    attempts: 0,
    order: index + 1,
    status: index === 0 ? 'unlocked' : 'locked',
    completedAt: null,
  }));
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

  const systemPrompt = `You are an expert programming tutor and learning assistant.
Your job is to help students understand coding concepts, break down problems, and learn effectively.

GUIDELINES:
- Be clear, concise, and encouraging
- Explain concepts at the appropriate level for ${proficiencyLevel} learners
- Use examples and analogies when helpful
- Focus on understanding, not just giving answers
- When breaking down problems, show the thought process
- Provide practical tips and common mistakes to avoid
- If feedback requested, be constructive and suggest improvements

RESPONSE FORMAT:
Return JSON with:
{
  "explanation": "Your detailed explanation/breakdown/feedback here",
  "suggestions": ["Tip 1", "Tip 2", "Tip 3"]  (optional)
}`;

  let userPrompt = '';

  switch (action) {
    case 'explain':
   userPrompt = `Help me understand the important concepts in this problem:

Title: \${question}
Description: \${description}
Language: \${language}
Level: \${proficiencyLevel}

What are the key concepts I need to know? Break down the important ideas and explain them clearly.\`;
      break;
      
    case 'breakdown':
      userPrompt = \`Break down this problem into simple steps:

Title: \${question}
Description: \${description}
Language: \${language}

Show me the thinking process step-by-step. What should I consider first, second, etc?\`;
      break;
      
    case 'hints':
      userPrompt = \`Give me strategic hints for solving this problem:

Title: \${question}
Description: \${description}
Language: \${language}

Provide 3-4 hints that guide me WITHOUT giving away the solution. Help me think through the problem.\`;
      break;
      
    case 'feedback':
      userPrompt = \`Now that I've completed this task: \${question}

Give me feedback on my learning. What concepts did I practice? Suggest ways I could improve or optimize my approach.\`;
      break;
      
    default:
      userPrompt = \`Help me understand this programming question:

Title: \${question}
Description: \${description}
Language: \${language}
Level: \${proficiencyLevel}

User Question: \${userQuery}

Provide a helpful, clear explanation at the \${proficiencyLevel} level.\`;
  }

  try {
    console.log(\`🤖 AI Agent: \${action || 'general'} explanation for "\${question}"\`);
    
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
    
    // Try to parse as JSON first
    let parsed;
    try {
      // Check if it's wrapped in JSON code blocks
      let jsonStr = content;
      const jsonMatch = content.match(/\`\`\`(?:json)?\s*([\s\S]*?)\s*\`\`\`/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      // If not JSON, treat the whole response as explanation
      parsed = {
        explanation: content,
        suggestions: []
      };
    }

    console.log(\`✅ AI Agent response generated\`);
    
    return {
      explanation: parsed.explanation || content || 'Unable to generate explanation',
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
    };
  } catch (error) {
    console.error('❌ AI Agent error:', error.message);
    
    return {
      explanation: \`I encountered an error generating the explanation. Please try again. Error: \${error.message}\`,
      suggestions: ['Check your internet connection', 'Try rephrasing your question', 'Contact support if the issue persists']
    };
  }
}

module.exports = {
  generatePersonalizedTasks,
  evaluateCodeWithAI,
  analyzeWeakTopics,
  generateStructuredLearningPath,
  generateQuestionsForTopic,
  generateMCQQuestions,
  getAIAgentExplanation,
};
