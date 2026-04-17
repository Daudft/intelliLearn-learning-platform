const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    enum: ['python', 'java', 'c'],
  },
  questionNumber: {
    type: Number,
    required: true,
  },
  questionType: {
    type: String,
    required: true,
    enum: ['mcq', 'code_output'],
  },
  topic: {
    type: String,
    required: true, // e.g., "Variables", "Loops", "Functions", "Arrays", "OOP"
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  question: {
    type: String,
    required: true,
  },
  code: {
    type: String, // For code_output type questions
    default: null,
  },
  options: {
    type: [String], // Array of 4 options for MCQ
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  explanation: {
    type: String, // Optional: Explain why this is the correct answer
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient querying
assessmentSchema.index({ language: 1, questionNumber: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);