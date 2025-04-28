const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Route tìm kiếm tổng hợp
router.get('/', searchController.searchAll);

module.exports = router;