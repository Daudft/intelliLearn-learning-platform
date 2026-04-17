const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  activityType: {
    type: String,
    enum: ['task_completed', 'task_started', 'assessment_taken', 'badge_earned', 'milestone_unlocked', 'login', 'profile_updated'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  language: {
    type: String,
    enum: ['python', 'java', 'c', null],
    default: null,
  },
  taskId: {
    type: String,
    default: null,
  },
  score: {
    type: Number,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

// Index for efficient querying
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ userId: 1, activityType: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
