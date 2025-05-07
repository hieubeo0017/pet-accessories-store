const express = require('express');
const router = express.Router();
const spaServiceController = require('../controllers/spaServiceController');

/**
 * @route   GET /api/spa-services
 * @desc    Lấy danh sách dịch vụ spa với phân trang và lọc
 * @access  Public
 */
router.get('/', spaServiceController.getAllSpaServices);

/**
 * @route   GET /api/spa-services/featured
 * @desc    Lấy danh sách dịch vụ spa nổi bật
 * @access  Public
 */
router.get('/featured', spaServiceController.getFeaturedSpaServices);

/**
 * @route   GET /api/spa-services/related/:id
 * @desc    Lấy danh sách dịch vụ spa liên quan
 * @access  Public
 */
router.get('/related/:id', spaServiceController.getRelatedServices);

/**
 * @route   GET /api/spa-services/:id
 * @desc    Lấy chi tiết dịch vụ spa theo ID
 * @access  Public
 */
router.get('/:id', spaServiceController.getSpaServiceById);

/**
 * @route   POST /api/spa-services
 * @desc    Tạo dịch vụ spa mới
 * @access  Private/Admin
 */
router.post('/', spaServiceController.createSpaService);

/**
 * @route   PUT /api/spa-services/:id
 * @desc    Cập nhật dịch vụ spa
 * @access  Private/Admin
 */
router.put('/:id', spaServiceController.updateSpaService);

/**
 * @route   DELETE /api/spa-services/:id
 * @desc    Xóa dịch vụ spa
 * @access  Private/Admin
 */
router.delete('/:id', spaServiceController.deleteSpaService);

module.exports = router;