const express = require('express');
const router = express.Router();
const LearningQuestion = require('../models/LearningQuestion');
const { generateMCQQuestions } = require('../utils/aiTaskGenerator');
const {
  validateRequired,
  validateLanguage,
  validateDifficulty,
  errorResponse,
  logOperation,
  logError,
} = require('../utils/errorHandling');

/**
 * POST /api/questions/generate
 * Generate MCQ questions for a specific topic/difficulty/level
 */
router.post('/generate', async (req, res) => {
  try {
    const { language, topic, difficulty, level, count = 3 } = req.body;

    // Validation
    const missing = validateRequired(req.body, ['language', 'topic', 'difficulty', 'level']);
    if (missing.length > 0) {
      return errorResponse(res, `Missing required fields: ${missing.join(', ')}`, 400);
    }

    const langError = validateLanguage(language);
    if (langError) return errorResponse(res, langError, 400);

    const diffError = validateDifficulty(difficulty);
    if (diffError) return errorResponse(res, diffError, 400);

    if (!['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
      return errorResponse(res, 'Invalid proficiency level', 400);
    }

    logOperation('Generating MCQ questions', { language, topic, difficulty, level, count });

    const questions = await generateMCQQuestions(language, level, topic, difficulty, Math.min(count, 5));

    if (!questions || questions.length === 0) {
      logError('Question generation', new Error('No questions generated'));
      return errorResponse(res, 'Failed to generate questions', 500);
    }

    logOperation('Questions generated successfully', { count: questions.length });

    return res.status(200).json({
      success: true,
      data: {
        questions,
        count: questions.length,
        topic,
        difficulty,
        language,
      },
    });
  } catch (error) {
    logError('POST /api/questions/generate', error, req.body);
    return errorResponse(res, 'Server error', 500, error);
  }
});

/**
 * POST /api/questions/save
 * Save a learning question for a user
 */
router.post('/save', async (req, res) => {
  try {
    const { userId, language, topicId, topic, difficulty, proficiencyLevel, question, options, correctAnswer, explanation } = req.body;

    const missing = validateRequired(req.body, ['userId', 'language', 'topic', 'difficulty', 'proficiencyLevel', 'question', 'options', 'correctAnswer']);
    if (missing.length > 0) {
      return errorResponse(res, `Missing required fields: ${missing.join(', ')}`, 400);
    }

    const langError = validateLanguage(language);
    if (langError) return errorResponse(res, langError, 400);

    const diffError = validateDifficulty(difficulty);
    if (diffError) return errorResponse(res, diffError, 400);

    if (!['Beginner', 'Intermediate', 'Advanced'].includes(proficiencyLevel)) {
      return errorResponse(res, 'Invalid proficiency level', 400);
    }

    logOperation('Saving learning question', { userId, topicId, language });

    const learningQuestion = await LearningQuestion.create({
      userId,
      language,
      topicId,
      topic,
      difficulty,
      proficiencyLevel,
      question,
      options,
      correctAnswer,
      explanation,
    });

    logOperation('Question saved', { questionId: learningQuestion._id });

    return res.status(201).json({
      success: true,
      message: 'Question saved',
      data: { question: learningQuestion },
    });
  } catch (error) {
    logError('POST /api/questions/save', error, req.body);
    return errorResponse(res, 'Server error', 500, error);
  }
});

/**
 * POST /api/questions/submit-answer
 * Submit answer to a question and track progress
 */
router.post('/submit-answer', async (req, res) => {
  try {
    const { userId, questionId, userAnswer, timeSpent = 0, skip = false } = req.body;

    const missing = validateRequired(req.body, ['userId', 'questionId']);
    if (missing.length > 0) {
      return errorResponse(res, `Missing required fields: ${missing.join(', ')}`, 400);
    }

    if (!['A', 'B', 'C', 'D'].includes(userAnswer) && !skip) {
      return errorResponse(res, 'Invalid answer. Must be A, B, C, or D', 400);
    }

    logOperation('Submitting answer', { userId, questionId, answer: userAnswer });

    const question = await LearningQuestion.findById(questionId);
    if (!question) {
      return errorResponse(res, 'Question not found', 404);
    }

    // Authorization check
    if (question.userId.toString() !== userId) {
      logError('Authorization failed', new Error('Unauthorized'), { userId, questionId });
      return errorResponse(res, 'Unauthorized', 403);
    }

    // Update question with user's answer
    question.userAnswer = skip ? null : userAnswer;
    question.isCorrect = skip ? null : (userAnswer === question.correctAnswer);
    question.attempts = Number(question.attempts || 0) + 1;
    question.timeSpent = Number(timeSpent || 0);
    question.skipped = skip;
    question.answeredAt = new Date();

    await question.save();

    logOperation('Answer recorded', { questionId, isCorrect: question.isCorrect, attempts: question.attempts });

    return res.status(200).json({
      success: true,
      message: 'Answer submitted',
      data: {
        isCorrect: question.isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        userAnswer: skip ? null : userAnswer,
      },
    });
  } catch (error) {
    logError('POST /api/questions/submit-answer', error, req.body);
    return errorResponse(res, 'Server error', 500, error);
  }
});

/**
 * GET /api/questions/:userId/:language/:topic/:difficulty
 * Get all questions for a user on a specific topic/difficulty
 */
router.get('/:userId/:language/:topic/:difficulty', async (req, res) => {
  try {
    const { userId, language, topic, difficulty } = req.params;

    const langError = validateLanguage(language);
    if (langError) return errorResponse(res, langError, 400);

    const diffError = validateDifficulty(difficulty);
    if (diffError) return errorResponse(res, diffError, 400);

    logOperation('Fetching questions', { userId, language, topic, difficulty });

    const questions = await LearningQuestion.find({
      userId,
      language,
      topic,
      difficulty,
    }).sort({ createdAt: 1 });

    if (!questions || questions.length === 0) {
      return errorResponse(res, 'No questions found', 404);
    }

    // Calculate progress
    const totalQuestions = questions.length;
    const answeredQuestions = questions.filter(q => q.answeredAt !== null).length;
    const correctAnswers = questions.filter(q => q.isCorrect === true).length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const mastered = accuracy >= 70;

    logOperation('Questions fetched', { count: questions.length, accuracy });

    return res.status(200).json({
      success: true,
      data: {
        questions: questions.map(q => ({
          _id: q._id,
          question: q.question,
          options: q.options,
          userAnswer: q.userAnswer,
          isCorrect: q.isCorrect,
          skipped: q.skipped,
          timeSpent: q.timeSpent,
          explanation: q.explanation,
          correctAnswer: q.userAnswer ? q.correctAnswer : undefined,
        })),
        progress: {
          total: totalQuestions,
          answered: answeredQuestions,
          correct: correctAnswers,
          accuracy,
          mastered,
        },
      },
    });
  } catch (error) {
    logError('GET questions', error, req.params);
    return errorResponse(res, 'Server error', 500, error);
  }
});

/**
 * GET /api/questions/progress/:userId/:language
 * Get overall progress for a user in a language
 */
router.get('/progress/:userId/:language', async (req, res) => {
  try {
    const { userId, language } = req.params;

    const langError = validateLanguage(language);
    if (langError) return errorResponse(res, langError, 400);

    logOperation('Fetching progress', { userId, language });

    const questions = await LearningQuestion.find({
      userId,
      language,
    });

    if (!questions || questions.length === 0) {
      logOperation('No questions found for progress');
      return res.status(200).json({
        success: true,
        data: {
          progress: {
            totalQuestions: 0,
            answeredQuestions: 0,
            correctAnswers: 0,
            accuracy: 0,
            byTopic: {},
            byDifficulty: {},
          },
        },
      });
    }

    // Group by topic and difficulty
    const byTopic = {};
    const byDifficulty = {};
    let totalCorrect = 0;
    let totalAnswered = 0;

    questions.forEach(q => {
      // By topic
      if (!byTopic[q.topic]) {
        byTopic[q.topic] = { total: 0, correct: 0 };
      }
      byTopic[q.topic].total++;
      if (q.isCorrect === true) byTopic[q.topic].correct++;

      // By difficulty
      if (!byDifficulty[q.difficulty]) {
        byDifficulty[q.difficulty] = { total: 0, correct: 0 };
      }
      byDifficulty[q.difficulty].total++;
      if (q.isCorrect === true) byDifficulty[q.difficulty].correct++;

      // Overall
      if (q.answeredAt !== null) totalAnswered++;
      if (q.isCorrect === true) totalCorrect++;
    });

    // Calculate accuracies
    Object.keys(byTopic).forEach(topic => {
      byTopic[topic].accuracy = byTopic[topic].total > 0 
        ? Math.round((byTopic[topic].correct / byTopic[topic].total) * 100)
        : 0;
    });

    Object.keys(byDifficulty).forEach(diff => {
      byDifficulty[diff].accuracy = byDifficulty[diff].total > 0
        ? Math.round((byDifficulty[diff].correct / byDifficulty[diff].total) * 100)
        : 0;
    });

    const overallAccuracy = questions.length > 0
      ? Math.round((totalCorrect / questions.length) * 100)
      : 0;

    logOperation('Progress calculated', { totalCorrect, totalQuestions: questions.length, accuracy: overallAccuracy });

    return res.status(200).json({
      success: true,
      data: {
        progress: {
          totalQuestions: questions.length,
          answeredQuestions: totalAnswered,
          correctAnswers: totalCorrect,
          accuracy: overallAccuracy,
          byTopic,
          byDifficulty,
        },
      },
    });
  } catch (error) {
    logError('GET progress', error, req.params);
    return errorResponse(res, 'Server error', 500, error);
  }
});

module.exports = router;
