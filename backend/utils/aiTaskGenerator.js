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

RULES:
1. Return ONLY valid JSON with key "questions" containing exactly 5 problem objects
2. Each problem must have: title, description, difficulty, topic, starterCode, testCases, hints
3. Problems progress from easy to hard
4. Each problem should focus on ONE specific concept
5. testCases: array with at least 2-3 items, each with: input (string), expectedOutput (string), description
6. starterCode must be valid, runnable skeleton code specific to ${languageLabel}
7. Focus on ${focusAreas}
8. Include 2-3 helpful hints per problem
9. Output NOTHING except the JSON object`;

  const userPrompt = `Generate 5 REAL ${languageLabel} coding problems for a ${proficiencyLevel} level learner.

Student Performance:
- Overall Score: ${assessmentScore}%
- Weak Areas: ${focusAreas}

Requirements for each problem:
1. Real, practical problem (not abstract)
2. Clear problem statement with examples
3. 2-3 test cases with input/output
4. Appropriate difficulty level
5. Starter code (valid skeleton)
6. 2-3 helpful hints

Generate 5 such problems. Focus on concepts they struggled with.
Return strict JSON with key "questions".`;

  try {
    console.log('📡 Calling Groq API for real questions...');
    console.log(`   Model: mixtral-8x7b-32768`);
    console.log(`   Language: ${language}`);
    
    const message = await groqClient.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    });

    const content = message.choices?.[0]?.message?.content || '{}';
    console.log(`✅ Groq API response received (${content.length} chars)`);
    
    // Extract JSON if wrapped in markdown code blocks
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
      console.log(`📝 Extracted JSON from markdown code block`);
    }

    // Try to parse the JSON
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('   JSON parse error:', parseError.message);
      // Try to find JSON object in the content
      const jsonObjectMatch = content.match(/\{[\s\S]*"questions"[\s\S]*\}/);
      if (jsonObjectMatch) {
        console.log('   Trying to extract JSON object from content...');
        parsed = JSON.parse(jsonObjectMatch[0]);
      } else {
        throw new Error('Could not parse JSON response from Groq');
      }
    }
    
    if (!parsed.questions || parsed.questions.length === 0) {
      throw new Error('No questions in response');
    }

    const questions = normalizeRealQuestions(parsed.questions, language, proficiencyLevel, weakTopics);
    console.log(`✅ [SUCCESS] Generated ${questions.length} REAL questions from Groq API`);
    questions.forEach((q, idx) => {
      console.log(`   ${idx + 1}. ${q.title} (${q.difficulty}) - ${q.testCases?.length || 0} test cases`);
    });
    return questions;
  } catch (error) {
    console.error('❌ Real questions generation error:', error.message);
    console.error('   Stack:', error.stack?.split('\n')[0]);
    console.log('⚠️ Falling back to template questions');
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
    const message = await groqClient.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      max_tokens: 1000,
      temperature: 0.3,
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

    const parsed = JSON.parse(jsonStr);
    let qualityScore = Math.min(10, Math.max(1, Number(parsed.qualityScore) || 5));
    
    // Boost score if test cases are handled well
    if (qualityScore >= 7 && parsed.feedback?.toLowerCase().includes('pass')) {
      qualityScore = Math.min(10, qualityScore + 1);
    }

    return {
      feedback: parsed.feedback || 'Good attempt. Consider edge cases and code clarity.',
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.slice(0, 3)
        : ['Handle edge cases', 'Add error handling', 'Improve code clarity'],
      qualityScore: qualityScore,
    };
  } catch (error) {
    console.error('❌ Code evaluation error:', error.message);
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

module.exports = {
  generatePersonalizedTasks,
  evaluateCodeWithAI,
  analyzeWeakTopics,
};
