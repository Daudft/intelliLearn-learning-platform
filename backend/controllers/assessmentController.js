const Assessment = require('../models/Assessment');
const UserAssessment = require('../models/UserAssessment');
const User = require('../models/User');
const { ensurePathForLanguage } = require('./learningPathController');

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

    // Use aggregation to get unique questions, avoiding duplicates
    const questions = await Assessment.aggregate([
      { $match: { language } },
      // Group by questionNumber to get first document of each question
      {
        $group: {
          _id: '$questionNumber',
          doc: { $first: '$$ROOT' }
        }
      },
      // Replace root with the document
      { $replaceRoot: { newRoot: '$doc' } },
      // Sort by questionNumber
      { $sort: { questionNumber: 1 } },
      // Limit to 15 unique questions
      { $limit: 15 },
      // Remove sensitive fields
      {
        $project: {
          correctAnswer: 0,
          explanation: 0
        }
      }
    ]);

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

    // Get correct answers using aggregation to ensure uniqueness
    const questions = await Assessment.aggregate([
      { $match: { language } },
      // Group by questionNumber to get first document of each question
      {
        $group: {
          _id: '$questionNumber',
          doc: { $first: '$$ROOT' }
        }
      },
      // Replace root with the document
      { $replaceRoot: { newRoot: '$doc' } },
      // Sort by questionNumber
      { $sort: { questionNumber: 1 } },
      // Limit to 15 unique questions
      { $limit: 15 }
    ]);

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

    // Convert topicBreakdown Map to plain object for MongoDB storage
    const topicBreakdownObj = Object.fromEntries(topicBreakdown);

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
      topicBreakdown: topicBreakdownObj,  // Store as plain object
      timeTaken: timeTaken || null,
    });

    // Update user profile
    await User.findByIdAndUpdate(userId, {
      hasCompletedAssessment: true,
      assessmentLanguage: language,
      proficiencyLevel,
      lastAssessmentDate: new Date(),
    });

    // Generate personalized learning path based on assessment performance
    try {
      console.log(`📚 Starting learning path generation for user ${userId}...`);
      console.log(`   Language: ${language}, Proficiency: ${proficiencyLevel}, Score: ${percentage}%`);
      
      await ensurePathForLanguage(userId, language, proficiencyLevel, topicBreakdownObj, percentage);
      
      console.log('✅ Learning path created successfully for user:', userId);
    } catch (pathError) {
      console.error('❌ Error creating learning path:', pathError.message);
      console.error('   Stack:', pathError.stack);
      // Don't throw - assessment is still valid even if path generation fails
    }

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

    // Get latest assessment for more detailed dashboard data
    const latestAssessment = await UserAssessment.findOne({ userId })
      .sort({ completedAt: -1 })
      .select('score totalQuestions percentage proficiencyLevel language completedAt');

    res.status(200).json({
      hasCompletedAssessment: user.hasCompletedAssessment,
      assessmentLanguage: user.assessmentLanguage,
      proficiencyLevel: user.proficiencyLevel,
      // Include latest assessment details for dashboard
      latestAssessment: latestAssessment ? {
        score: latestAssessment.score,
        totalQuestions: latestAssessment.totalQuestions,
        percentage: latestAssessment.percentage,
        proficiencyLevel: latestAssessment.proficiencyLevel,
        language: latestAssessment.language,
        completedAt: latestAssessment.completedAt,
      } : null,
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* =============================================
   ADAPTIVE ASSESSMENT - NEW FLOW
   ============================================= */

// In-memory storage for active assessment sessions
const activeSessions = new Map();

/* Topic distribution for adaptive assessment */
const TOPIC_DISTRIBUTION = {
  'Variables_and_Datatypes': 3,  // 2-3 questions
  'DataTypes_String': 3,          // 2-3 questions (combined with Variables)
  'Loops': 3,
  'Operations': 3,
  'Functions': 3,
  'Arrays': 3,
  'Objects': 3,
};

/* Difficulty progression */
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

/* START ADAPTIVE ASSESSMENT */
exports.startAdaptiveAssessment = async (req, res) => {
  try {
    const { userId, language } = req.body;

    if (!userId || !language) {
      return res.status(400).json({ message: 'Missing userId or language' });
    }

    if (!['python', 'java', 'c'].includes(language)) {
      return res.status(400).json({ message: 'Invalid language' });
    }

    // Create session
    const sessionId = `${userId}_${language}_${Date.now()}`;
    
    const session = {
      sessionId,
      userId,
      language,
      currentQuestionIndex: 0,
      currentDifficulty: 'easy',
      answers: [],
      topicProgress: {},
      questionsUsed: new Set(),
      startTime: Date.now(),
    };

    activeSessions.set(sessionId, session);

    // Get first question from Variables/Datatypes (easy)
    const firstQuestion = await getAdaptiveQuestion(language, 'Variables_and_Datatypes', 'easy', new Set());

    if (!firstQuestion) {
      activeSessions.delete(sessionId);
      return res.status(404).json({ message: 'No questions available' });
    }

    session.questionsUsed.add(firstQuestion._id.toString());
    session.topicProgress['Variables_and_Datatypes'] = 1;

    res.status(200).json({
      message: 'Assessment started',
      sessionId,
      question: {
        _id: firstQuestion._id,
        question: firstQuestion.question,
        questionType: firstQuestion.questionType,
        code: firstQuestion.code || null,
        options: firstQuestion.options,
        topic: firstQuestion.topic,
        difficulty: firstQuestion.difficulty,
        questionIndex: 1,
      },
    });

  } catch (error) {
    console.error('Error starting adaptive assessment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* SUBMIT ANSWER AND GET NEXT QUESTION */
exports.submitAdaptiveAnswer = async (req, res) => {
  try {
    const { sessionId, questionId, userAnswer } = req.body;

    if (!sessionId || !questionId || userAnswer === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const session = activeSessions.get(sessionId);
    if (!session) {
      return res.status(400).json({ message: 'Invalid session' });
    }

    // Get question and check answer
    const question = await Assessment.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const isCorrect = userAnswer === question.correctAnswer;

    // Store answer
    session.answers.push({
      questionId,
      userAnswer,
      isCorrect,
      topic: question.topic,
      difficulty: question.difficulty,
    });

    // Update difficulty based on correctness
    const currentDifficultyIndex = DIFFICULTY_LEVELS.indexOf(session.currentDifficulty);
    
    if (isCorrect) {
      // Correct: increase difficulty
      if (currentDifficultyIndex < DIFFICULTY_LEVELS.length - 1) {
        session.currentDifficulty = DIFFICULTY_LEVELS[currentDifficultyIndex + 1];
      }
    } else {
      // Wrong: decrease difficulty
      if (currentDifficultyIndex > 0) {
        session.currentDifficulty = DIFFICULTY_LEVELS[currentDifficultyIndex - 1];
      }
    }

    // Determine next topic
    const nextTopic = getNextTopic(session);
    
    // Check if assessment is complete (15 questions asked)
    if (session.answers.length >= 15) {
      // Finalize assessment
      return finalizeAdaptiveAssessment(session, res);
    }

    // Get next question
    const nextQuestion = await getAdaptiveQuestion(
      session.language,
      nextTopic,
      session.currentDifficulty,
      session.questionsUsed
    );

    if (!nextQuestion) {
      // If no question available in current topic/difficulty, try any available
      const allTopics = Object.keys(TOPIC_DISTRIBUTION);
      for (const topic of allTopics) {
        const altQuestion = await getAdaptiveQuestion(session.language, topic, session.currentDifficulty, session.questionsUsed);
        if (altQuestion) {
          session.questionsUsed.add(altQuestion._id.toString());
          session.topicProgress[topic] = (session.topicProgress[topic] || 0) + 1;
          
          return res.status(200).json({
            message: 'Next question',
            sessionId,
            isCorrect,
            question: {
              _id: altQuestion._id,
              question: altQuestion.question,
              questionType: altQuestion.questionType,
              code: altQuestion.code || null,
              options: altQuestion.options,
              topic: altQuestion.topic,
              difficulty: altQuestion.difficulty,
              questionIndex: session.answers.length + 1,
            },
          });
        }
      }
      
      // No more questions available
      return finalizeAdaptiveAssessment(session, res);
    }

    session.questionsUsed.add(nextQuestion._id.toString());
    session.topicProgress[nextTopic] = (session.topicProgress[nextTopic] || 0) + 1;

    res.status(200).json({
      message: 'Next question',
      sessionId,
      isCorrect,
      question: {
        _id: nextQuestion._id,
        question: nextQuestion.question,
        questionType: nextQuestion.questionType,
        code: nextQuestion.code || null,
        options: nextQuestion.options,
        topic: nextQuestion.topic,
        difficulty: nextQuestion.difficulty,
        questionIndex: session.answers.length + 1,
      },
    });

  } catch (error) {
    console.error('Error submitting adaptive answer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* HELPER: Get random question by topic and difficulty */
async function getAdaptiveQuestion(language, topic, difficulty, usedIds) {
  const query = {
    language,
    difficulty,
    _id: { $nin: Array.from(usedIds) }
  };

  // Handle Variables_and_Datatypes combined query
  if (topic === 'Variables_and_Datatypes') {
    query.topic = { $in: ['Variables_and_Datatypes', 'DataTypes_String'] };
  } else {
    query.topic = topic;
  }

  // Use aggregation pipeline to ensure unique questions and avoid duplicates
  const questions = await Assessment.aggregate([
    { $match: query },
    // Remove duplicates by questionNumber within this query
    {
      $group: {
        _id: '$questionNumber',
        doc: { $first: '$$ROOT' }
      }
    },
    { $replaceRoot: { newRoot: '$doc' } },
    { $sample: { size: 1 } }
  ]);

  if (questions.length === 0) return null;

  return questions[0];
}

/* HELPER: Get next topic based on distribution */
function getNextTopic(session) {
  const topics = Object.keys(TOPIC_DISTRIBUTION);
  const topicsToAsk = [];

  // First 3 questions: Variables_and_Datatypes
  if (session.answers.length < 3) {
    return 'Variables_and_Datatypes';
  }

  // Remaining questions: cycle through other topics
  const otherTopics = topics.filter(t => t !== 'Variables_and_Datatypes');
  const questionNumber = session.answers.length;
  const topicIndex = (questionNumber - 3) % otherTopics.length;

  return otherTopics[topicIndex];
}

/* FINALIZE ADAPTIVE ASSESSMENT */
async function finalizeAdaptiveAssessment(session, res) {
  try {
    const { userId, language, answers } = session;

    // Calculate score
    let score = 0;
    const topicBreakdown = {};

    answers.forEach(answer => {
      if (answer.isCorrect) score++;
      
      const topic = answer.topic;
      if (!topicBreakdown[topic]) {
        topicBreakdown[topic] = { correct: 0, total: 0 };
      }
      topicBreakdown[topic].total++;
      if (answer.isCorrect) topicBreakdown[topic].correct++;
    });

    const totalQuestions = answers.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    let proficiencyLevel = 'Beginner';
    if (percentage > 70) proficiencyLevel = 'Advanced';
    else if (percentage > 40) proficiencyLevel = 'Intermediate';

    // Get attempt number
    const lastAttempt = await UserAssessment.findOne({ userId, language })
      .sort({ attemptNumber: -1 });
    const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

    // Save assessment
    const gradedAnswers = answers.map(answer => ({
      questionId: answer.questionId,
      userAnswer: answer.userAnswer,
      isCorrect: answer.isCorrect,
    }));

    const userAssessment = await UserAssessment.create({
      userId,
      language,
      attemptNumber,
      answers: gradedAnswers,
      score,
      totalQuestions,
      percentage,
      proficiencyLevel,
      topicBreakdown,
      timeTaken: Math.round((Date.now() - session.startTime) / 1000),
    });

    // Update user profile
    await User.findByIdAndUpdate(userId, {
      hasCompletedAssessment: true,
      assessmentLanguage: language,
      proficiencyLevel,
      lastAssessmentDate: new Date(),
    });

    // Generate learning path
    try {
      await ensurePathForLanguage(userId, language, proficiencyLevel, topicBreakdown, percentage);
    } catch (pathError) {
      console.error('❌ Error creating learning path:', pathError);
    }

    // Clean up session
    activeSessions.delete(session.sessionId);

    res.status(201).json({
      message: 'Assessment completed',
      result: {
        attemptNumber,
        score,
        totalQuestions,
        percentage,
        proficiencyLevel,
        topicBreakdown,
      }
    });

  } catch (error) {
    console.error('Error finalizing assessment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
