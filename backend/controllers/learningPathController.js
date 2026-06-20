const LearningPath = require('../models/LearningPath');
const { generatePersonalizedTasks, evaluateCodeWithAI, generateStructuredLearningPath, getAIAgentExplanation } = require('../utils/aiTaskGenerator');

const LANGUAGE_LABELS = {
  python: 'Python',
  java: 'Java',
  c: 'C Language',
};
const LEARNING_PASS_SCORE = Number(process.env.LEARNING_PASS_SCORE || 7);

function getTaskTemplates(language, proficiencyLevel) {
  const label = LANGUAGE_LABELS[language] || language;

  const base = [
    {
      title: `${label} Fundamentals Warmup`,
      description: `Solve small syntax and control-flow drills in ${label}.`,
      explanation:
        'Read the prompt carefully, identify input/output expectations, then code a minimal correct solution before optimizing.',
      starterCode: '// Write your solution here\n',
    },
    {
      title: `${label} Functions And Reuse`,
      description: 'Break a medium problem into reusable functions.',
      explanation:
        'Create one function for each clear responsibility. Use small test cases to validate each function independently.',
      starterCode: '// Define helper functions here\n',
    },
    {
      title: `${label} Arrays And Collections`,
      description: 'Implement collection operations and edge-case handling.',
      explanation:
        'Start with a brute-force version, then improve time complexity. Document assumptions for empty and invalid input.',
      starterCode: '// Handle array/list data here\n',
    },
    {
      title: `${label} Problem Solving Challenge`,
      description: 'Complete a timed challenge with clean code style.',
      explanation:
        'Split the problem into steps, choose a data structure, and verify complexity before writing the final version.',
      starterCode: '// Timed challenge solution\n',
    },
    {
      title: `${label} Mini Project Task`,
      description: 'Build a small practical task and explain your approach.',
      explanation:
        'Focus on readability and testability. Add short comments only around non-obvious logic and share trade-offs.',
      starterCode: '// Mini project entry point\n',
    },
  ];

  if (proficiencyLevel === 'Intermediate') {
    base[0].description = `Solve practical logic tasks in ${label} with stronger edge-case handling.`;
    base[3].description = 'Complete a challenge emphasizing complexity optimization.';
  }

  if (proficiencyLevel === 'Advanced') {
    base[1].description = 'Design modular, extensible functions with clear interfaces.';
    base[4].description = 'Ship a mini project with robust structure and test cases.';
  }

  return base;
}

function buildTasks(language, proficiencyLevel) {
  const templates = getTaskTemplates(language, proficiencyLevel);
  return templates.map((task, index) => ({
    taskId: `${language}-${index + 1}`,
    title: task.title,
    description: task.description,
    explanation: task.explanation,
    starterCode: task.starterCode,
    order: index + 1,
    status: index === 0 ? 'unlocked' : 'locked',
    completedAt: null,
  }));
}

