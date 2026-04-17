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
