const LearningPath = require('../models/LearningPath');
const OpenAI = require('openai');

const LANGUAGE_LABELS = {
  python: 'Python',
  java: 'Java',
  c: 'C Language',
};

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;
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
    taskId: `${language}-${index + 1}`,
    title: (task?.title || `${LANGUAGE_LABELS[language]} Task ${index + 1}`).toString().slice(0, 120),
    description: (task?.description || 'Solve the coding task and verify edge cases.').toString().slice(0, 300),
    explanation: (task?.explanation || 'Analyze the problem and implement a clean solution.').toString(),
    starterCode: (task?.starterCode || '// Write your solution here\n').toString(),
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

async function evaluateCodeWithAi({ language, proficiencyLevel, taskTitle, taskDescription, code }) {
  if (!openaiClient) {
    return {
      feedback:
        'OpenAI is not configured yet. Add OPENAI_API_KEY in backend .env to enable AI review. Improve logic coverage and edge-case handling, then submit again.',
      suggestions: [
        'Handle invalid and empty input cases.',
        'Split logic into small reusable functions.',
        'Add sample tests and verify output manually.',
      ],
      qualityScore: 5,
    };
  }

  const completion = await openaiClient.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are an expert coding mentor. Return strict JSON only with keys: feedback (string), suggestions (array of 3 short strings), qualityScore (number 1-10).',
      },
      {
        role: 'user',
        content: `Language: ${language}\nLevel: ${proficiencyLevel || 'Beginner'}\nTask: ${taskTitle}\nTask Description: ${taskDescription}\nCode:\n${code}`,
      },
    ],
  });

  const content = completion.choices?.[0]?.message?.content || '{}';
  const parsed = JSON.parse(content);

  return {
    feedback:
      parsed.feedback ||
      'Good attempt. Review readability, correctness, and edge cases for improvement.',
    suggestions: Array.isArray(parsed.suggestions)
      ? parsed.suggestions.slice(0, 3)
      : [
          'Handle edge cases explicitly.',
          'Improve naming and structure.',
          'Test with both normal and boundary inputs.',
        ],
    qualityScore: Number(parsed.qualityScore || 6),
  };
}

async function generateTasksWithOpenAI(language, proficiencyLevel) {
  if (!openaiClient) {
    return buildTasks(language, proficiencyLevel);
  }

  const languageLabel = LANGUAGE_LABELS[language] || language;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a coding curriculum designer. Return only strict JSON with key "tasks" (array of exactly 5 items). Each task item must contain title, description, explanation, starterCode.',
        },
        {
          role: 'user',
          content: `Generate 5 progressive coding tasks for ${languageLabel} at ${proficiencyLevel} level. Keep tasks practical and beginner-friendly in wording.`,
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    return normalizeAiTasks(parsed.tasks, language, proficiencyLevel);
  } catch (error) {
    return buildTasks(language, proficiencyLevel);
  }
}

async function ensurePathForLanguage(userId, language, proficiencyLevel) {
  let learningPath = await LearningPath.findOne({ userId });
  const generatedTasks = await generateTasksWithOpenAI(language, proficiencyLevel);

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
    return learningPath;
  }

  if (existing.proficiencyLevel !== proficiencyLevel) {
    existing.proficiencyLevel = proficiencyLevel;
    learningPath.updatedAt = new Date();
    await learningPath.save();
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
        paths: [],
        message: 'No learning path found yet. Complete an assessment to create one.',
      });
    }

    return res.status(200).json({ paths: learningPath.paths });
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
    const { userId, language, proficiencyLevel } = req.body;

    if (!userId || !language || !proficiencyLevel) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const learningPath = await ensurePathForLanguage(userId, language, proficiencyLevel);

    return res.status(200).json({
      message: 'Language path ready',
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
      explanation: task.explanation,
      starterCode: task.starterCode,
      taskTitle: task.title,
      extensionHints: [
        'Open the in-app code window for this task.',
        'Start from starter code and solve step-by-step.',
        'Use AI feedback before marking this task complete.',
      ],
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTaskCodeFeedback = async (req, res) => {
  try {
    const { language, taskTitle, taskDescription, code, proficiencyLevel } = req.body;

    if (!language || !taskTitle || !taskDescription || !code) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const parsed = await evaluateCodeWithAi({
      language,
      proficiencyLevel,
      taskTitle,
      taskDescription,
      code,
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
      return res.status(404).json({ message: 'Learning path not found' });
    }

    const result = getLanguagePathAndTask(learningPath, language, taskId);
    if (result.error) {
      return res.status(404).json({ message: result.error });
    }

    const { languagePath, task } = result;
    task.draftCode = code.toString();
    task.lastWorkedAt = new Date();
    task.attempts = Number(task.attempts || 0) + 1;

    const review = await evaluateCodeWithAi({
      language,
      proficiencyLevel: languagePath.proficiencyLevel,
      taskTitle: task.title,
      taskDescription: task.description,
      code,
    });

    task.lastFeedback = review.feedback;
    task.lastFeedbackScore = Number(review.qualityScore || 0);

    const passed = Number(review.qualityScore || 0) >= LEARNING_PASS_SCORE;
    let unlockedTaskId = null;

    if (passed && task.status !== 'completed') {
      task.status = 'completed';
      task.completedAt = new Date();

      const nextTask = languagePath.tasks.find(
        (item) => item.order === task.order + 1 && item.status === 'locked'
      );

      if (nextTask) {
        nextTask.status = 'unlocked';
        unlockedTaskId = nextTask.taskId;
      }
    }

    learningPath.updatedAt = new Date();
    await learningPath.save();

    return res.status(200).json({
      message: passed ? 'Task passed and progression updated' : 'Task reviewed. Improve and submit again.',
      passed,
      passScore: LEARNING_PASS_SCORE,
      qualityScore: Number(review.qualityScore || 0),
      unlockedTaskId,
      feedback: review.feedback,
      suggestions: review.suggestions,
      paths: learningPath.paths,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
