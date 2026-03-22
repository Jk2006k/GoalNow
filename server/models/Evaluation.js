const mongoose = require('mongoose');

const EvaluationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interviewType: {
    type: String,
    enum: ['behavioral', 'technical'],
    required: true
  },
  questionIndex: {
    type: Number,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  transcribedAnswer: {
    type: String,
    required: true
  },
  audioFile: {
    type: String,
    default: null
  },
  score: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  },
  feedback: {
    type: String,
    default: null
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  evaluatedAt: {
    type: Date,
    default: null
  },
  isEvaluated: {
    type: Boolean,
    default: false
  },
  isProctoringEvaluated: {
    type: Boolean,
    default: false
  },
  proctoringStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  proctoringReviewedAt: {
    type: Date,
    default: null
  },
  proctoringTriggerCount: {
    type: Number,
    default: 0,
    min: 0
  },
  redCard: {
    type: Boolean,
    default: false
  },
  redCardReasons: {
    type: [String],
    default: []
  },
  evaluationScores: {
    clarity: { type: Number, default: null },
    relevance: { type: Number, default: null },
    completeness: { type: Number, default: null },
    professionalism: { type: Number, default: null }
  }
});

module.exports = mongoose.model('Evaluation', EvaluationSchema);
