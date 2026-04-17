const User = require('../models/User');
const UserAssessment = require('../models/UserAssessment');
const ActivityLog = require('../models/ActivityLog');
const Achievement = require('../models/Achievement');
const LearningPath = require('../models/LearningPath');
const Assessment = require('../models/Assessment');

// ============================================
// ADMIN DASHBOARD ENDPOINTS
// ============================================

/**
 * GET ADMIN DASHBOARD STATS
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalStudents = totalUsers - totalAdmins;

    const totalAssessmentsTaken = await UserAssessment.countDocuments();
    const avgAssessmentScore = await UserAssessment.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$percentage' } } },
    ]);

    const totalTasksCompleted = await ActivityLog.countDocuments({ activityType: 'task_completed' });
    const totalBadgesEarned = await Achievement.countDocuments();

    const activitiesLast7Days = await ActivityLog.countDocuments({
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    const languageStats = await UserAssessment.aggregate([
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 },
          avgScore: { $avg: '$percentage' },
        },
      },
    ]);

    const proficiencyDistribution = await User.aggregate([
      {
        $group: {
          _id: '$proficiencyLevel',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      overview: {
        totalUsers,
        totalStudents,
        totalAdmins,
        activitiesLast7Days,
      },
      assessmentStats: {
        totalAssessmentsTaken,
        averageScore: avgAssessmentScore[0]?.avgScore || 0,
      },
      learningStats: {
        totalTasksCompleted,
        totalBadgesEarned,
      },
      languageStats,
      proficiencyDistribution,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// USER MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET ALL USERS WITH PAGINATION
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, searchTerm } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (role) filter.role = role;
    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * GET SINGLE USER DETAILS
 */
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const assessments = await UserAssessment.find({ userId }).sort({ completedAt: -1 });
    const activities = await ActivityLog.find({ userId }).sort({ timestamp: -1 }).limit(20);
    const badges = await Achievement.find({ userId });
    const learningPath = await LearningPath.findOne({ userId });

    res.status(200).json({
      user,
      assessments: assessments.slice(0, 5),
      recentActivities: activities,
      badges,
      learningPath: learningPath?.paths || [],
      stats: {
        totalAssessments: assessments.length,
        averageScore: assessments.length > 0 
          ? Math.round(assessments.reduce((sum, a) => sum + a.percentage, 0) / assessments.length)
          : 0,
        totalBadges: badges.length,
      },
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * UPDATE USER ROLE
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log activity
    await ActivityLog.create({
      userId: req.user?.id, // Admin ID
      activityType: 'profile_updated',
      title: `User role updated to ${role}`,
      description: `Updated ${user.name}'s role to ${role}`,
    });

    res.status(200).json({ message: 'User role updated', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * DELETE USER
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clean up related data
    await UserAssessment.deleteMany({ userId });
    await ActivityLog.deleteMany({ userId });
    await Achievement.deleteMany({ userId });
    await LearningPath.deleteMany({ userId });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// CONTENT MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET ALL ASSESSMENT QUESTIONS
 */
exports.getAllQuestions = async (req, res) => {
  try {
    const { language, difficulty, topic } = req.query;

    const filter = {};
    if (language) filter.language = language;
    if (difficulty) filter.difficulty = difficulty;
    if (topic) filter.topic = topic;

    const questions = await Assessment.find(filter).sort({ questionNumber: 1 });

    res.status(200).json({
      total: questions.length,
      questions,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * ADD NEW ASSESSMENT QUESTION
 */
exports.addQuestion = async (req, res) => {
  try {
    const { language, questionType, topic, difficulty, question, code, options, correctAnswer, explanation } = req.body;

    // Validation
    if (!language || !questionType || !topic || !question || !options || !correctAnswer) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const totalQuestions = await Assessment.countDocuments({ language });

    const newQuestion = await Assessment.create({
      language,
      questionNumber: totalQuestions + 1,
      questionType,
      topic,
      difficulty: difficulty || 'medium',
      question,
      code: code || null,
      options,
      correctAnswer,
      explanation: explanation || '',
    });

    res.status(201).json({
      message: 'Question added successfully',
      question: newQuestion,
    });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * UPDATE ASSESSMENT QUESTION
 */
exports.updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const updates = req.body;

    const question = await Assessment.findByIdAndUpdate(questionId, updates, { new: true });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({
      message: 'Question updated successfully',
      question,
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * DELETE ASSESSMENT QUESTION
 */
exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Assessment.findByIdAndDelete(questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// SYSTEM MONITORING ENDPOINTS
// ============================================

/**
 * GET SYSTEM HEALTH
 */
exports.getSystemHealth = async (req, res) => {
  try {
    const dbConnected = true; // Basic check - could be more sophisticated

    const userCount = await User.countDocuments();
    const assessmentCount = await UserAssessment.countDocuments();
    const activityCount = await ActivityLog.countDocuments();

    const systemMetrics = {
      database: dbConnected ? 'healthy' : 'unhealthy',
      totalUsers: userCount,
      totalAssessments: assessmentCount,
      totalActivities: activityCount,
      timestamp: new Date(),
    };

    res.status(200).json(systemMetrics);
  } catch (error) {
    console.error('Error checking system health:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * GET CUSTOM REPORTS
 */
exports.getCustomReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate, language } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    let report = {};

    switch (reportType) {
      case 'user-engagement':
        report = await generateUserEngagementReport(dateFilter);
        break;
      case 'assessment-performance':
        report = await generateAssessmentReport(language, dateFilter);
        break;
      case 'learning-progress':
        report = await generateLearningProgressReport(dateFilter);
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    res.status(200).json({
      reportType,
      generatedAt: new Date(),
      report,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper functions for reports
async function generateUserEngagementReport(dateFilter) {
  const activities = await ActivityLog.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$userId',
        activityCount: { $sum: 1 },
        lastActivity: { $max: '$timestamp' },
      },
    },
    { $sort: { activityCount: -1 } },
  ]);

  return { totalActiveUsers: activities.length, activities };
}

async function generateAssessmentReport(language, dateFilter) {
  const filter = { ...dateFilter };
  if (language) filter.language = language;

  const assessments = await UserAssessment.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$language',
        averageScore: { $avg: '$percentage' },
        totalAssessments: { $sum: 1 },
        maxScore: { $max: '$percentage' },
        minScore: { $min: '$percentage' },
      },
    },
  ]);

  return assessments;
}

async function generateLearningProgressReport(dateFilter) {
  const tasksCompleted = await ActivityLog.countDocuments({
    ...dateFilter,
    activityType: 'task_completed',
  });

  const badgesEarned = await ActivityLog.countDocuments({
    ...dateFilter,
    activityType: 'badge_earned',
  });

  return { tasksCompleted, badgesEarned };
}
