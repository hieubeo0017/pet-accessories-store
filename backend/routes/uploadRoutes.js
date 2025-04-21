const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// Endpoint upload một ảnh
router.post('/single', uploadController.uploadSingle);

// Endpoint upload nhiều ảnh
router.post('/multiple', uploadController.uploadMultiple);

module.exports = router;