import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateVerificationCode, sendVerificationEmail } from '../utils/email.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Request email verification code
// @route   POST /api/auth/request-verification
// @access  Public
export const requestVerification = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existingUser) {
      // Update existing unverified user
      existingUser.verificationCode = code;
      existingUser.verificationExpires = expiresAt;
      await existingUser.save();
    } else {
      // Create new user (without password yet)
      await User.create({
        email,
        password: 'temporary', // Will be updated after verification
        nickname: 'temporary', // Will be updated after verification
        verificationCode: code,
        verificationExpires: expiresAt,
        isVerified: false
      });
    }

    // Send email
    const emailSent = await sendVerificationEmail(email, code);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.json({ 
      message: 'Verification code sent to your email',
      email 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify email code
// @route   POST /api/auth/verify-code
// @access  Public
export const verifyCode = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, code } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification request' });
    }

    // Check if code matches and hasn't expired
    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (user.verificationExpires < Date.now()) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    // Return success, user can now set password and nickname
    res.json({ 
      message: 'Email verified successfully',
      email,
      needsCompletion: true 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Complete signup with password and nickname
// @route   POST /api/auth/complete-signup
// @access  Public
export const completeSignup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, code, password, nickname } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid signup request' });
    }

    // Verify code one more time
    if (user.verificationCode !== code || user.verificationExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Check if nickname is already taken (case-sensitive)
    const nicknameExists = await User.findOne({ nickname });
    if (nicknameExists && nicknameExists._id.toString() !== user._id.toString()) {
      return res.status(400).json({ message: 'This nickname is already taken' });
    }

    // Update user with password and nickname
    user.password = password;
    user.nickname = nickname;
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpires = null;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Signup completed successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    // Extract token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -verificationCode');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname
      }
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
