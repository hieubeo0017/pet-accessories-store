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
  }
};

module.exports = emailController;