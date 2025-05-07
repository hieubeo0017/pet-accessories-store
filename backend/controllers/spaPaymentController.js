const spaPaymentModel = require('../models/spaPaymentModel');
const spaAppointmentModel = require('../models/spaAppointmentModel');
const spaServiceModel = require('../models/spaServiceModel');
const emailController = require('../controllers/emailController');

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
      
      // Kiểm tra và cập nhật phương thức thanh toán nếu khác với phương thức lịch hẹn
      if (appointment.payment_method !== paymentData.payment_method) {
        console.log(`Phát hiện thay đổi phương thức thanh toán từ ${appointment.payment_method} sang ${paymentData.payment_method}`);
        
        // Cập nhật phương thức thanh toán trong database
        await spaAppointmentModel.updatePaymentMethod(appointment_id, paymentData.payment_method);
        
        // Gửi email xác nhận nếu chuyển từ VNPAY sang thanh toán tiền mặt
        if (appointment.payment_method === 'e-wallet' && paymentData.payment_method === 'cash') {
          try {
            // Lấy thông tin chi tiết về dịch vụ đã đặt
            const serviceDetails = await spaServiceModel.getServicesByAppointmentId(appointment_id);
            
            // Lấy thông tin cập nhật của lịch hẹn
            const updatedAppointment = await spaAppointmentModel.getById(appointment_id);
            updatedAppointment.payment_method = 'cash';  // Đảm bảo hiển thị đúng trong email
            
            // Tạo nội dung email
            const emailSubject = `Xác nhận đặt lịch và thanh toán spa thú cưng - ${updatedAppointment.id}`;
            const emailContent = require('../controllers/spaAppointmentController').generateBookingConfirmationEmail(
              updatedAppointment,
              serviceDetails,
              updatedAppointment.full_name
            );
            
            // Gửi email nếu có địa chỉ email
            if (updatedAppointment.email) {
              await emailController.sendBookingConfirmationEmail(
                updatedAppointment.email,
                emailSubject,
                emailContent,
                updatedAppointment
              );
              console.log(`Đã gửi email xác nhận sau khi chuyển sang thanh toán tiền mặt đến: ${updatedAppointment.email}`);
            }
          } catch (emailError) {
            console.error('Lỗi khi gửi email xác nhận sau khi chuyển phương thức thanh toán:', emailError);
          }
        }
      }
      
      // Tạo dữ liệu thanh toán
      const payment = await spaPaymentModel.create({
        appointment_id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        transaction_id: paymentData.transaction_id || null,
        status: paymentData.status || 'pending',
        notes: paymentData.notes || null,
        // Quan trọng: Chỉ cập nhật trạng thái thanh toán của lịch hẹn nếu KHÔNG phải tiền mặt
        update_appointment_status: paymentData.payment_method !== 'cash'
      });
      
      // Cập nhật trạng thái lịch hẹn dựa vào phương thức thanh toán và số tiền
      if (parseFloat(paymentData.amount) >= parseFloat(appointment.total_amount)) {
        if (paymentData.payment_method === 'cash') {
          // Tiền mặt - đặt trạng thái thanh toán là pending
          console.log(`Thanh toán tiền mặt đủ cho lịch hẹn ${appointment_id}, đặt trạng thái thanh toán là pending`);
          await spaAppointmentModel.updatePaymentStatus(appointment_id, 'pending');
        } else {
          // Các phương thức thanh toán online - đặt trạng thái thanh toán là paid và trạng thái lịch hẹn là confirmed
          await spaAppointmentModel.updatePaymentStatus(appointment_id, 'paid');
          await spaAppointmentModel.updateStatus(appointment_id, 'confirmed');
          console.log(`Đã tự động cập nhật trạng thái lịch hẹn ${appointment_id} thành 'confirmed' sau khi thanh toán online đủ`);
        }
      }
      
      // Lấy thông tin lịch hẹn cập nhật
      const updatedAppointment = await spaAppointmentModel.getById(appointment_id);
      
      res.json({
        success: true,
        message: paymentData.payment_method === 'cash' ? 'Đã ghi nhận phương thức thanh toán tại quầy' : 'Thanh toán thành công',
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
        
        // THÊM MỚI: Cập nhật trạng thái lịch hẹn thành "confirmed" (đã xác nhận)
        // để ngăn người dùng hủy lịch sau khi đã thanh toán
        await spaAppointmentModel.updateStatus(appointmentId, 'confirmed');
        console.log(`Đã tự động cập nhật trạng thái lịch hẹn ${appointmentId} thành 'confirmed' sau khi thanh toán thành công`);
        
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
  },

  // Đổi phương thức thanh toán của một lịch hẹn
  changePaymentMethod: async (req, res) => {
    try {
      const { appointment_id } = req.params;
      const { new_payment_method, transaction_id } = req.body;
      
      // Validate dữ liệu đầu vào
      if (!new_payment_method) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu phương thức thanh toán mới'
        });
      }
      
      // Kiểm tra phương thức thanh toán hợp lệ
      if (!['cash', 'vnpay', 'credit_card', 'bank_transfer', 'e-wallet'].includes(new_payment_method)) {
        return res.status(400).json({
          success: false,
          message: 'Phương thức thanh toán không hợp lệ'
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
      
      // Lưu phương thức thanh toán cũ để ghi chú
      const oldPaymentMethod = appointment.payment_method || 'cash';
      
      // Map vnpay thành e-wallet nếu người dùng chọn vnpay
      const dbPaymentMethod = new_payment_method === 'vnpay' ? 'e-wallet' : new_payment_method;

      // Cập nhật phương thức thanh toán trong bảng appointments
      await spaAppointmentModel.updatePaymentMethod(appointment_id, new_payment_method);

      // Chỉ cập nhật phương thức thanh toán, không cập nhật trạng thái
      if (new_payment_method === 'vnpay') {
        console.log(`Đã chuyển phương thức thanh toán của lịch hẹn ${appointment_id} sang VNPAY, đang chờ thanh toán`);
      }

      // Tìm bản ghi thanh toán gần nhất để cập nhật
      const latestPayment = await spaPaymentModel.findLatestByAppointmentId(appointment_id);
      
      if (latestPayment) {
        // Cập nhật phương thức thanh toán của bản ghi hiện có
        const notes = `Đổi phương thức thanh toán từ ${oldPaymentMethod} sang ${new_payment_method}`;
        
        if (new_payment_method === 'vnpay') {
          await spaPaymentModel.updatePaymentMethodAndStatus(
            latestPayment.id, 
            dbPaymentMethod, 
            'pending',  // Thay 'completed' thành 'pending'
            notes
          );
          console.log(`Đã cập nhật phương thức thanh toán của bản ghi ${latestPayment.id} thành ${dbPaymentMethod} và trạng thái thành pending`);
        } else {
          await spaPaymentModel.updatePaymentMethod(latestPayment.id, dbPaymentMethod, notes);
          console.log(`Đã cập nhật phương thức thanh toán của bản ghi ${latestPayment.id} thành ${dbPaymentMethod}`);
        }
      } else {
        // Nếu không tìm thấy bản ghi thanh toán, tạo mới
        await spaPaymentModel.create({
          appointment_id,
          amount: parseFloat(appointment.total_amount),
          payment_method: dbPaymentMethod,
          transaction_id: transaction_id || null,
          status: 'pending', // Thay vì status theo phương thức
          notes: `Đổi phương thức thanh toán từ ${oldPaymentMethod} sang ${new_payment_method}`,
          update_appointment_status: false
        });
      }
      
      // Lấy thông tin lịch hẹn đã cập nhật
      const updatedAppointment = await spaAppointmentModel.getById(appointment_id);
      
      res.json({
        success: true,
        message: 'Đổi phương thức thanh toán thành công',
        data: updatedAppointment
      });
    } catch (error) {
      console.error('Error changing payment method:', error);
      res.status(500).json({
        success: false, 
        message: 'Lỗi khi đổi phương thức thanh toán',
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