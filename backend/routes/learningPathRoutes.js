const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getLearningPath,
  initializeLearningPath,
  addLanguagePath,
  completeTask,
  getTaskExplanation,
  getTaskCodeFeedback,
  saveTaskDraft,
  submitTaskSolution,
  getAIAgentExplanation,
  runCode,
  getQuiz,
  submitQuiz,
  regenerateQuiz,
  advanceCycle,
} = require('../controllers/learningPathController');

router.get('/:userId', getLearningPath);
router.post('/initialize', initializeLearningPath);
router.post('/add-language', addLanguagePath);
router.patch('/complete-task', completeTask);
router.patch('/save-draft', saveTaskDraft);
router.post('/submit-solution', submitTaskSolution);
router.post('/ai-feedback', getTaskCodeFeedback);
router.post('/ai-agent', protect, getAIAgentExplanation);
router.post('/run-code', protect, runCode);
router.post('/quiz/submit', submitQuiz);
router.post('/quiz/regenerate', regenerateQuiz);
router.post('/advance-cycle', advanceCycle);
router.get('/:userId/:language/quiz', getQuiz);
router.get('/:userId/:language/:taskId/explanation', getTaskExplanation);

module.exports = router;
