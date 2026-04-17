const express = require('express');
const router = express.Router();
const {
  getLearningPath,
  initializeLearningPath,
  addLanguagePath,
  completeTask,
  getTaskExplanation,
  getTaskCodeFeedback,
  saveTaskDraft,
  submitTaskSolution,
} = require('../controllers/learningPathController');

router.get('/:userId', getLearningPath);
router.post('/initialize', initializeLearningPath);
router.post('/add-language', addLanguagePath);
router.patch('/complete-task', completeTask);
router.patch('/save-draft', saveTaskDraft);
router.post('/submit-solution', submitTaskSolution);
router.post('/ai-feedback', getTaskCodeFeedback);
router.get('/:userId/:language/:taskId/explanation', getTaskExplanation);

module.exports = router;
