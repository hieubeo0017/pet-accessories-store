const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// GET /api/categories - Lấy tất cả danh mục
router.get('/', categoryController.getAllCategories);

// Route /type/:type phải đặt TRƯỚC /:id để không bị nhầm lẫn
router.get('/type/:type', categoryController.getCategoriesByType);

// GET /api/categories/:id - Lấy danh mục theo ID
router.get('/:id', categoryController.getCategoryById);

// Các routes khác
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;