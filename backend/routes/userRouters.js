const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth'); // Add this import statement

// Quản lý người dùng
router.post('/', userController.create);        // Tạo người dùng mới
router.get('/', userController.getAll);         // Lấy danh sách người dùng
router.get('/:id', userController.getById);     // Lấy thông tin một người dùng
router.put('/:id', userController.update);      // Cập nhật thông tin người dùng
router.delete('/:id', userController.delete);   // Xóa người dùng

// Thêm route đổi mật khẩu
router.put('/:id/change-password', authMiddleware, userController.changePassword);

// Quản lý đánh giá (reviews) - Sửa endpoint
router.get('/api/reviews', userController.getReviews);         // Lấy danh sách đánh giá
router.delete('/api/reviews/:id', userController.deleteReview); // Xóa đánh giá

module.exports = router;