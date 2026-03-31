const mongoose = require("mongoose");
const questionDBConnection = require("../config/questionDB");

/**
 * Question Schema
 * Stores DSA problems with test cases
 * 
 * Note: This model uses a SEPARATE MongoDB connection (questionDBConnection)
 * NOT the default application database connection
 */

const testCaseSchema = new mongoose.Schema(
  {
    input: {
      type: mongoose.Schema.Types.Mixed, // Can be object, array, string, etc.
      required: true,
      description: "Test case input (can be any JSON-serializable data)",
    },
    output: {
      type: String,
      required: true,
      description: "Expected output (normalized for comparison)",
    },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      example: "Two Sum",
    },
    description: {
      type: String,
      required: true,
      description: "Problem statement",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
      required: true,
    },
    functionName: {
      type: String,
      required: true,
      description: "Name of the function to implement",
      example: "solution",
    },
    starterCode: {
      type: Map,
      of: String,
      required: true,
      description:
        "Starter code for different languages (key: language_id, value: code)",
      example: {
        "71": "def solution(nums, target):\n    pass",
        "63": "function solution(nums, target) {\n    return [];\n}",
      },
    },
    testCases: {
      type: [testCaseSchema],
      required: true,
      minlength: 1,
      description: "Public test cases shown to users",
    },
    hiddenTestCases: {
      type: [testCaseSchema],
      required: true,
      minlength: 1,
      description: "Hidden test cases used for final evaluation (never sent to frontend)",
    },
    tags: {
      type: [String],
      default: [],
      example: ["array", "two-pointers", "hash-map"],
    },
    acceptanceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    acceptedSubmissions: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "questions",
  }
);

// Index for random queries
questionSchema.index({ difficulty: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ title: "text", description: "text" });

/**
 * Create model using separate question database connection
 * This ensures questions are stored in a different database from user data
 */
const Question = questionDBConnection.model("Question", questionSchema);

module.exports = Question;
