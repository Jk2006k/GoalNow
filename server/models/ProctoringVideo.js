const mongoose = require('mongoose');

const ProctoringVideoSchema = new mongoose.Schema({
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
  filePath: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    default: 'video/webm',
  },
  fileSizeBytes: {
    type: Number,
    required: true,
  },
  startedAt: {
    type: Date,
    default: null,
  },
  endedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ProctoringVideo', ProctoringVideoSchema);