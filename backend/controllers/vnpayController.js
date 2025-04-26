const vnpayService = require('../services/vnpayService');
const spaAppointmentModel = require('../models/spaAppointmentModel');
const spaPaymentModel = require('../models/spaPaymentModel');
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

  // Xử lý callback từ VNPay
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
        // Trích xuất trực tiếp từ orderInfo không cần regex
        const directMatch = vnp_OrderInfo.replace('THANHTOAN', '');
        
        // Kiểm tra nếu directMatch bắt đầu bằng APT
        if (directMatch.startsWith('APT')) {
          appointmentId = directMatch.replace(/^(APT)(\d+)$/i, 'APT-$2');
        } else {
          // Trường hợp khẩn cấp: Lấy từ vnp_TxnRef
          console.log("Không thể trích xuất appointment_id, sử dụng txnRef:", vnp_TxnRef);
          
          return res.status(400).json({
            success: false,
            message: 'Không thể xác định lịch hẹn từ thông tin đơn hàng',
            orderInfo: vnp_OrderInfo
          });
        }
      } else {
        // Thêm dòng này để đảm bảo định dạng đúng APT-XXXX
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
      const existingPayment = await spaPaymentModel.findByTransactionId(vnp_TransactionNo);
      if (existingPayment) {
        console.log(`Giao dịch với mã ${vnp_TransactionNo} đã được xử lý trước đó. Bỏ qua.`);
        return res.status(200).json({
          success: true,
          message: 'Giao dịch đã được xử lý trước đó',
          data: {
            appointment_id: appointmentId,
            amount: vnp_Amount,
            transaction_id: vnp_TransactionNo,
            bank_code: vnp_BankCode
          }
        });
      }

      // Kiểm tra tổng số tiền đã thanh toán cho lịch hẹn
      const allPayments = await spaPaymentModel.getByAppointmentId(appointmentId);
      const totalPaid = allPayments.reduce((sum, payment) => 
        sum + parseFloat(payment.amount), 0);

      // Nếu đã thanh toán đủ hoặc thanh toán vượt quá, không tạo thanh toán mới
      if (totalPaid >= appointment.total_amount) {
        return res.status(200).json({
          success: true,
          message: 'Lịch hẹn này đã được thanh toán đủ trước đó',
          data: { appointment_id: appointmentId, total_paid: totalPaid }
        });
      }

      // Trước khi tạo thanh toán mới, kiểm tra xem appointment đã có thanh toán chưa
      const existingPayments = await spaPaymentModel.findByAppointmentIdAndStatus(appointmentId);
      if (existingPayments.length > 0) {
        console.log(`Appointment ${appointmentId} đã có thanh toán trước đó. Kiểm tra và cập nhật nếu cần.`);
        // Có thể thêm logic cập nhật payment_status nếu cần
        return res.status(200).json({
          success: true,
          message: 'Lịch hẹn này đã được thanh toán trước đó',
          data: {
            appointment_id: appointmentId,
            existing_payments: existingPayments
          }
        });
      }

      // Nếu thanh toán thành công
      if (vnp_ResponseCode === '00') {
        try {
          console.log("Bắt đầu lưu thanh toán VNPay vào database");
          // Tạo thanh toán mới
          const paymentResult = await spaPaymentModel.create({
            appointment_id: appointmentId,
            amount: vnp_Amount,
            payment_method: 'e-wallet',
            transaction_id: vnp_TransactionNo,
            payment_date: moment(vnp_PayDate, 'YYYYMMDDHHmmss').toDate(),
            status: 'completed',
            notes: `Thanh toán qua VNPay - Ngân hàng: ${vnp_BankCode}`,
            update_appointment_status: vnp_Amount >= appointment.total_amount
          });
          
          console.log("Kết quả lưu thanh toán:", paymentResult);
          
          // Cập nhật thêm trạng thái lịch hẹn nếu cần
          if (vnp_Amount >= appointment.total_amount) {
            await spaAppointmentModel.updatePaymentStatus(appointmentId, 'paid');
            console.log(`Đã cập nhật trạng thái thanh toán của lịch hẹn ${appointmentId} thành paid`);
          }

          // Trả về thông tin thanh toán thành công
          return res.json({
            success: true,
            message: 'Thanh toán thành công',
            data: {
              appointment_id: appointmentId,
              amount: vnp_Amount,
              transaction_id: vnp_TransactionNo,
              bank_code: vnp_BankCode,
              pay_date: vnp_PayDate
            }
          });
        } catch (paymentError) {
          console.error("Lỗi khi lưu thanh toán:", paymentError);
          // Vẫn trả về thành công cho người dùng nhưng ghi log lỗi
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