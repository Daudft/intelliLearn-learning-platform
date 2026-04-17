const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  deleteUser,
  getAllQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getSystemHealth,
  getCustomReport,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// Dashboard
router.get('/dashboard', protect, adminOnly, getDashboardStats);

// User management
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:userId', protect, adminOnly, getUserDetails);
router.patch('/users/:userId/role', protect, adminOnly, updateUserRole);
router.delete('/users/:userId', protect, adminOnly, deleteUser);

// Content management
router.get('/questions', protect, adminOnly, getAllQuestions);
router.post('/questions', protect, adminOnly, addQuestion);
router.patch('/questions/:questionId', protect, adminOnly, updateQuestion);
router.delete('/questions/:questionId', protect, adminOnly, deleteQuestion);

// System monitoring
router.get('/system-health', protect, adminOnly, getSystemHealth);
router.get('/reports', protect, adminOnly, getCustomReport);

module.exports = router;
