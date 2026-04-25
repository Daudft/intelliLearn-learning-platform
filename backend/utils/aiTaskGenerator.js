const Groq = require('groq-sdk');

const groqClient = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const LANGUAGE_LABELS = {
  python: 'Python',
  java: 'Java',
  c: 'C Language',
};

/**
 * Analyze assessment results to identify weak topics
 * @param {Object} topicBreakdown - Map of topics with correct/total counts
 * @returns {Array} Array of weak topics sorted by weakness
 */
function analyzeWeakTopics(topicBreakdown) {
  if (!topicBreakdown || topicBreakdown.size === 0) {
    return [];
  }

  const weakTopics = [];

  topicBreakdown.forEach((stats, topic) => {
    const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    
    // Topics with < 70% accuracy are weak
    if (accuracy < 70) {
      weakTopics.push({
        topic,
        accuracy,
        correct: stats.correct,
        total: stats.total,
        weakness: 100 - accuracy, // Higher = weaker
      });
    }
  });

  // Sort by weakness (descending)
  return weakTopics.sort((a, b) => b.weakness - a.weakness);
}

/**
 * Generate personalized coding tasks based on assessment performance
 * Uses Groq API for fast, free generation
 */
async function generatePersonalizedTasks(language, proficiencyLevel, topicBreakdown, assessmentScore) {
  if (!groqClient) {
    console.warn('⚠️ Groq API not configured. Using fallback tasks.');
    return generateFallbackTasks(language, proficiencyLevel, topicBreakdown);
  }

  const weakTopics = analyzeWeakTopics(topicBreakdown);
  const languageLabel = LANGUAGE_LABELS[language] || language;

  // Build focus areas description
  let focusAreas = 'fundamentals';
  if (weakTopics.length > 0) {
    focusAreas = weakTopics.slice(0, 3).map(t => t.topic).join(', ');
  }

  console.log(`🎯 Weak topics identified: ${focusAreas}`);

  const systemPrompt = `You are an expert coding curriculum designer specializing in personalized learning paths.
Generate exactly 5 progressive coding tasks tailored to the student's needs.

RULES:
1. Return ONLY valid JSON with key "tasks" containing exactly 5 task objects
2. Each task must have: title, description, explanation, starterCode, hints
3. Tasks should progress from easy to hard
4. Focus on ${focusAreas} concepts
5. Keep descriptions practical and encouraging
6. Make starter code runnable as-is
7. Include 2-3 helpful hints per task
8. Output NOTHING except the JSON object`;

  const userPrompt = `Generate 5 ${languageLabel} coding tasks for a ${proficiencyLevel} level student.

Assessment Performance:
- Overall Score: ${assessmentScore}% 
- Weak Topics: ${focusAreas}

Focus the tasks on building confidence in these weak areas while maintaining progression.
Each task should be solvable in 10-20 minutes.

Return strict JSON with key "tasks" as array of 5 items.
Each item: { title, description, explanation, starterCode, hints: [{text, difficulty: 'light'|'medium'|'heavy'}] }`;

  try {
    console.log('📡 Calling Groq API...');
    const message = await groqClient.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      max_tokens: 3000,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    });

    const content = message.choices?.[0]?.message?.content || '{}';
    
    // Extract JSON if wrapped in markdown code blocks
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    console.log('✅ Groq API response received');
    const parsed = JSON.parse(jsonStr);
    const tasks = normalizeAiTasks(parsed.tasks, language, proficiencyLevel);
    console.log(`✅ Generated ${tasks.length} personalized tasks`);
    return tasks;
  } catch (error) {
    console.error('❌ Groq task generation error:', error.message);
    console.log('⚠️ Falling back to template tasks');
    return generateFallbackTasks(language, proficiencyLevel, topicBreakdown);
  }
}

/**
 * Evaluate student code using Groq AI
 */
async function evaluateCodeWithAI({ language, proficiencyLevel, taskTitle, taskDescription, code }) {
  if (!groqClient) {
    return {
      feedback:
        'AI evaluation not available. Review your code for logic errors, edge cases, and code style.',
      suggestions: [
        'Handle edge cases and invalid inputs.',
        'Add comments for complex logic.',
        'Test with multiple inputs.',
      ],
      qualityScore: 5,
    };
  }

  const systemPrompt = `You are an expert code reviewer. Analyze the code and provide constructive feedback.
Return ONLY valid JSON with keys: feedback (string), suggestions (array of 2-3 strings), qualityScore (1-10).
Be encouraging but honest about improvements needed.`;

  const userPrompt = `Review this ${language} code for the task "${taskTitle}":

Task Description: ${taskDescription}
Proficiency Level: ${proficiencyLevel}

Code:
\`\`\`${language}
${code}
\`\`\`

Provide feedback as JSON only.`;

  try {
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
    return {
      feedback: parsed.feedback || 'Good attempt. Focus on edge cases and code clarity.',
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.slice(0, 3)
        : ['Test edge cases', 'Add comments', 'Refactor for clarity'],
      qualityScore: Math.min(10, Math.max(1, Number(parsed.qualityScore) || 5)),
    };
  } catch (error) {
    console.error('❌ Code evaluation error:', error.message);
    return {
      feedback: 'Review completed. Consider edge cases and code clarity.',
      suggestions: ['Test with boundary inputs', 'Add error handling', 'Improve readability'],
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
