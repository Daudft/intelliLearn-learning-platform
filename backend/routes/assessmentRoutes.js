const express = require('express');
const router = express.Router();
const {
  getLanguages,
  getQuestions,
  submitAssessment,
  getUserResult,
  getUserAllAttempts, // ✅ ADDED: New controller function
  checkAssessmentStatus,
} = require('../controllers/assessmentController');

// GET available languages
router.get('/languages', getLanguages);

// GET test questions for selected language
router.get('/questions/:language', getQuestions);

// POST submit assessment and get results
router.post('/submit', submitAssessment);

// ✅ ADDED: GET all user's assessment attempts
router.get('/all-attempts/:userId', getUserAllAttempts);

// GET user's latest assessment result
router.get('/result/:userId', getUserResult);

// GET check if user completed assessment
router.get('/status/:userId', checkAssessmentStatus);

module.exports = router;