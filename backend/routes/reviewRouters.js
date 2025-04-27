const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getReviews);
router.delete('/:id', userController.deleteReview);
module.exports = router;