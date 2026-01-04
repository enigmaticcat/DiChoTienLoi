const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth');

// Public routes
router.post('/', authController.register);
router.post('/login', authController.login);
router.post('/send-verification-code', authController.sendVerificationCode);
router.post('/verify-email', authController.verifyEmail);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.post('/logout', protect, authController.logout);

module.exports = router;