function normalizeAiTasks(tasks, language, proficiencyLevel) {
  if (!Array.isArray(tasks) || !tasks.length) {
    return buildTasks(language, proficiencyLevel);
  }

  return tasks.slice(0, 5).map((task, index) => ({
    taskId: (task?.taskId || `${language}-${index + 1}`).toString(),
    title: (task?.title || `${LANGUAGE_LABELS[language]} Task ${index + 1}`).toString().slice(0, 120),
    description: (task?.description || 'Solve the coding task and verify edge cases.').toString().slice(0, 300),
    explanation: (task?.explanation || 'Analyze the problem and implement a clean solution.').toString(),
    difficulty: task?.difficulty || 'medium',
    topic: task?.topic || 'Functions',
    starterCode: (task?.starterCode || '// Write your solution here\n').toString(),
    testCases: Array.isArray(task?.testCases) ? task.testCases : [],
    hints: Array.isArray(task?.hints) ? task.hints : [],
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

function getLanguagePathAndTask(learningPath, language, taskId) {
  const languagePath = learningPath.paths.find((path) => path.language === language);
  if (!languagePath) {
    return { error: 'Language path not found' };
  }

  const task = languagePath.tasks.find((item) => item.taskId === taskId);
  if (!task) {
    return { error: 'Task not found' };
  }

  return { languagePath, task };
}

async function evaluateCodeWithAi({ language, proficiencyLevel, taskTitle, taskDescription, code, testCases = [] }) {
  // Use AI task generator service which uses Groq
  return await evaluateCodeWithAI({ language, proficiencyLevel, taskTitle, taskDescription, code, testCases });
}

async function ensurePathForLanguage(userId, language, proficiencyLevel, topicBreakdown, assessmentScore) {
  let learningPath = await LearningPath.findOne({ userId });
  
  console.log(`🚀 Generating learning path for ${language} (${proficiencyLevel}) - Score: ${assessmentScore}%`);
  
  // Generate tasks using Groq
  let generatedTasks;
  try {
    console.log(`📡 Attempting to generate personalized tasks via Groq API...`);
    generatedTasks = await generatePersonalizedTasks(
      language,
      proficiencyLevel,
      topicBreakdown || {},
      assessmentScore || 50
    );
    console.log(`✅ Groq generated ${generatedTasks.length} personalized tasks successfully`);
  } catch (groqError) {
    console.error('❌ Groq generation failed:', groqError.message);
    console.warn('⚠️ Falling back to template questions...');
    generatedTasks = generateFallbackQuestions(language, proficiencyLevel, topicBreakdown || {});
    console.log(`✅ Using ${generatedTasks.length} fallback template tasks`);
  }

  console.log(`📚 Generated ${generatedTasks.length} tasks for user`);

  if (!learningPath) {
    learningPath = await LearningPath.create({
      userId,
      paths: [
        {
          language,
          proficiencyLevel,
          tasks: generatedTasks,
        },
      ],
    });

    console.log(`✅ New learning path created for user ${userId}`);
    return learningPath;
  }

  const existing = learningPath.paths.find((path) => path.language === language);
  if (!existing) {
    learningPath.paths.push({
      language,
      proficiencyLevel,
      tasks: generatedTasks,
      createdAt: new Date(),
    });
    learningPath.updatedAt = new Date();
    await learningPath.save();
    console.log(`✅ New language path added for ${language}`);
    return learningPath;
  }

  if (existing.proficiencyLevel !== proficiencyLevel) {
    existing.proficiencyLevel = proficiencyLevel;
    existing.tasks = generatedTasks;
    learningPath.updatedAt = new Date();
    await learningPath.save();
    console.log(`✅ Learning path updated for ${language}`);
  }

  return learningPath;
}

exports.ensurePathForLanguage = ensurePathForLanguage;

exports.getLearningPath = async (req, res) => {
  try {
    const { userId } = req.params;

    const learningPath = await LearningPath.findOne({ userId });

    if (!learningPath) {
      return res.status(200).json({
        learningPath: null,
        message: 'No learning path found yet. Complete an assessment to create one.',
      });
    }

    return res.status(200).json({ 
      learningPath: {
        userId: learningPath.userId,
        paths: learningPath.paths
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.initializeLearningPath = async (req, res) => {
  try {
    const { userId, language, proficiencyLevel } = req.body;

    if (!userId || !language || !proficiencyLevel) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const learningPath = await ensurePathForLanguage(userId, language, proficiencyLevel);

    return res.status(201).json({
      message: 'Learning path initialized',
      paths: learningPath.paths,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addLanguagePath = async (req, res) => {
  try {
    const { userId, language, proficiencyLevel, topicBreakdown, assessmentScore } = req.body;

    if (!userId || !language || !proficiencyLevel) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Convert topicBreakdown object back to Map if provided
    let topicMap = new Map();
    if (topicBreakdown) {
      Object.entries(topicBreakdown).forEach(([topic, stats]) => {
        topicMap.set(topic, stats);
      });
    }

    const learningPath = await ensurePathForLanguage(
      userId,
      language,
      proficiencyLevel,
      topicMap,
      assessmentScore
    );

    return res.status(200).json({
      message: 'Learning path created successfully',
      paths: learningPath.paths,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const { userId, language, taskId } = req.body;

    if (!userId || !language || !taskId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const learningPath = await LearningPath.findOne({ userId });
    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    const languagePath = learningPath.paths.find((path) => path.language === language);
    if (!languagePath) {
      return res.status(404).json({ message: 'Language path not found' });
    }

    const task = languagePath.tasks.find((item) => item.taskId === taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = 'completed';
    task.completedAt = new Date();

    const nextTask = languagePath.tasks.find(
      (item) => item.order === task.order + 1 && item.status === 'locked'
    );

    if (nextTask) {
      nextTask.status = 'unlocked';
    }

    learningPath.updatedAt = new Date();
    await learningPath.save();

    return res.status(200).json({
      message: 'Task completed',
      paths: learningPath.paths,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTaskExplanation = async (req, res) => {
  try {
    const { userId, language, taskId } = req.params;

    const learningPath = await LearningPath.findOne({ userId });
    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    const languagePath = learningPath.paths.find((path) => path.language === language);
    if (!languagePath) {
      return res.status(404).json({ message: 'Language path not found' });
    }

    const task = languagePath.tasks.find((item) => item.taskId === taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json({
      task: {
        taskId: task.taskId,
        title: task.title,
        description: task.description,
        explanation: task.explanation,
        starterCode: task.starterCode,
        hints: task.hints || [],
        draftCode: task.draftCode || '',
        lastFeedback: task.lastFeedback || '',
        lastFeedbackScore: task.lastFeedbackScore,
        status: task.status,
        order: task.order,
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTaskCodeFeedback = async (req, res) => {
  try {
    const { userId, language, taskId, code, proficiencyLevel } = req.body;

    if (!language || !taskId || !code) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get task details including testCases
    let task = null;
    let taskTitle = '';
    let taskDescription = '';
    let testCases = [];

    if (userId) {
      const learningPath = await LearningPath.findOne({ userId });
      if (learningPath) {
        const languagePath = learningPath.paths.find((path) => path.language === language);
        if (languagePath) {
          task = languagePath.tasks.find((t) => t.taskId === taskId);
        }
      }
    }

    if (task) {
      taskTitle = task.title;
      taskDescription = task.description;
      testCases = task.testCases || [];
    }

    const parsed = await evaluateCodeWithAi({
      language,
      proficiencyLevel: proficiencyLevel || 'Beginner',
      taskTitle: taskTitle || taskId,
      taskDescription: taskDescription || 'Solve the coding task',
      code,
      testCases,
    });

    return res.status(200).json({
      feedback: parsed.feedback,
      suggestions: parsed.suggestions,
      qualityScore: parsed.qualityScore,
      passScore: LEARNING_PASS_SCORE,
      canComplete: Number(parsed.qualityScore || 0) >= LEARNING_PASS_SCORE,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.saveTaskDraft = async (req, res) => {
  try {
    const { userId, language, taskId, code } = req.body;

    if (!userId || !language || !taskId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const learningPath = await LearningPath.findOne({ userId });
    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    const result = getLanguagePathAndTask(learningPath, language, taskId);
    if (result.error) {
      return res.status(404).json({ message: result.error });
    }

    result.task.draftCode = (code || '').toString();
    result.task.lastWorkedAt = new Date();

    learningPath.updatedAt = new Date();
    await learningPath.save();

    return res.status(200).json({ message: 'Draft saved' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.submitTaskSolution = async (req, res) => {
  try {
    const { userId, language, taskId, code } = req.body;

    if (!userId || !language || !taskId || !code) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const learningPath = await LearningPath.findOne({ userId });
    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found. Complete an assessment first.' });
    }

    const result = getLanguagePathAndTask(learningPath, language, taskId);
    if (result.error) {
      return res.status(404).json({ message: result.error });
    }

    const { languagePath, task } = result;
    task.draftCode = code.toString();
    task.lastWorkedAt = new Date();
    task.attempts = Number(task.attempts || 0) + 1;

    console.log(`📝 Evaluating code submission for task: ${taskId} (Attempt ${task.attempts})`);

    const review = await evaluateCodeWithAi({
      language,
      proficiencyLevel: languagePath.proficiencyLevel,
      taskTitle: task.title,
      taskDescription: task.description,
      code,
      testCases: task.testCases || [],
    });

    task.lastFeedback = review.feedback;
    task.lastFeedbackScore = Number(review.qualityScore || 0);

    const passed = Number(review.qualityScore || 0) >= LEARNING_PASS_SCORE;
    let unlockedTaskId = null;

    console.log(`🎯 Score: ${task.lastFeedbackScore}/10 | Pass Threshold: ${LEARNING_PASS_SCORE}/10 | Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);

    if (passed && task.status !== 'completed') {
      task.status = 'completed';
      task.completedAt = new Date();

      const nextTask = languagePath.tasks.find(
        (item) => item.order === task.order + 1 && item.status === 'locked'
      );

      if (nextTask) {
        nextTask.status = 'unlocked';
        unlockedTaskId = nextTask.taskId;
        console.log(`🔓 Next task unlocked: ${nextTask.taskId}`);
      } else {
        console.log(`✅ All tasks completed!`);
      }
    } else if (!passed) {
      console.log(`💡 Feedback provided. Score ${task.lastFeedbackScore}/${LEARNING_PASS_SCORE} needed to pass.`);
    }

    learningPath.updatedAt = new Date();
    await learningPath.save();

    return res.status(200).json({
      message: passed 
        ? '🎉 Excellent! Task passed! Next question unlocked.' 
        : `❌ Score: ${task.lastFeedbackScore}/${LEARNING_PASS_SCORE}. ${LEARNING_PASS_SCORE} needed to pass. Try again!`,
      passed,
      passScore: LEARNING_PASS_SCORE,
      qualityScore: Number(review.qualityScore || 0),
      unlockedTaskId,
      feedback: review.feedback,
      suggestions: review.suggestions,
      attempts: task.attempts,
      paths: learningPath.paths,
    });
  } catch (error) {
    console.error('❌ Submit error:', error.message);
    return res.status(500).json({ 
      message: 'Error evaluating code. Please try again.', 
      error: error.message 
    });
  }
};

exports.getAIAgentExplanation = async (req, res) => {
  try {
    const { question, description, language, proficiencyLevel, userQuery, taskCompleted, action } = req.body;

    if (!question || !description || !language) {
      return res.status(400).json({ message: 'Missing required fields: question, description, language' });
    }

    console.log(`🤖 AI Agent request: action=${action}, question="${question}"`);

    const response = await getAIAgentExplanation({
      question,
      description,
      language,
      proficiencyLevel: proficiencyLevel || 'Beginner',
      userQuery: userQuery || '',
      taskCompleted: taskCompleted || false,
      action: action || 'explain'
    });

    return res.status(200).json({
      success: true,
      explanation: response.explanation,
      suggestions: response.suggestions || []
    });
  } catch (error) {
    console.error('❌ AI Agent error:', error.message);
    return res.status(500).json({
      message: 'Error generating AI explanation',
      error: error.message,
      success: false
    });
  }
};
