const express = require('express');
const router = express.Router();
const vnpayController = require('../controllers/vnpayController');

// Tạo URL thanh toán VNPay
router.post('/create-payment-url', vnpayController.createPaymentUrl);

// Xử lý callback từ VNPay - đảm bảo endpoint này khớp với đường dẫn trong frontend
router.get('/callback', vnpayController.handleCallback);

module.exports = router;