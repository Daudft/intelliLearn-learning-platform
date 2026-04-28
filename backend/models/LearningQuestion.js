const mongoose = require('mongoose');

const learningQuestionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: ['python', 'java', 'c'],
  },
  topicId: {
    type: String, // e.g., "python-variables-easy-1"
    required: true,
  },
  topic: {
    type: String,
    required: true, // e.g., "Variables", "Loops", "Functions"
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard'],
  },
  proficiencyLevel: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
  },
  question: {
    type: String,
    required: true,
  },
  options: {
    A: String,
    B: String,
    C: String,
    D: String,
  },
  correctAnswer: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D'],
  },
  explanation: {
    type: String,
    default: '',
  },
  // User progress
  userAnswer: {
    type: String,
    default: null,
    enum: [null, 'A', 'B', 'C', 'D'],
  },
  isCorrect: {
    type: Boolean,
    default: null,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0,
  },
  skipped: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  answeredAt: {
    type: Date,
    default: null,
  },
});

learningQuestionSchema.index({ userId: 1, language: 1, topicId: 1 });
learningQuestionSchema.index({ userId: 1, language: 1, topic: 1, difficulty: 1 });

module.exports = mongoose.model('LearningQuestion', learningQuestionSchema);
