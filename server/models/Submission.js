/**
 * Submission Model
 * Stores code submissions and evaluation results
 */

const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: "anonymous", // Can be ObjectId ref to User or just string for anonymous users
    index: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
    index: true,
  },
  languageId: {
    type: String,
    enum: ["71", "63", "62", "54"],
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  testsPassed: {
    type: Number,
    required: true,
    min: 0,
  },
  totalTests: {
    type: Number,
    required: true,
    min: 1,
  },
  accepted: {
    type: Boolean,
    required: true,
    index: true,
  },
  results: [
    {
      passed: Boolean,
      input: mongoose.Schema.Types.Mixed,
      expected: String,
      actual: String,
      error: String,
    },
  ],
  runtime: {
    type: Number, // milliseconds
    default: null,
  },
  memory: {
    type: Number, // bytes
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for querying user submissions
SubmissionSchema.index({ userId: 1, createdAt: -1 });
SubmissionSchema.index({ questionId: 1, accepted: 1 });

// Indexes for statistics
SubmissionSchema.index({ accepted: 1, createdAt: -1 });
SubmissionSchema.index({ userId: 1, questionId: 1, createdAt: -1 });

/**
 * Get submission statistics
 */
SubmissionSchema.statics.getStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        accepted: { $sum: { $cond: ["$accepted", 1, 0] } },
        avgTestPassed: { $avg: "$testsPassed" },
      },
    },
  ]);

  return stats[0] || { total: 0, accepted: 0, avgTestPassed: 0 };
};

/**
 * Get accepted questions for a user
 */
SubmissionSchema.statics.getAcceptedQuestions = async function (userId, limit = 10) {
  return this.aggregate([
    { $match: { userId, accepted: true } },
    { $group: { _id: "$questionId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "questions",
        localField: "_id",
        foreignField: "_id",
        as: "question",
      },
    },
  ]);
};

module.exports = mongoose.model("Submission", SubmissionSchema);
