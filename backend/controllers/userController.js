const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const ActivityLog = require('../models/ActivityLog');
const Achievement = require('../models/Achievement');
const UserAssessment = require('../models/UserAssessment');
const LearningPath = require('../models/LearningPath');
const crypto = require('crypto');

// ============================================
// PROFILE ENDPOINTS
// ============================================

/**
 * GET USER PROFILE
 */
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) {
      userProfile = await UserProfile.create({ userId });
    }

    const achievements = await Achievement.find({ userId });
    const learningPath = await LearningPath.findOne({ userId });
    const recentAssessment = await UserAssessment.findOne({ userId }).sort({ completedAt: -1 });

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        proficiencyLevel: user.proficiencyLevel,
        assessmentLanguage: user.assessmentLanguage,
        learningStyle: user.learningStyle,
        experienceLevel: user.experienceLevel,
      },
      profile: userProfile,
      achievements,
      stats: {
        totalBadges: achievements.length,
        totalPoints: userProfile.totalPoints,
        streakDays: userProfile.streakDays,
        lastActivityDate: userProfile.lastActivityDate,
        recentAssessmentScore: recentAssessment?.percentage || null,
      },
      learningPath: learningPath?.paths || [],
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * UPDATE USER PROFILE
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, bio, learningStyle, dailyLearningGoal, timezone, notificationsEnabled, preferredNotificationTime } = req.body;

    // Update User
    const updateData = {};
    if (name) updateData.name = name;
    if (learningStyle) updateData.learningStyle = learningStyle;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update UserProfile
    let userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) {
      userProfile = await UserProfile.create({ userId });
    }

    if (bio !== undefined) userProfile.bio = bio;
    if (learningStyle) userProfile.learningStyle = learningStyle;
    if (dailyLearningGoal) userProfile.dailyLearningGoal = dailyLearningGoal;
    if (timezone) userProfile.timezone = timezone;
    if (notificationsEnabled !== undefined) userProfile.notificationsEnabled = notificationsEnabled;
    if (preferredNotificationTime) userProfile.preferredNotificationTime = preferredNotificationTime;
    userProfile.updatedAt = Date.now();

    await userProfile.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user,
      profile: userProfile,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// ACTIVITY HISTORY ENDPOINTS
// ============================================

/**
 * GET ACTIVITY HISTORY
 */
