const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
// const authMiddleware = require('../middlewares/auth');  // Có thể giữ lại để tham khảo

// Public routes
router.get('/', blogController.getAll);
router.get('/featured', blogController.getFeaturedBlogs);
router.get('/:id', blogController.getById);

// Routes không yêu cầu đăng nhập
router.post('/', blogController.create);
router.put('/:id', blogController.update);
router.delete('/:id', blogController.delete);

// Thêm route mới

// Route cập nhật trạng thái nổi bật
router.put('/:id/featured', blogController.setFeatured);

module.exports = router;