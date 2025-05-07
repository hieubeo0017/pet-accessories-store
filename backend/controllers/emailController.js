const SibApiV3Sdk = require('sib-api-v3-sdk');
const axios = require('axios');

// Thêm hàm này ở đầu file hoặc gần phần xử lý email
const getPaymentMethodText = (method) => {
  switch(method) {
    case 'cash': return 'Tiền mặt (thanh toán tại cửa hàng)';
    case 'vnpay': 
    case 'e-wallet': return 'VNPAY';
    default: return 'Chưa xác định';
  }
};

// Ghi log phiên bản SDK
let sdkVersion;
try {
  const packageInfo = require('sib-api-v3-sdk/package.json');
  sdkVersion = packageInfo.version;
} catch (e) {
  sdkVersion = 'Không thể xác định';
}

console.log('Phiên bản SDK Brevo:', sdkVersion);

// Thiết lập API key một lần duy nhất khi khởi động ứng dụng
const setupBrevoApi = () => {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY;
  console.log('API key được thiết lập');
};

// Chạy thiết lập ngay khi file được import
setupBrevoApi();

const emailController = {
  sendEmail: async (req, res) => {
    try {
      const { to, subject, htmlContent, sender } = req.body;
      
      // Validate input
      if (!to || !subject || !htmlContent) {
        return res.status(400).json({
          message: 'Thiếu thông tin bắt buộc',
          required: ['to', 'subject', 'htmlContent']
        });
      }

      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      
      // Setup email data
      sendSmtpEmail.to = Array.isArray(to) 
        ? to.map(email => ({ email })) 
        : [{ email: to }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlContent;
      
      // Cấu hình sender
      sendSmtpEmail.sender = sender || {
        name: process.env.DEFAULT_SENDER_NAME || 'Pet Accessories Store',
        email: process.env.EMAIL_FROM || 'chuthibinh201@gmail.com'
      };
      
      // Send the email
      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      
      res.json({
        message: 'Email đã được gửi thành công',
        data
      });
    } catch (err) {
      console.error('Lỗi khi gửi email:', err);
      res.status(500).json({
        message: 'Đã xảy ra lỗi khi gửi email',
        error: err.message
      });
    }
  },
  
  createCampaign: async (req, res) => {
    try {
      const { name, subject, htmlContent, listIds, scheduledAt, sender } = req.body;
      
      // Validate
      if (!name || !subject || !htmlContent || !listIds || !listIds.length) {
        return res.status(400).json({
          message: 'Thiếu thông tin bắt buộc',
          required: ['name', 'subject', 'htmlContent', 'listIds']
        });
      }
      
      const apiInstance = new SibApiV3Sdk.EmailCampaignsApi();
      const emailCampaigns = new SibApiV3Sdk.CreateEmailCampaign();
      
      // Setup campaign data
      emailCampaigns.name = name;
      emailCampaigns.subject = subject;
      emailCampaigns.sender = sender || {
        name: process.env.DEFAULT_SENDER_NAME || 'Pet Accessories Store',
        email: process.env.EMAIL_FROM || 'chuthibinh201@gmail.com'
      };
      emailCampaigns.type = "classic";
      emailCampaigns.htmlContent = htmlContent;
      emailCampaigns.recipients = { listIds };
      
      if (scheduledAt) {
        emailCampaigns.scheduledAt = scheduledAt;
      }
      
      // Create the campaign
      const data = await apiInstance.createEmailCampaign(emailCampaigns);
      
      res.json({
        message: 'Chiến dịch email đã được tạo thành công',
        data
      });
    } catch (err) {
      console.error('Lỗi khi tạo chiến dịch email:', err);
      res.status(500).json({
        message: 'Đã xảy ra lỗi khi tạo chiến dịch email',
        error: err.message
      });
    }
  },
  
  testApiKey: async (req, res) => {
    try {
      // Tạo request trực tiếp đến Brevo để kiểm tra key
      const response = await axios.get('https://api.sendinblue.com/v3/account', {
        headers: {
          'api-key': process.env.BREVO_API_KEY
        }
      });
      
      res.json({
        valid: true,
        message: 'API key hợp lệ',
        account: response.data.email
      });
    } catch (err) {
      console.error('Lỗi khi kiểm tra API key:', err);
      res.status(400).json({
        valid: false,
        message: 'API key không hợp lệ',
        error: err.message
      });
    }
  },

  sendOtpEmail: async (to, code) => {
    try {
      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      
      // Setup email data
      sendSmtpEmail.to = [{ email: to }];
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
      
      // Cấu hình sender
      sendSmtpEmail.sender = {
        name: process.env.DEFAULT_SENDER_NAME || 'Pet Accessories Store',
        email: process.env.EMAIL_FROM || 'chuthibinh201@gmail.com'
      };
      
      // Send the email
      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      return { success: true, data };
    } catch (err) {
      console.error('Lỗi khi gửi email OTP:', err);
      throw err;
    }
  },

  // Cập nhật hàm sendBookingConfirmationEmail
  sendBookingConfirmationEmail: async (to, subject, htmlContent, appointment) => {
    try {
      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      
      // Setup email data
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.subject = subject;
      
      // Xử lý payment_method trước khi hiển thị - chuyển e-wallet thành vnpay
      // giống như trong spaAppointmentController
      let displayAppointment = { ...appointment };
      if (displayAppointment && displayAppointment.payment_method === 'e-wallet') {
        displayAppointment.payment_method = 'vnpay';
      }
      
      // Lấy text hiển thị cho phương thức thanh toán
      const paymentMethodText = displayAppointment && displayAppointment.payment_method 
        ? getPaymentMethodText(displayAppointment.payment_method) 
        : 'Chưa xác định';
        
      sendSmtpEmail.htmlContent = `
        ${htmlContent}
      
      `;
      
      // Cấu hình sender
      sendSmtpEmail.sender = {
        name: process.env.DEFAULT_SENDER_NAME || 'Pet Accessories Store',
        email: process.env.EMAIL_FROM || 'chuthibinh201@gmail.com'
      };
      
      // Send the email
      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      return { success: true, data };
    } catch (err) {
      console.error('Lỗi khi gửi email xác nhận đặt lịch:', err);
      throw err;
    }
  },

  sendPasswordResetEmail: async (to, resetToken) => {
    try {
      console.log(`Attempting to send password reset email to ${to} with token ${resetToken}`);
      
      // Sửa dòng này để sử dụng BREVO_API_KEY thay vì SENDINBLUE_API_KEY
      if (!process.env.BREVO_API_KEY) {
        console.error("BREVO_API_KEY không được cấu hình");
        throw new Error("Email service không được cấu hình đúng");
      }
      
      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      
      // Lấy URL frontend từ biến môi trường hoặc dùng giá trị mặc định
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
      
      // Setup email data
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.subject = "Đặt lại mật khẩu - Pet Accessories Store";
      sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0; background-color: #4CAF50; color: white; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0;">Đặt lại mật khẩu</h1>
          </div>
          
          <div style="padding: 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">
            <p>Xin chào,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấp vào nút bên dưới để đặt mật khẩu mới:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                Đặt lại mật khẩu
              </a>
            </div>
            
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi nếu bạn có câu hỏi.</p>
            
            <p>Lưu ý: Liên kết này sẽ hết hạn sau 1 giờ.</p>
            
            <p style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px; color: #777; font-size: 13px;">
              Đây là email tự động, vui lòng không trả lời. <br>
              &copy; ${new Date().getFullYear()} Pet Accessories Store
            </p>
          </div>
        </div>
      `;
      
      // Cấu hình sender
      sendSmtpEmail.sender = {
        name: process.env.DEFAULT_SENDER_NAME || 'Pet Accessories Store',
        email: process.env.EMAIL_FROM || 'chuthibinh201@gmail.com'
      };
      
      // Send the email
      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      
      // Thêm log khi gửi thành công
      console.log(`Email đặt lại mật khẩu đã được gửi thành công đến ${to}`);
      return { success: true, data };
    } catch (err) {
      console.error('Lỗi chi tiết khi gửi email đặt lại mật khẩu:', err);
      throw err;
    }
  },

  sendNewPasswordEmail: async (to, newPassword) => {
    try {
      console.log(`Attempting to send new password email to ${to}`);
      
      if (!process.env.BREVO_API_KEY) {
        console.error("BREVO_API_KEY không được cấu hình");
        throw new Error("Email service không được cấu hình đúng");
      }
      
      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      
      // Setup email data
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.subject = "Mật khẩu mới - Pet Accessories Store";
      sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0; background-color: #4CAF50; color: white; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0;">Mật khẩu mới của bạn</h1>
          </div>
          
          <div style="padding: 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 5px 5px;">
            <p>Xin chào,</p>
            <p>Dưới đây là mật khẩu mới cho tài khoản của bạn:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 22px; letter-spacing: 2px; font-weight: bold;">
                ${newPassword}
              </div>
            </div>
            
            <p>Vui lòng đăng nhập bằng mật khẩu mới này và thay đổi thành mật khẩu khác mà bạn có thể nhớ dễ dàng.</p>
            
            <p>Nếu bạn không yêu cầu mật khẩu mới, vui lòng liên hệ với chúng tôi ngay lập tức.</p>
            
            <p style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px; color: #777; font-size: 13px;">
              Đây là email tự động, vui lòng không trả lời. <br>
              &copy; ${new Date().getFullYear()} Pet Accessories Store
            </p>
          </div>
        </div>
      `;
      
      // Cấu hình sender
      sendSmtpEmail.sender = {
        name: process.env.DEFAULT_SENDER_NAME || 'Pet Accessories Store',
        email: process.env.EMAIL_FROM || 'chuthibinh201@gmail.com'
      };
      
      // Send the email
      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      
      // Thêm log khi gửi thành công
      console.log(`Email với mật khẩu mới đã được gửi thành công đến ${to}`);
      return { success: true, data };
    } catch (err) {
      console.error('Lỗi chi tiết khi gửi email mật khẩu mới:', err);
      throw err;
    }
  }
};

module.exports = emailController;