const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');

// Route gửi mã xác thực
router.post('/send-code', verificationController.sendVerificationCode);

// Route xác thực mã
router.post('/verify-code', verificationController.verifyCode);

module.exports = router;