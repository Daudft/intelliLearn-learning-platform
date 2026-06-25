const LearningPath = require('../models/LearningPath');
const { generatePersonalizedTasks, evaluateCodeWithAI, getAIAgentExplanation, generateCycleQuiz } = require('../utils/aiTaskGenerator');

const QUIZ_PASS_SCORE = 80; // out of 100 (7 MCQ x 10 + 3 coding x qualityScore)
const LEVEL_UP_THRESHOLD = 90; // quiz score (out of 100) needed to level up
const PROFICIENCY_ORDER = ['Beginner', 'Intermediate', 'Advanced'];

const LANGUAGE_LABELS = {
  python: 'Python',
  java: 'Java',
  c: 'C Language',
};
const LEARNING_PASS_SCORE = Number(process.env.LEARNING_PASS_SCORE || 7);

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

    // Strip quiz answer keys (correctAnswer/explanation) so they never reach the client.
    const safePaths = learningPath.paths.map((p) => {
      const obj = p.toObject ? p.toObject() : p;
      if (obj.quiz && Array.isArray(obj.quiz.mcqs)) {
        obj.quiz.mcqs = obj.quiz.mcqs.map((m) => ({
          question: m.question,
          options: m.options,
          topic: m.topic,
        }));
      }
      return obj;
    });

    return res.status(200).json({
      learningPath: {
        userId: learningPath.userId,
        paths: safePaths,
      },
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

/* ─── End-of-cycle quiz (7 MCQs + 3 coding questions) ─── */

function allTasksCompleted(languagePath) {
  const tasks = languagePath.tasks || [];
  return tasks.length > 0 && tasks.every((t) => t.status === 'completed');
}

// Strip answer keys before sending the quiz to the client.
function sanitizeQuiz(quiz) {
  return {
    status: quiz.status,
    attempts: quiz.attempts || 0,
    lastScore: quiz.lastScore ?? null,
    passScore: QUIZ_PASS_SCORE,
    mcqs: (quiz.mcqs || []).map((m, i) => ({
      index: i,
      question: m.question,
      options: m.options,
      topic: m.topic || '',
    })),
    codingQuestions: (quiz.codingQuestions || []).map((c) => ({
      questionId: c.questionId,
      title: c.title,
      description: c.description,
      starterCode: c.starterCode,
      difficulty: c.difficulty,
      topic: c.topic,
      testCases: c.testCases || [],
      hints: c.hints || [],
    })),
  };
}

exports.getQuiz = async (req, res) => {
  try {
    const { userId, language } = req.params;

    const learningPath = await LearningPath.findOne({ userId });
    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    const languagePath = learningPath.paths.find((p) => p.language === language);
    if (!languagePath) {
      return res.status(404).json({ message: 'Language path not found' });
    }

    const total = languagePath.tasks.length;
    const completed = languagePath.tasks.filter((t) => t.status === 'completed').length;
    const eligible = allTasksCompleted(languagePath);

    if (!eligible) {
      return res.status(200).json({
        eligible: false,
        completed,
        total,
        message: `Complete all ${total} tasks to unlock the quiz (${completed}/${total} done).`,
        quiz: null,
      });
    }

    // Generate the quiz once and persist it so answers stay consistent across attempts.
    const needsGeneration = !languagePath.quiz || !languagePath.quiz.mcqs || languagePath.quiz.mcqs.length === 0;
    if (needsGeneration) {
      const completedTasks = languagePath.tasks.filter((t) => t.status === 'completed');
      const generated = await generateCycleQuiz(language, languagePath.proficiencyLevel, completedTasks);

      languagePath.quiz = {
        status: 'available',
        mcqs: generated.mcqs,
        codingQuestions: generated.codingQuestions,
        attempts: languagePath.quiz?.attempts || 0,
        lastScore: languagePath.quiz?.lastScore ?? null,
        lastResult: '',
        generatedAt: new Date(),
        lastTakenAt: languagePath.quiz?.lastTakenAt || null,
      };
      learningPath.updatedAt = new Date();
      await learningPath.save();
    } else if (languagePath.quiz.status === 'locked') {
      languagePath.quiz.status = 'available';
      learningPath.updatedAt = new Date();
      await learningPath.save();
    }

    return res.status(200).json({
      eligible: true,
      completed,
      total,
      quiz: sanitizeQuiz(languagePath.quiz),
    });
  } catch (error) {
    console.error('❌ getQuiz error:', error.message);
    return res.status(500).json({ message: 'Error loading quiz', error: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { userId, language, mcqAnswers, codingSolutions } = req.body;

    if (!userId || !language) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const learningPath = await LearningPath.findOne({ userId });
    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    const languagePath = learningPath.paths.find((p) => p.language === language);
    if (!languagePath || !languagePath.quiz || (languagePath.quiz.mcqs || []).length === 0) {
      return res.status(400).json({ message: 'Quiz has not been generated yet' });
    }

    const quiz = languagePath.quiz;

    // ── Grade MCQs: 10 points each ──
    let mcqCorrect = 0;
    const mcqResults = quiz.mcqs.map((m, i) => {
      const given = Array.isArray(mcqAnswers) ? mcqAnswers[i] : null;
      const givenLetter = given ? String(given).toUpperCase()[0] : null;
      const correct = givenLetter && givenLetter === m.correctAnswer;
      if (correct) mcqCorrect++;
      return {
        index: i,
        given: givenLetter,
        correctAnswer: m.correctAnswer,
        correct: !!correct,
        explanation: m.explanation,
      };
    });
    const mcqPoints = mcqCorrect * 10;

    // ── Grade coding questions via AI: qualityScore (0-10) each ──
    let codingPoints = 0;
    const codingResults = [];
    for (const cq of quiz.codingQuestions) {
      const sol = (codingSolutions || []).find((s) => s.questionId === cq.questionId);
      const code = (sol?.code || '').toString();

      let qualityScore = 0;
      let feedback = 'No solution submitted for this challenge.';
      let suggestions = [];

      if (code.trim()) {
        const review = await evaluateCodeWithAi({
          language,
          proficiencyLevel: languagePath.proficiencyLevel,
          taskTitle: cq.title,
          taskDescription: cq.description,
          code,
          testCases: cq.testCases || [],
        });
        qualityScore = Number(review.qualityScore || 0);
        feedback = review.feedback;
        suggestions = review.suggestions || [];
      }

      codingPoints += qualityScore;
      codingResults.push({
        questionId: cq.questionId,
        title: cq.title,
        qualityScore,
        feedback,
        suggestions,
      });
    }

    const totalScore = mcqPoints + codingPoints; // max 100
    const passed = totalScore >= QUIZ_PASS_SCORE;

    quiz.attempts = (quiz.attempts || 0) + 1;
    quiz.lastScore = totalScore;
    quiz.lastTakenAt = new Date();
    quiz.lastResult = passed ? 'passed' : 'failed';
    quiz.status = passed ? 'passed' : 'available';
    learningPath.updatedAt = new Date();
    await learningPath.save();

    console.log(`🧩 Quiz submitted (${language}): MCQ ${mcqCorrect}/${quiz.mcqs.length}, coding ${codingPoints}/${quiz.codingQuestions.length * 10}, total ${totalScore}/100 → ${passed ? 'PASS' : 'FAIL'}`);

    return res.status(200).json({
      passed,
      totalScore,
      passScore: QUIZ_PASS_SCORE,
      breakdown: {
        mcqCorrect,
        mcqTotal: quiz.mcqs.length,
        mcqPoints,
        codingPoints,
        codingMax: quiz.codingQuestions.length * 10,
      },
      mcqResults,
      codingResults,
      attempts: quiz.attempts,
      message: passed
        ? '🎉 Quiz passed! You are ready to advance to the next set of questions.'
        : `Score ${totalScore}/100 — you need ${QUIZ_PASS_SCORE} to pass. Review and re-practice the 15 tasks, then try again.`,
    });
  } catch (error) {
    console.error('❌ submitQuiz error:', error.message);
    return res.status(500).json({ message: 'Error grading quiz', error: error.message });
  }
};

// After a passed quiz, generate the next cycle of 15 tasks — adaptively by score:
// >= 90 levels up (harder questions), 80-89 stays at the same level (fresh questions).
exports.advanceCycle = async (req, res) => {
  try {
    const { userId, language } = req.body;
    if (!userId || !language) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const learningPath = await LearningPath.findOne({ userId });
    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    const languagePath = learningPath.paths.find((p) => p.language === language);
    if (!languagePath) {
      return res.status(404).json({ message: 'Language path not found' });
    }

    if (!languagePath.quiz || languagePath.quiz.status !== 'passed') {
      return res.status(400).json({ message: 'Pass the cycle quiz before advancing.' });
    }

    const score = Number(languagePath.quiz.lastScore || 0);
    const currentIdx = PROFICIENCY_ORDER.indexOf(languagePath.proficiencyLevel);
    const leveledUp =
      score >= LEVEL_UP_THRESHOLD && currentIdx >= 0 && currentIdx < PROFICIENCY_ORDER.length - 1;
    const newLevel = leveledUp ? PROFICIENCY_ORDER[currentIdx + 1] : languagePath.proficiencyLevel;

    console.log(
      `🚀 Advancing cycle (${language}): score ${score} → ${languagePath.proficiencyLevel}` +
        (leveledUp ? ` ⬆ ${newLevel} (LEVEL UP)` : ` (same level, fresh questions)`)
    );

    // Generate the next 15 tasks at the (possibly new) level.
    const newTasks = await generatePersonalizedTasks(language, newLevel, {}, score);
    if (!Array.isArray(newTasks) || newTasks.length === 0) {
      return res.status(500).json({ message: 'Could not generate next questions. Please try again.' });
    }

    languagePath.proficiencyLevel = newLevel;
    languagePath.tasks = newTasks;
    languagePath.cycle = (languagePath.cycle || 1) + 1;
    languagePath.quiz = {
      status: 'locked',
      mcqs: [],
      codingQuestions: [],
      attempts: 0,
      lastScore: null,
      lastResult: '',
      generatedAt: null,
      lastTakenAt: null,
    };
    learningPath.updatedAt = new Date();
    await learningPath.save();

    return res.status(200).json({
      message: leveledUp
        ? `🎉 Level up! You're now ${newLevel}. A fresh set of ${newTasks.length} questions is ready.`
        : `New cycle started with ${newTasks.length} fresh questions.`,
      leveledUp,
      newLevel,
      cycle: languagePath.cycle,
      paths: learningPath.paths,
    });
  } catch (error) {
    console.error('❌ advanceCycle error:', error.message);
    return res.status(500).json({ message: 'Error advancing to next cycle', error: error.message });
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
