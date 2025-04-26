const { connectDB, sql } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

const otpService = {
  // Tạo mã OTP ngẫu nhiên
  generateOTP: () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Lưu mã OTP vào database
  saveOTP: async (email, code, purpose = 'spa_booking') => {
    try {
      const pool = await connectDB();
      const id = `OTP-${uuidv4().substring(0, 8)}`;
      
      // Thời gian hết hạn: 15 phút sau thời điểm tạo
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);
      
      // Xóa OTP cũ của email này (nếu có)
      await pool.request()
        .input('email', sql.VarChar(100), email)
        .input('purpose', sql.VarChar(20), purpose)
        .query(`DELETE FROM verification_codes 
                WHERE email = @email AND purpose = @purpose`);
      
      // Thêm OTP mới
      const result = await pool.request()
        .input('id', sql.VarChar(50), id)
        .input('email', sql.VarChar(100), email)
        .input('code', sql.VarChar(10), code)
        .input('purpose', sql.VarChar(20), purpose)
        .input('expiresAt', sql.DateTime, expiresAt)
        .query(`
          INSERT INTO verification_codes (id, email, code, purpose, expires_at) 
          VALUES (@id, @email, @code, @purpose, @expiresAt)
        `);
      
      return { success: true, id, code };
    } catch (error) {
      console.error('Error saving OTP:', error);
      throw error;
    }
  },

  // Gửi email chứa OTP bằng Brevo API
  sendOTPEmail: async (email, code) => {
    try {
      // Thiết lập Brevo API Client
      const defaultClient = SibApiV3Sdk.ApiClient.instance;
      const apiKey = defaultClient.authentications['api-key'];
      apiKey.apiKey = process.env.BREVO_API_KEY;
      
      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      
      // Cấu hình email
      sendSmtpEmail.subject = "Mã xác thực đặt lịch spa thú cưng";
      sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Xác thực địa chỉ email</h2>
          <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
          <p>Vui lòng sử dụng mã xác thực 6 chữ số sau để hoàn tất quá trình đặt lịch:</p>
          <div style="font-size: 24px; font-weight: bold; padding: 15px; background-color: #f5f5f5; text-align: center; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>Mã xác thực có hiệu lực trong 15 phút.</p>
        </div>
      `;
      
      sendSmtpEmail.sender = {
        name: process.env.DEFAULT_SENDER_NAME || "Pet Accessories Store",
        email: process.env.DEFAULT_SENDER_EMAIL || "chuthibinh201@gmail.com"
      };
      
      sendSmtpEmail.to = [{
        email: email
      }];
      
      // Gửi email
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      return { success: true };
      
    } catch (error) {
      console.error('Error sending OTP email with Brevo:', error);
      throw error;
    }
  },

  // Xác thực mã OTP
  verifyOTP: async (email, code, purpose = 'spa_booking') => {
    try {
      const pool = await connectDB();
      
      // Debug: log thông tin để kiểm tra
      console.log(`Đang kiểm tra: Email=${email}, Code=${code}, Purpose=${purpose}`);
      
      // Lấy record trước để kiểm tra
      const checkResult = await pool.request()
        .input('email', sql.VarChar(100), email)
        .query(`
          SELECT * FROM verification_codes 
          WHERE email = @email AND purpose = '${purpose}'
          ORDER BY created_at DESC
        `);
        
      console.log('Kết quả tìm kiếm:', checkResult.recordset.length > 0 ? 
        JSON.stringify(checkResult.recordset[0]) : 'Không tìm thấy');
      
      // Sửa câu query, bỏ điều kiện is_used và expires_at tạm thời để debug
      const result = await pool.request()
        .input('email', sql.VarChar(100), email)
        .input('code', sql.VarChar(10), code.trim()) // Thêm trim() để loại bỏ khoảng trắng
        .input('purpose', sql.VarChar(20), purpose)
        .query(`
          SELECT * FROM verification_codes 
          WHERE email = @email 
            AND code = @code 
            AND purpose = @purpose
            AND is_used = 0 
        `);
      
      // Kiểm tra thời gian hết hạn riêng
      if (result.recordset.length > 0) {
        const record = result.recordset[0];
        const now = new Date();
        const expiresAt = new Date(record.expires_at);
        
        console.log(`Thời gian hiện tại: ${now.toISOString()}, Hết hạn: ${expiresAt.toISOString()}`);
        
        if (now > expiresAt) {
          return { success: false, message: 'Mã xác thực đã hết hạn' };
        }
        
        // Đánh dấu mã OTP đã được sử dụng
        await pool.request()
          .input('id', sql.VarChar(50), record.id)
          .query(`UPDATE verification_codes SET is_used = 1 WHERE id = @id`);
        
        return { success: true };
      }
      
      return { success: false, message: 'Mã xác thực không hợp lệ hoặc đã hết hạn' };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }
};

module.exports = otpService;