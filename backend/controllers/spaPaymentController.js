const spaPaymentModel = require('../models/spaPaymentModel');
const spaAppointmentModel = require('../models/spaAppointmentModel');

const spaPaymentController = {
  // Tạo thanh toán mới
  createPayment: async (req, res) => {
    try {
      const { appointment_id } = req.params;
      const paymentData = req.body;
      
      // Validate dữ liệu
      if (!paymentData.amount || !paymentData.payment_method) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin thanh toán bắt buộc'
        });
      }
      
      // Kiểm tra lịch hẹn tồn tại
      const appointment = await spaAppointmentModel.getById(appointment_id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lịch hẹn'
        });
      }
      
      // Kiểm tra số tiền thanh toán không vượt quá tổng tiền lịch hẹn
      if (parseFloat(paymentData.amount) > parseFloat(appointment.total_amount)) {
        return res.status(400).json({
          success: false,
          message: 'Số tiền thanh toán không thể lớn hơn tổng tiền dịch vụ'
        });
      }
      
      // Tạo dữ liệu thanh toán
      const payment = await spaPaymentModel.create({
        appointment_id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        transaction_id: paymentData.transaction_id,
        notes: paymentData.notes,
        update_appointment_status: paymentData.amount >= appointment.total_amount
      });
      
      // Lấy thông tin lịch hẹn cập nhật
      const updatedAppointment = await spaAppointmentModel.getById(appointment_id);
      
      res.json({
        success: true,
        message: 'Thanh toán thành công',
        data: {
          payment_id: payment.id,
          appointment: updatedAppointment
        }
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi thực hiện thanh toán',
        error: error.message
      });
    }
  },
  
  // Lấy lịch sử thanh toán
  getPaymentHistory: async (req, res) => {
    try {
      const { appointment_id } = req.params;
      
      // Kiểm tra lịch hẹn tồn tại
      const appointment = await spaAppointmentModel.getById(appointment_id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lịch hẹn'
        });
      }
      
      // Lấy lịch sử thanh toán
      const payments = await spaPaymentModel.getByAppointmentId(appointment_id);
      
      res.json({
        success: true,
        data: payments
      });
    } catch (error) {
      console.error('Error getting payment history:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy lịch sử thanh toán',
        error: error.message
      });
    }
  },
  
  // Xử lý callback từ cổng thanh toán
  handlePaymentCallback: async (req, res) => {
    try {
      const paymentData = req.body;
      
      // Phần này sẽ thay đổi tùy thuộc vào cổng thanh toán bạn tích hợp
      // Dưới đây là ví dụ cho VNPay
      // Xác thực chữ ký từ VNPay
      const isValidSignature = validateVNPaySignature(paymentData);
      if (!isValidSignature) {
        return res.status(400).json({
          success: false,
          message: 'Chữ ký không hợp lệ'
        });
      }
      
      // Trích xuất thông tin lịch hẹn từ mã đơn hàng
      const appointmentId = extractAppointmentId(paymentData.vnp_OrderInfo);
      const appointment = await spaAppointmentModel.getById(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lịch hẹn'
        });
      }
      
      // Kiểm tra trạng thái thanh toán
      if (paymentData.vnp_ResponseCode === '00') {
        // Thanh toán thành công
        // Tạo thanh toán mới
        await spaPaymentModel.create({
          appointment_id: appointmentId,
          amount: paymentData.vnp_Amount / 100, // VNPay trả về số tiền x100
          payment_method: 'vnpay',
          transaction_id: paymentData.vnp_TransactionNo,
          status: 'completed',
          notes: 'Thanh toán qua VNPay',
          update_appointment_status: true
        });
        
        res.json({ success: true, message: 'Thanh toán thành công' });
      } else {
        // Thanh toán thất bại
        res.json({ success: false, message: 'Thanh toán thất bại' });
      }
    } catch (error) {
      console.error('Error handling payment callback:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xử lý callback thanh toán',
        error: error.message
      });
    }
  }
};

// Helper function để validate chữ ký VNPay
function validateVNPaySignature(paymentData) {
  // Implement validation logic for VNPay signature
  // Cần dựa vào tài liệu VNPay để implement đầy đủ
  return true; // Giả định luôn hợp lệ cho ví dụ
}

// Helper function để trích xuất ID lịch hẹn từ thông tin đơn hàng
function extractAppointmentId(orderInfo) {
  // Format gửi đi: "Thanh toan lich hen spa #APT-0001"
  const matches = orderInfo.match(/#(APT-\d+)/);
  if (matches && matches.length > 1) {
    return matches[1];
  }
  return null;
}

module.exports = spaPaymentController;