const { sql, connectDB } = require('../config/database');
const vnpayService = require('../services/vnpayService');
const spaAppointmentModel = require('../models/spaAppointmentModel');
const spaPaymentModel = require('../models/spaPaymentModel');
const spaServiceModel = require('../models/spaServiceModel');
const emailController = require('../controllers/emailController');
const { generateBookingConfirmationEmail } = require('../controllers/spaAppointmentController');
const moment = require('moment');

const formatIpAddress = (ipAddr) => {
  return ipAddr === '::1' ? '127.0.0.1' : (ipAddr || '127.0.0.1');
};

const vnpayController = {
  // Cập nhật hàm createPaymentUrl để nhận bankCode từ request
  createPaymentUrl: async (req, res) => {
    try {
      const { appointment_id, amount, redirect_url, bankCode } = req.body;
      
      // Kiểm tra tham số bắt buộc
      if (!appointment_id || !amount || !redirect_url) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bắt buộc'
        });
      }

      // Lấy thông tin lịch hẹn
      const appointment = await spaAppointmentModel.getById(appointment_id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lịch hẹn'
        });
      }
      
      // Tạo thông tin thanh toán
      const ipAddr = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress || 
                     req.connection.socket.remoteAddress;
      
      // Tạo URL thanh toán - truyền bankCode từ request
      const paymentUrl = vnpayService.createPaymentUrl({
        amount: parseFloat(amount),
        orderInfo: `${appointment_id.replace(/[^a-zA-Z0-9]/g, '')}`,
        orderType: 'billpayment',
        bankCode: bankCode || '', // Sử dụng bankCode từ request nếu có
        language: 'vn',
        ipAddr: formatIpAddress(ipAddr),
        // Đảm bảo URL được định dạng đúng cách
        returnUrl: redirect_url.startsWith('http') ? redirect_url.trim() : `http://localhost:3000/payment/callback`,
        txnRef: `PAY${moment().format('YYYYMMDDHHmmss')}` // Sử dụng định dạng đầy đủ hơn
      });
      
      res.json({
        success: true,
        message: 'Tạo URL thanh toán thành công',
        paymentUrl: paymentUrl.url,
        txnRef: paymentUrl.txnRef
      });
    } catch (error) {
      console.error('Error creating VNPay URL:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo URL thanh toán',
        error: error.message
      });
    }
  },

  // Sửa hàm handleCallback trong vnpayController.js
  handleCallback: async (req, res) => {
    try {
      const vnpParams = req.query;
      const isFromFrontend = req.query.isFromFrontend === 'true';
      
      // Kiểm tra xem có tham số nào được gửi không
      if (Object.keys(vnpParams).length === 0) {
        return res.status(200).json({
          success: false,
          message: 'Không có tham số nào được gửi từ VNPAY'
        });
      }
      
      // Kiểm tra chữ ký
      const isValidSignature = vnpayService.verifyReturnUrl(vnpParams);
      
      if (!isValidSignature) {
        return res.status(400).json({
          success: false,
          message: 'Chữ ký không hợp lệ'
        });
      }

      // Xử lý kết quả thanh toán
      const vnp_ResponseCode = vnpParams['vnp_ResponseCode'];
      const vnp_TxnRef = vnpParams['vnp_TxnRef'];
      const vnp_Amount = vnpParams['vnp_Amount'] / 100; // Chuyển về đơn vị tiền thực
      const vnp_OrderInfo = vnpParams['vnp_OrderInfo'];
      const vnp_BankCode = vnpParams['vnp_BankCode'];
      const vnp_PayDate = vnpParams['vnp_PayDate'];
      const vnp_TransactionNo = vnpParams['vnp_TransactionNo'];

      // Trích xuất appointment_id từ orderInfo
      const appointmentIdMatch = vnp_OrderInfo.match(/THANHTOAN(APT\d+)/i);
      let appointmentId;
      if (!appointmentIdMatch || appointmentIdMatch.length < 2) {
        const directMatch = vnp_OrderInfo.replace('THANHTOAN', '');
        
        if (directMatch.startsWith('APT')) {
          appointmentId = directMatch.replace(/^(APT)(\d+)$/i, 'APT-$2');
        } else {
          console.log("Không thể trích xuất appointment_id, sử dụng txnRef:", vnp_TxnRef);
          return res.status(400).json({
            success: false,
            message: 'Không thể xác định lịch hẹn từ thông tin đơn hàng',
            orderInfo: vnp_OrderInfo
          });
        }
      } else {
        appointmentId = appointmentIdMatch[1].replace(/^(APT)(\d+)$/i, 'APT-$2');
      }

      // Kiểm tra lịch hẹn tồn tại
      const appointment = await spaAppointmentModel.getById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lịch hẹn'
        });
      }

      // Kiểm tra giao dịch đã tồn tại chưa
      const existingTransactionPayment = await spaPaymentModel.findByTransactionId(vnp_TransactionNo);
      if (existingTransactionPayment) {
       
        return res.status(200).json({
          success: true,
          message: 'Giao dịch đã được xử lý trước đó',
          data: {
            appointment_id: appointmentId,
            payment_id: existingTransactionPayment.id,
            amount: vnp_Amount,
            transaction_id: vnp_TransactionNo,
            bank_code: vnp_BankCode
          }
        });
      }

      // Nếu thanh toán thành công
      if (vnp_ResponseCode === '00') {
        try {
          console.log("Thanh toán VNPAY thành công, xử lý giao dịch...");
          
          // Tìm bản ghi thanh toán e-wallet gần nhất (có thể chưa có transaction_id)
          const latestEwalletPayment = await spaPaymentModel.findLatestByAppointmentId(appointmentId);
          
          let paymentResult;
          
          // Nếu đã có bản ghi thanh toán e-wallet và chưa có transaction_id hoặc có status là 'pending'
          if (latestEwalletPayment && 
              latestEwalletPayment.payment_method === 'e-wallet' && 
              (latestEwalletPayment.status === 'pending' || !latestEwalletPayment.transaction_id || latestEwalletPayment.transaction_id === 'undefined')) {
            
            // Cập nhật transaction_id và status cho bản ghi hiện có
            const updateResult = await spaPaymentModel.updateTransactionAndStatus(
              latestEwalletPayment.id, 
              vnp_TransactionNo,
              'completed' // Đổi status thành completed
            );
            
            if (updateResult.success) {
              paymentResult = { 
                success: true, 
                id: latestEwalletPayment.id 
              };
            } else {
              // Xử lý lỗi nếu cần
            }
          } else {
            // Chỉ tạo bản ghi mới nếu không tìm thấy bản ghi phù hợp
            paymentResult = await spaPaymentModel.create({
              appointment_id: appointmentId,
              amount: vnp_Amount,
              payment_method: 'e-wallet',
              transaction_id: vnp_TransactionNo, // Quan trọng: Lưu transaction_id ngay khi tạo
              payment_date: moment(vnp_PayDate, 'YYYYMMDDHHmmss').toDate(),
              status: 'completed',
              notes: `Thanh toán qua VNPay - Ngân hàng: ${vnp_BankCode}`,
              update_appointment_status: vnp_Amount >= appointment.total_amount
            });
          }
          
          // Cập nhật trạng thái thanh toán cho lịch hẹn
          if (vnp_Amount >= appointment.total_amount) {
            await spaAppointmentModel.updatePaymentStatus(appointmentId, 'paid');
            console.log(`Đã cập nhật trạng thái thanh toán của lịch hẹn ${appointmentId} thành paid`);
          }

          // Đảm bảo cập nhật trạng thái lịch hẹn thành "confirmed"
          await spaAppointmentModel.updateStatus(appointmentId, 'confirmed');
          console.log(`Đã cập nhật trạng thái lịch hẹn ${appointmentId} thành 'confirmed' sau khi thanh toán VNPAY thành công`);

          // Sau khi thanh toán thành công, gửi email xác nhận
          try {
            // Lấy thông tin đầy đủ của lịch hẹn
            const updatedAppointment = await spaAppointmentModel.getById(appointmentId);
            
            // Lấy thông tin chi tiết về dịch vụ đã đặt
            const serviceDetails = await spaServiceModel.getServicesByAppointmentId(appointmentId);
            
            // Cập nhật payment_method thành 'vnpay' để email hiển thị đúng
            updatedAppointment.payment_method = 'vnpay';
            
            // Tạo nội dung email
            const emailSubject = `Xác nhận đặt lịch và thanh toán spa thú cưng - ${updatedAppointment.id}`;
            const emailContent = generateBookingConfirmationEmail(
              updatedAppointment, 
              serviceDetails, 
              updatedAppointment.full_name
            );
            
            // Gửi email
            if (updatedAppointment.email) {
              await emailController.sendBookingConfirmationEmail(
                updatedAppointment.email,
                emailSubject,
                emailContent,
                updatedAppointment
              );
              
              console.log('Đã gửi email xác nhận sau khi thanh toán VNPAY thành công đến:', updatedAppointment.email);
            }
          } catch (emailError) {
            console.error('Lỗi khi gửi email xác nhận sau thanh toán VNPAY:', emailError);
            // Không làm ảnh hưởng đến kết quả thanh toán
          }

          // Trả về kết quả
          return res.json({
            success: true,
            message: 'Thanh toán thành công',
            data: {
              appointment_id: appointmentId,
              payment_id: paymentResult.id,
              amount: vnp_Amount,
              transaction_id: vnp_TransactionNo,
              bank_code: vnp_BankCode,
              pay_date: vnp_PayDate
            }
          });
        } catch (paymentError) {
          console.error("Lỗi khi xử lý thanh toán:", paymentError);
          return res.json({
            success: true,
            message: 'Giao dịch thành công nhưng có lỗi khi lưu dữ liệu',
            error: paymentError.message,
            data: {
              appointment_id: appointmentId,
              amount: vnp_Amount,
              transaction_id: vnp_TransactionNo
            }
          });
        }
      } else {
        // Thanh toán thất bại
        return res.json({
          success: false,
          message: 'Thanh toán không thành công',
          responseCode: vnp_ResponseCode
        });
      }
    } catch (error) {
      console.error('Error handling VNPay callback:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xử lý callback từ VNPay',
        error: error.message
      });
    }
  }
};

module.exports = vnpayController;