const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getActivityHistory,
  getActivitySummary,
  logActivity,
  getUserAchievements,
  unlockAchievement,
  updateLearningPreferences,
  getLearningStats,
  getDashboardData,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Profile routes
router.get('/profile/:userId', protect, getUserProfile);
router.patch('/profile/:userId', protect, updateUserProfile);

// Activity history routes
router.get('/activity-history/:userId', protect, getActivityHistory);
router.get('/activity-summary/:userId', protect, getActivitySummary);
router.post('/log-activity', logActivity);

// Achievement routes
router.get('/achievements/:userId', protect, getUserAchievements);
router.post('/unlock-achievement', unlockAchievement);

// Learning preferences routes
router.patch('/learning-preferences/:userId', protect, updateLearningPreferences);
router.get('/learning-stats/:userId', protect, getLearningStats);

// Dashboard route
router.get('/dashboard/:userId', protect, getDashboardData);

module.exports = router;
