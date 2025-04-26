const otpService = require('../services/otpService');
const emailController = require('../controllers/emailController');

const verificationController = {
  // API gửi mã xác thực email
  sendVerificationCode: async (req, res) => {
    try {
      const { email, purpose = 'spa_booking' } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email không được để trống' });
      }
      
      // Tạo mã OTP 6 chữ số
      const code = otpService.generateOTP();
      
      // Lưu vào database
      const result = await otpService.saveOTP(email, code, purpose);
      
      // Gọi hàm trực tiếp từ emailController
      try {
        await emailController.sendOtpEmail(email, code);
        
        res.status(200).json({ 
          message: 'Mã xác thực đã được gửi đến email của bạn',
          expiresIn: 15 // phút
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        res.status(500).json({ message: 'Không thể gửi email xác thực' });
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      res.status(500).json({ message: 'Không thể gửi mã xác thực' });
    }
  },
  
  // API xác thực mã OTP đã nhập
  verifyCode: async (req, res) => {
    try {
      const { email, code, purpose = 'spa_booking' } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({ message: 'Email và mã xác thực không được để trống' });
      }
      
      console.log(`Đang xác thực mã OTP: ${code} cho email: ${email}`);
      
      try {
        const result = await otpService.verifyOTP(email, code, purpose);
        
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        
        res.status(200).json({ 
          message: 'Xác thực thành công',
          verified: true
        });
      } catch (otpError) {
        console.error('Chi tiết lỗi xác thực OTP:', otpError);
        res.status(500).json({ 
          message: 'Lỗi khi xác thực mã', 
          error: otpError.message || 'Không xác định'
        });
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      res.status(500).json({ message: 'Lỗi khi xác thực mã' });
    }
  }
};

module.exports = verificationController;