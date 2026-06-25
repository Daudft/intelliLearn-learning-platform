const mongoose = require('mongoose');

const learningTaskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
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
    starterCode: {
      type: String,
      default: '',
    },
    hints: [
      {
        hint: {
          type: String,
          default: '',
        },
        difficulty: {
          type: String,
          enum: ['light', 'medium', 'heavy'],
          default: 'light',
        },
        _id: false,
      },
    ],
    draftCode: {
      type: String,
      default: '',
    },
    lastFeedback: {
      type: String,
      default: '',
    },
    lastFeedbackScore: {
      type: Number,
      default: null,
    },
    lastWorkedAt: {
      type: Date,
      default: null,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['locked', 'unlocked', 'completed'],
      default: 'locked',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const quizMcqSchema = new mongoose.Schema(
  {
    question: { type: String, default: '' },
    options: {
      A: { type: String, default: '' },
      B: { type: String, default: '' },
      C: { type: String, default: '' },
      D: { type: String, default: '' },
    },
    correctAnswer: { type: String, default: 'A' },
    explanation: { type: String, default: '' },
    topic: { type: String, default: '' },
  },
  { _id: false }
);

const quizCodingSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    starterCode: { type: String, default: '' },
    difficulty: { type: String, default: 'medium' },
    topic: { type: String, default: '' },
    testCases: [
      {
        input: { type: String, default: '' },
        expectedOutput: { type: String, default: '' },
        description: { type: String, default: '' },
        _id: false,
      },
    ],
    hints: [
      {
        hint: { type: String, default: '' },
        difficulty: { type: String, enum: ['light', 'medium', 'heavy'], default: 'light' },
        _id: false,
      },
    ],
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['locked', 'available', 'passed'],
      default: 'locked',
    },
    mcqs: { type: [quizMcqSchema], default: [] },
    codingQuestions: { type: [quizCodingSchema], default: [] },
    attempts: { type: Number, default: 0 },
    lastScore: { type: Number, default: null },
    lastResult: { type: String, default: '' },
    generatedAt: { type: Date, default: null },
    lastTakenAt: { type: Date, default: null },
  },
  { _id: false }
);

const languagePathSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      enum: ['python', 'java', 'c'],
      required: true,
    },
    proficiencyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
    },
    tasks: {
      type: [learningTaskSchema],
      default: [],
    },
    cycle: {
      type: Number,
      default: 1,
    },
    quiz: {
      type: quizSchema,
      default: () => ({}),
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const learningPathSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    paths: {
      type: [languagePathSchema],
      default: [],
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

learningPathSchema.index({ userId: 1 });

module.exports = mongoose.model('LearningPath', learningPathSchema);
