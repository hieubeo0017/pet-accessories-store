const express = require('express');
const router = express.Router();
const spaAppointmentController = require('../controllers/spaAppointmentController');

// Lấy danh sách lịch hẹn spa với phân trang và tìm kiếm
router.get('/', spaAppointmentController.getAllAppointments);

// Đảm bảo route availability được định nghĩa TRƯỚC route ':id'
router.get('/availability', spaAppointmentController.checkAvailability);

// Đảm bảo route này đặt TRƯỚC route '/:id' để tránh xung đột
router.get('/search', spaAppointmentController.searchAppointments);

// Lấy thông tin chi tiết lịch hẹn
router.get('/:id', spaAppointmentController.getAppointmentById);

// Tạo lịch hẹn mới
router.post('/', spaAppointmentController.createAppointment);

// Cập nhật trạng thái lịch hẹn
router.put('/:id/status', spaAppointmentController.updateAppointmentStatus);

// Cập nhật trạng thái thanh toán
router.put('/:id/payment-status', spaAppointmentController.updatePaymentStatus);

// Cập nhật thông tin lịch hẹn
router.put('/:id', spaAppointmentController.updateAppointment);

// Đổi lịch hẹn (chỉ đổi ngày giờ)
router.put('/:id/reschedule', spaAppointmentController.rescheduleAppointment);

// Thêm route mới để khôi phục lịch hẹn
router.put('/:id/restore', spaAppointmentController.restoreAppointment);

// Xóa lịch hẹn
router.delete('/:id', spaAppointmentController.deleteAppointment);

module.exports = router;