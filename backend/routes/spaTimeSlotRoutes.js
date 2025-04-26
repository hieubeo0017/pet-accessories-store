const express = require('express');
const router = express.Router();
const SpaTimeSlotController = require('../controllers/spaTimeSlotController');
// Tạm thời bỏ import middleware để tất cả các route đều công khai
// const { adminAuth } = require('../middleware/authMiddleware');

// Route công khai - kiểm tra chỗ trống theo ngày
router.get('/availability', SpaTimeSlotController.checkAvailability);

// Routes - tạm thời bỏ middleware adminAuth để test
router.get('/', SpaTimeSlotController.getAllTimeSlots);
router.get('/:id', SpaTimeSlotController.getTimeSlotById);
router.post('/', SpaTimeSlotController.createTimeSlot); // Bỏ adminAuth
router.put('/:id', SpaTimeSlotController.updateTimeSlot); // Bỏ adminAuth
router.delete('/:id', SpaTimeSlotController.deleteTimeSlot); // Bỏ adminAuth

module.exports = router;