exports.getActivityHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, skip = 0, type } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const filter = { userId };
    if (type) {
      filter.activityType = type;
    }

    const activities = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await ActivityLog.countDocuments(filter);

    res.status(200).json({
      activities,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching activity history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * GET ACTIVITY SUMMARY
 */
exports.getActivitySummary = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalActivities = await ActivityLog.countDocuments({ userId });
    const activitiesByType = await ActivityLog.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
        },
      },
    ]);

    const activitiesLast7Days = await ActivityLog.countDocuments({
      userId,
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    const completedTasks = await ActivityLog.countDocuments({
      userId,
      activityType: 'task_completed',
    });

    const assessmentsTaken = await ActivityLog.countDocuments({
      userId,
      activityType: 'assessment_taken',
    });

    res.status(200).json({
      totalActivities,
      activitiesLast7Days,
      completedTasks,
      assessmentsTaken,
      byType: activitiesByType,
    });
  } catch (error) {
    console.error('Error fetching activity summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * LOG ACTIVITY
 */
exports.logActivity = async (req, res) => {
  try {
    const { userId, activityType, title, description, language, taskId, score, metadata } = req.body;

    if (!userId || !activityType || !title) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const activity = await ActivityLog.create({
      userId,
      activityType,
      title,
      description,
      language: language || null,
      taskId: taskId || null,
      score: score || null,
      metadata: metadata || {},
    });

    res.status(201).json({
      message: 'Activity logged',
      activity,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// ACHIEVEMENT/BADGE ENDPOINTS
// ============================================

/**
 * GET USER ACHIEVEMENTS
 */
exports.getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const achievements = await Achievement.find({ userId }).sort({ unlockedAt: -1 });

    const totalPoints = achievements.reduce((sum, badge) => sum + (badge.points || 10), 0);

    res.status(200).json({
      achievements,
      totalPoints,
      count: achievements.length,
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * UNLOCK ACHIEVEMENT
 */
exports.unlockAchievement = async (req, res) => {
  try {
    const { userId, badgeId } = req.body;

    if (!userId || !badgeId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if already unlocked
    const existing = await Achievement.findOne({ userId, badgeId });
    if (existing) {
      return res.status(200).json({ message: 'Badge already unlocked', achievement: existing });
    }

    const badgeDefinitions = {
      first_task_completed: {
        badgeName: 'First Steps',
        description: 'Completed your first coding task',
        badgeIcon: '🚀',
        points: 10,
      },
      five_tasks_completed: {
        badgeName: 'Getting Started',
        description: 'Completed 5 coding tasks',
        badgeIcon: '⭐',
        points: 25,
      },
      ten_tasks_completed: {
        badgeName: 'Task Master',
        description: 'Completed 10 coding tasks',
        badgeIcon: '🔥',
        points: 50,
      },
      all_tasks_completed: {
        badgeName: 'Pathfinder',
        description: 'Completed all tasks in a learning path',
        badgeIcon: '🏆',
        points: 100,
      },
      assessment_passed: {
        badgeName: 'Assessor',
        description: 'Passed a language assessment',
        badgeIcon: '✅',
        points: 30,
      },
      mastery_unlocked: {
        badgeName: 'Expert',
        description: 'Achieved mastery level in a topic',
        badgeIcon: '👑',
        points: 75,
      },
      streak_week: {
        badgeName: 'Dedication',
        description: 'Maintained a 7-day learning streak',
        badgeIcon: '🔥',
        points: 50,
      },
      helpful_solutions: {
        badgeName: 'Problem Solver',
        description: 'Submitted helpful code solutions',
        badgeIcon: '💡',
        points: 40,
      },
      advanced_learner: {
        badgeName: 'Advanced Learner',
        description: 'Reached Advanced proficiency level',
        badgeIcon: '🎓',
        points: 60,
      },
      problem_solver: {
        badgeName: 'Challenge Solver',
        description: 'Completed a challenging milestone project',
        badgeIcon: '🧩',
        points: 80,
      },
    };

    const badgeDef = badgeDefinitions[badgeId];
    if (!badgeDef) {
      return res.status(400).json({ message: 'Invalid badge ID' });
    }

    const achievement = await Achievement.create({
      userId,
      badgeId,
      ...badgeDef,
    });

    // Update user profile points
    const userProfile = await UserProfile.findOne({ userId });
    if (userProfile) {
      userProfile.totalPoints += badgeDef.points;
      await userProfile.save();
    }

    // Log activity
    await ActivityLog.create({
      userId,
      activityType: 'badge_earned',
      title: `Badge Unlocked: ${badgeDef.badgeName}`,
      description: badgeDef.description,
    });

    res.status(201).json({
      message: 'Achievement unlocked!',
      achievement,
      pointsEarned: badgeDef.points,
    });
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================
// LEARNING PREFERENCES ENDPOINTS
// ============================================

/**
 * UPDATE LEARNING PREFERENCES
 */
exports.updateLearningPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const { learningStyle, experienceLevel, preferredLanguage } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        learningStyle: learningStyle || user?.learningStyle,
        experienceLevel: experienceLevel || user?.experienceLevel,
      },
      { new: true }
    );

    let userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) {
      userProfile = await UserProfile.create({ userId });
    }

    if (learningStyle) userProfile.learningStyle = learningStyle;
    if (preferredLanguage) userProfile.preferredLanguage = preferredLanguage;
    await userProfile.save();

    // Log activity
    await ActivityLog.create({
      userId,
      activityType: 'profile_updated',
      title: 'Learning preferences updated',
      description: `Learning style: ${learningStyle}, Experience: ${experienceLevel}`,
    });

    res.status(200).json({
      message: 'Learning preferences updated',
      user,
      profile: userProfile,
    });
  } catch (error) {
    console.error('Error updating learning preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * GET LEARNING STATISTICS
 */
exports.getLearningStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userProfile = await UserProfile.findOne({ userId });
    const learningPath = await LearningPath.findOne({ userId });
    const assessments = await UserAssessment.find({ userId }).sort({ completedAt: -1 });
    const badges = await Achievement.find({ userId });

    // Calculate stats
    let totalTasksCompleted = 0;
    let totalTasksUnlocked = 0;
    const languageStats = {};

    if (learningPath) {
      learningPath.paths.forEach((path) => {
        totalTasksCompleted += path.tasks.filter((t) => t.status === 'completed').length;
        totalTasksUnlocked += path.tasks.filter((t) => t.status !== 'locked').length;

        if (!languageStats[path.language]) {
          languageStats[path.language] = {
            completed: 0,
            total: path.tasks.length,
            proficiencyLevel: path.proficiencyLevel,
          };
        }
        languageStats[path.language].completed = path.tasks.filter((t) => t.status === 'completed').length;
      });
    }

    const avgScore = assessments.length > 0 
      ? Math.round(assessments.reduce((sum, a) => sum + a.percentage, 0) / assessments.length)
      : 0;

    res.status(200).json({
      stats: {
        totalTasksCompleted,
        totalTasksUnlocked,
        totalAssessmentsTaken: assessments.length,
        averageAssessmentScore: avgScore,
        totalBadgesEarned: badges.length,
        totalPoints: userProfile?.totalPoints || 0,
        streakDays: userProfile?.streakDays || 0,
      },
      languageStats,
      recentAssessments: assessments.slice(0, 5),
    });
  } catch (error) {
    console.error('Error fetching learning stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
