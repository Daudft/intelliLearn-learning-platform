const mongoose = require('mongoose');

const userAssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // ✅ REMOVED: unique: true (allows multiple attempts per user)
  },
  language: {
    type: String,
    required: true,
    enum: ['python', 'java', 'c'],
  },
  attemptNumber: {
    type: Number,
    default: 1, // Track which attempt this is (1st, 2nd, 3rd, etc.)
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
      },
      userAnswer: String,
      isCorrect: Boolean,
    },
  ],
  score: {
    type: Number,
    required: true, // Total correct answers
  },
  totalQuestions: {
    type: Number,
    required: true,
    default: 15,
  },
  percentage: {
    type: Number,
    required: true, // (score / totalQuestions) * 100
  },
  proficiencyLevel: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
  },
  topicBreakdown: {
    type: Map,
    of: {
      correct: Number,
      total: Number,
    },
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
  timeTaken: {
    type: Number, // Time in seconds
  },
});

// ✅ ADDED: Compound index for efficient querying
// This allows quick lookups by userId, language, and attemptNumber
userAssessmentSchema.index({ userId: 1, language: 1, attemptNumber: 1 });
userAssessmentSchema.index({ userId: 1, completedAt: -1 }); // For getting latest attempts

module.exports = mongoose.model('UserAssessment', userAssessmentSchema);