const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// Route to send a single email
router.post('/send', emailController.sendEmail);

// Route to create an email campaign
router.post('/campaign', emailController.createCampaign);

// Route to test API key
router.get('/test-api-key', emailController.testApiKey);

module.exports = router;