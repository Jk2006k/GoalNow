const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    console.error('❌ CRITICAL: JWT_SECRET is not defined in .env');
    throw new Error('JWT_SECRET not configured');
  }
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
  console.log('✅ Token generated for userId:', userId);
  console.log('Token first 20 chars:', token.substring(0, 20) + '...');
  console.log('JWT_SECRET used (first 10 chars):', process.env.JWT_SECRET.substring(0, 10) + '...');
  return token;
};

// Google OAuth Callback
router.post('/google-signup', async (req, res) => {
  try {
    const { googleId, firstName, lastName, email, googleProfileImage, profileImage } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // Update profile image if not already set
      if (!user.profileImage && profileImage) {
        user.profileImage = profileImage;
        await user.save();
      }
    } else {
      // Create new user with profileImage (dicebear avatar)
      user = new User({
        googleId,
        firstName,
        lastName,
        email,
        profileImage: profileImage, // Use the generated dicebear avatar
        googleProfileImage,
        signupMethod: 'google',
        verified: true,
      });
      await user.save();
      console.log('Google signup - User created with profileImage:', profileImage ? profileImage.substring(0, 50) : 'not provided');
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage, // Return profileImage (dicebear), not googleProfileImage
        googleProfileImage: user.googleProfileImage,
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

    console.log('=== EMAIL SIGNUP REQUEST RECEIVED ===');
    console.log('- firstName:', firstName);
    console.log('- email:', email);
    console.log('- profileImage typeof:', typeof profileImage);
    console.log('- profileImage provided:', !!profileImage);
    
    if (profileImage) {
      console.log('- profileImage length:', profileImage.length);
      console.log('- profileImage is string:', typeof profileImage === 'string');
      console.log('- profileImage starts with:', profileImage.substring(0, 50));
      console.log('- profileImage includes "base64":', profileImage.includes('base64'));
    } else {
      console.log('- WARNING: profileImage is null/undefined/empty');
    }

    if (!firstName || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // User already exists - log them in and update profile image if provided
      if (profileImage && !user.profileImage) {
        user.profileImage = profileImage;
        await user.save();
      }
    } else {
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
    }

    console.log('=== USER SAVED TO DB ===');
    console.log('- User ID:', user._id);
    console.log('- Saved profileImage exists:', !!user.profileImage);
    if (user.profileImage) {
      console.log('- Saved profileImage length:', user.profileImage.length);
      console.log('- Saved profileImage sample:', user.profileImage.substring(0, 50));
    } else {
      console.log('- WARNING: profileImage is null in saved user');
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
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
    console.log('Getting profile for userId:', req.params.userId)
    const user = await User.findById(req.params.userId).select('-googleId');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User found:', user.firstName, user.email)
    console.log('ProfileImage in DB:', !!user.profileImage)
    console.log('ProfileImage length in DB:', user.profileImage?.length || 0)
    console.log('Resume in DB:', !!user.resume)
    console.log('Resume length in DB:', user.resume?.length || 0)
    console.log('Resume filename in DB:', user.resumeFileName)
    console.log('Domain in DB:', user.domain)
    if (user.resume) {
      console.log('Resume starts with:', user.resume.substring(0, 80));
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
    const { firstName, lastName, profileImage, resume, resumeFileName, domain } = req.body;
    
    console.log('=== UPDATE PROFILE ===');
    console.log('User ID:', req.params.userId);
    console.log('firstName:', firstName);
    console.log('domain:', domain);
    console.log('Resume provided:', !!resume);
    console.log('Resume filename:', resumeFileName);
    if (resume) {
      console.log('Resume size:', resume.length, 'bytes');
      console.log('Resume starts with:', resume.substring(0, 50));
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        firstName,
        lastName,
        profileImage,
        resume,
        resumeFileName,
        domain,
        updatedAt: new Date(),
      },
      { new: true }
    );
    
    console.log('Profile updated successfully');
    console.log('Saved resume:', !!user.resume);
    console.log('Saved resume filename:', user.resumeFileName);
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

module.exports = router;
