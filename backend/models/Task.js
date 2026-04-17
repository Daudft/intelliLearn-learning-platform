const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
    unique: true,
  },
  language: {
    type: String,
    required: true,
    enum: ['python', 'java', 'c'],
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  explanation: {
    type: String,
    required: true,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  proficiencyLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true,
  },
  starterCode: {
    type: String,
    default: '',
  },
  hints: [
    {
      hint: String,
      difficulty: {
        type: String,
        enum: ['light', 'medium', 'heavy'],
      },
    },
  ],
  testCases: [
    {
      input: String,
      expectedOutput: String,
      description: String,
    },
  ],
  topic: {
    type: String,
    enum: [
      'Variables',
      'Conditionals',
      'Loops',
      'Functions',
      'Arrays',
      'Objects',
      'OOP',
      'Error Handling',
      'Recursion',
      'Sorting',
    ],
    required: true,
  },
  isMilestone: {
    type: Boolean,
    default: false,
  },
  milestoneDescription: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

taskSchema.index({ language: 1, proficiencyLevel: 1, difficulty: 1 });
taskSchema.index({ topic: 1, difficulty: 1 });

module.exports = mongoose.model('Task', taskSchema);
