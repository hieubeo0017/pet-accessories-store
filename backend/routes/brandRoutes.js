const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { check } = require('express-validator');

// Middleware validation cho brand
const validateBrand = [
  check('name')
    .trim()
    .not().isEmpty().withMessage('Tên thương hiệu không được để trống')
    .isLength({ max: 100 }).withMessage('Tên thương hiệu không được vượt quá 100 ký tự'),
  check('logo')
    .not().isEmpty().withMessage('Logo thương hiệu không được để trống'),
    // Đã bỏ phần custom validation cho URL
  check('website')
    .optional({ nullable: true, checkFalsy: true })
    .isURL().withMessage('Website phải là một URL hợp lệ'),
  check('is_active')
    .optional()
    .isBoolean().withMessage('Trạng thái phải là boolean')
];

// Thêm route mới trước các route khác
// GET thương hiệu nổi bật
router.get('/featured', brandController.getFeaturedBrands);

// GET tất cả thương hiệu với phân trang và lọc
router.get('/', brandController.getAllBrands);

// GET thương hiệu theo ID
router.get('/:id', brandController.getBrandById);

// POST tạo thương hiệu mới với validation
router.post('/', validateBrand, brandController.createBrand);

// PUT cập nhật thương hiệu với validation
router.put('/:id', validateBrand, brandController.updateBrand);

// DELETE xóa thương hiệu
router.delete('/:id', brandController.deleteBrand);

module.exports = router;