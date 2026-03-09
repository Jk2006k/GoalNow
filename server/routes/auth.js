const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Google OAuth Callback
router.post('/google-signup', async (req, res) => {
  try {
    const { googleId, firstName, lastName, email, googleProfileImage } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // Update google profile image if not already set
      if (!user.googleProfileImage && googleProfileImage) {
        user.googleProfileImage = googleProfileImage;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        googleId,
        firstName,
        lastName,
        email,
        googleProfileImage,
        signupMethod: 'google',
        verified: true,
      });
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.googleProfileImage,
        signupMethod: user.signupMethod,
      },
    });
  } catch (error) {
    console.error('Google signup error:', error);
    res.status(500).json({ message: 'Error during signup' });
  }
});

// Email Signup
router.post('/email-signup', async (req, res) => {
  try {
    const { firstName, lastName, email, profileImage } = req.body;

    if (!firstName || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      firstName,
      lastName: lastName || '',
      email,
      profileImage: profileImage || null,
      signupMethod: 'email',
      verified: false,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
        signupMethod: user.signupMethod,
      },
    });
  } catch (error) {
    console.error('Email signup error:', error);
    res.status(500).json({ message: 'Error during signup' });
  }
});

// Get User Profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-googleId');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update User Profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { firstName, lastName, profileImage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        firstName,
        lastName,
        profileImage,
        updatedAt: new Date(),
      },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

module.exports = router;
