const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getReviews);         // Lấy danh sách đánh giá
router.delete('/:id', userController.deleteReview); // Xóa đánh giá
router.patch('/:id/approval', userController.toggleReviewApproval); // Cập nhật trạng thái duyệt đánh giá

module.exports = router;