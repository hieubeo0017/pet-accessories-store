const SibApiV3Sdk = require('sib-api-v3-sdk');
const axios = require('axios');

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
  }
};

module.exports = emailController;