const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  profileImage: {
    type: String,
    default: null,
  },
  googleProfileImage: {
    type: String,
    default: null,
  },
  resume: {
    type: String,
    default: null,
  },
  resumeFileName: {
    type: String,
    default: null,
  },
  domain: {
    type: String,
    default: null,
  },
  signupMethod: {
    type: String,
    enum: ['google', 'email'],
    default: 'google',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
