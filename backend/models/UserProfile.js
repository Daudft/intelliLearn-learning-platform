const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500,
  },
  profilePicture: {
    type: String,
    default: null,
  },
  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'reading-writing', 'kinesthetic'],
    default: 'visual',
  },
  preferredLanguage: {
    type: String,
    enum: ['python', 'java', 'c'],
    default: null,
  },
  dailyLearningGoal: {
    type: Number,
    default: 30, // minutes
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
  notificationsEnabled: {
    type: Boolean,
    default: true,
  },
  preferredNotificationTime: {
    type: String,
    default: '09:00', // 24-hour format
  },
  streakDays: {
    type: Number,
    default: 0,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  lastActivityDate: {
    type: Date,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userProfileSchema.index({ userId: 1 });

module.exports = mongoose.model('UserProfile', userProfileSchema);
