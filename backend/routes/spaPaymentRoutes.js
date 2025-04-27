const express = require('express');
const router = express.Router();
const spaPaymentController = require('../controllers/spaPaymentController');

// Các API hiện có
router.post('/appointments/:appointment_id/payments', spaPaymentController.createPayment);
router.get('/appointments/:appointment_id/payments', spaPaymentController.getPaymentHistory);
router.post('/payment-callback', spaPaymentController.handlePaymentCallback);

// API mới để đổi phương thức thanh toán
router.put('/appointments/:appointment_id/payment-method', spaPaymentController.changePaymentMethod);

module.exports = router;