const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  type: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  reason: { type: String, required: true },
  confidence: { type: Number, min: 0, max: 1, default: 0.5 },
  capturedAt: { type: Date, required: true },
  screenshotId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProctoringScreenshot', default: null },
}, { _id: false });

const ProctoringAttemptReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  interviewType: {
    type: String,
    enum: ['behavioral', 'technical'],
    required: true,
    default: 'behavioral',
    index: true,
  },
  totalScreenshots: {
    type: Number,
    required: true,
    min: 0,
  },
  malpracticeDetected: {
    type: Boolean,
    default: false,
    index: true,
  },
  alerts: {
    type: [AlertSchema],
    default: [],
  },
  ruleSummary: {
    consecutiveNoFaceStreak: { type: Number, default: 0 },
    maxFacesDetected: { type: Number, default: 1 },
    highConfidenceMultipleFacesCount: { type: Number, default: 0 },
  },
  reviewedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ProctoringAttemptReport', ProctoringAttemptReportSchema);
