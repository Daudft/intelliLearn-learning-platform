const Assessment = require('../models/Assessment');
const UserAssessment = require('../models/UserAssessment');
const User = require('../models/User');

/* ---------------------------------------------
   GET AVAILABLE LANGUAGES
--------------------------------------------- */
exports.getLanguages = async (req, res) => {
  try {
    const languages = [
      { id: 'python', name: 'Python', icon: '🐍' },
      { id: 'java', name: 'Java', icon: '☕' },
      { id: 'c', name: 'C', icon: '💻' },
    ];

    res.status(200).json({ languages });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ---------------------------------------------
   GET TEST QUESTIONS BY LANGUAGE
--------------------------------------------- */
exports.getQuestions = async (req, res) => {
  try {
    const { language } = req.params;

    if (!['python', 'java', 'c'].includes(language)) {
      return res.status(400).json({ message: 'Invalid language' });
    }

    const questions = await Assessment.find({ language })
      .sort({ questionNumber: 1 })
      .limit(15)
      .select('-correctAnswer -explanation');

    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this language' });
    }

    res.status(200).json({
      questions,
      totalQuestions: questions.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ---------------------------------------------
   SUBMIT ASSESSMENT (UNLIMITED ATTEMPTS)
--------------------------------------------- */
exports.submitAssessment = async (req, res) => {
  try {
    const { userId, language, answers, timeTaken } = req.body;

    if (!userId || !language || !answers) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get last attempt number and increment
    const lastAttempt = await UserAssessment.findOne({ userId, language })
      .sort({ attemptNumber: -1 });

    const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

    // Get correct answers
    const questions = await Assessment.find({ language })
      .sort({ questionNumber: 1 })
      .limit(15);

    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this language' });
    }

    // Grade answers
    let score = 0;
    const gradedAnswers = [];
    const topicBreakdown = new Map();

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) score++;

      gradedAnswers.push({
        questionId: question._id,
        userAnswer,
        isCorrect
      });

      const topic = question.topic;

      if (!topicBreakdown.has(topic)) {
        topicBreakdown.set(topic, { correct: 0, total: 0 });
      }

      const stats = topicBreakdown.get(topic);
      stats.total++;
      if (isCorrect) stats.correct++;
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    let proficiencyLevel = 'Beginner';
    if (percentage > 70) proficiencyLevel = 'Advanced';
    else if (percentage > 40) proficiencyLevel = 'Intermediate';

    // Create new attempt
    const userAssessment = await UserAssessment.create({
      userId,
      language,
      attemptNumber,
      answers: gradedAnswers,
      score,
      totalQuestions,
      percentage,
      proficiencyLevel,
      topicBreakdown,  // Stored as Map
      timeTaken: timeTaken || null,
    });

    // Update user profile
    await User.findByIdAndUpdate(userId, {
      hasCompletedAssessment: true,
      assessmentLanguage: language,
      proficiencyLevel,
      lastAssessmentDate: new Date(),
    });

    res.status(201).json({
      message: 'Assessment completed successfully',
      result: {
        attemptNumber,
        score,
        totalQuestions,
        percentage,
        proficiencyLevel,
        topicBreakdown: Object.fromEntries(topicBreakdown),
      }
    });

  } catch (error) {
    console.error("Error submitting assessment:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ---------------------------------------------
   GET LATEST RESULT
--------------------------------------------- */
exports.getUserResult = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await UserAssessment.findOne({ userId })
      .sort({ completedAt: -1 })
      .populate('userId', 'name email')
      .populate('answers.questionId', 'question topic');

    if (!result) {
      return res.status(404).json({ message: 'No assessment found for this user' });
    }

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ---------------------------------------------
   GET ALL USER ATTEMPTS
--------------------------------------------- */
exports.getUserAllAttempts = async (req, res) => {
  try {
    const { userId } = req.params;

    const attempts = await UserAssessment.find({ userId })
      .sort({ completedAt: -1 })
      .populate('answers.questionId', 'question topic');

    res.status(200).json({
      attempts,
      totalAttempts: attempts.length
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ---------------------------------------------
   CHECK USER ASSESSMENT STATUS
--------------------------------------------- */
exports.checkAssessmentStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      hasCompletedAssessment: user.hasCompletedAssessment,
      assessmentLanguage: user.assessmentLanguage,
      proficiencyLevel: user.proficiencyLevel,
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
