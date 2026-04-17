const express = require('express');
const router = express.Router();
const {
  signup,
  verifyEmail,
  signin,
  forgotPassword,
  resetPassword,
  logout,
  getCurrentUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/signin', signin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);
router.get('/me', protect, getCurrentUser);

module.exports = router;