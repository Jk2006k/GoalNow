const mongoose = require('mongoose');

const ProctoringScreenshotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  interviewType: {
    type: String,
    enum: ['behavioral', 'technical'],
    required: true,
    default: 'behavioral',
  },
  imageData: {
    type: String,
    required: true,
  },
  capturedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ProctoringScreenshot', ProctoringScreenshotSchema);
