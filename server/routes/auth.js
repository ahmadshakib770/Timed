import express from 'express';
import { body } from 'express-validator';
import {
  requestVerification,
  verifyCode,
  completeSignup,
  login,
  getMe
} from '../controllers/authController.js';

const router = express.Router();

// @route   POST /api/auth/request-verification
// @desc    Request email verification code
// @access  Public
router.post('/request-verification', [
  body('email').isEmail().normalizeEmail()
], requestVerification);

// @route   POST /api/auth/verify-code
// @desc    Verify email code
// @access  Public
router.post('/verify-code', [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 })
], verifyCode);

// @route   POST /api/auth/complete-signup
// @desc    Complete signup with password and nickname
// @access  Public
router.post('/complete-signup', [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }),
  body('password').isLength({ min: 6 }),
  body('nickname').trim().isLength({ min: 2, max: 30 })
], completeSignup);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', getMe);

export default router;
