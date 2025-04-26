const express = require('express');
const router = express.Router();
const spaPaymentController = require('../controllers/spaPaymentController');

// Tạo thanh toán mới cho lịch hẹn
router.post('/appointments/:appointment_id/payments', spaPaymentController.createPayment);

// Lấy lịch sử thanh toán cho lịch hẹn
router.get('/appointments/:appointment_id/payments', spaPaymentController.getPaymentHistory);

// Xử lý callback từ cổng thanh toán
router.post('/payment-callback', spaPaymentController.handlePaymentCallback);

module.exports = router;