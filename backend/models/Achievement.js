const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  badgeId: {
    type: String,
    required: true,
    enum: [
      'first_task_completed',
      'five_tasks_completed',
      'ten_tasks_completed',
      'all_tasks_completed',
      'assessment_passed',
      'mastery_unlocked',
      'streak_week',
      'helpful_solutions',
      'advanced_learner',
      'problem_solver',
    ],
  },
  badgeName: {
    type: String,
    required: true,
  },
  badgeIcon: {
    type: String,
    default: '🏆',
  },
  description: {
    type: String,
    required: true,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
  },
  language: {
    type: String,
    enum: ['python', 'java', 'c', 'general'],
    default: 'general',
  },
  points: {
    type: Number,
    default: 10,
  },
});

// Prevent duplicate badges for same user
achievementSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);
