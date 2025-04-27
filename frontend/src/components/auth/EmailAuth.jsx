import React, { useState } from 'react';
import axios from 'axios';
import './EmailAuth.css';

const EmailAuth = ({ email, onVerified, onCancel }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Gọi API gửi mã xác thực
      const response = await axios.post('http://localhost:5000/api/verification/send-code', {
        email: email
      });
      
      // Sửa điều kiện kiểm tra: Không kiểm tra success mà kiểm tra dựa vào message hoặc status
      // API đã trả về status 200 và message thành công
      setCodeSent(true); // Luôn đặt thành true khi không có lỗi
      startCountdown(60);
      setError('');
      console.log("Mã đã được gửi, codeSent =", true);
    } catch (error) {
      console.error('Error sending verification code:', error);
      setError(error.response?.data?.message || 'Đã xảy ra lỗi khi gửi mã xác thực');
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = (seconds) => {
    setCountdown(seconds);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError('Vui lòng nhập mã xác thực');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Gọi API xác thực mã
      const response = await axios.post('http://localhost:5000/api/verification/verify-code', {
        email: email,
        code: verificationCode
      });
      
      // API trả về verified: true khi thành công
      if (response.data.verified || response.status === 200) {
        // Thông báo thành công
        setError('');
        
        // Trì hoãn đóng modal để người dùng thấy thông báo thành công
        setTimeout(() => {
          // Truyền thông tin email qua callback
          onVerified({ email: email });
        }, 1000);
      } else {
        setError(response.data.message || 'Mã xác thực không hợp lệ');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setError(error.response?.data?.message || 'Mã xác thực không đúng hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-auth-container">
      <h2>Xác thực email</h2>
      <p className="email-info">Chúng tôi sẽ gửi mã xác thực đến email: <strong>{email}</strong></p>
      
      {!codeSent ? (
        // Hiển thị nút gửi mã nếu chưa gửi
        <div className="auth-action">
          <button 
            className="btn-send-code" 
            onClick={handleSendCode}
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
          </button>
        </div>
      ) : (
        // Hiển thị form nhập mã nếu đã gửi
        <div className="verification-form">
          <p>Mã xác thực đã được gửi đến email của bạn.</p>
          <div className="code-input-container">
            <input
              type="text"
              placeholder="Nhập mã xác thực"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength="6"
              className="verification-input"
            />
            {countdown > 0 ? (
              <div className="countdown">Gửi lại sau {countdown}s</div>
            ) : (
              <button 
                className="btn-resend" 
                onClick={handleSendCode}
                disabled={loading}
              >
                Gửi lại mã
              </button>
            )}
          </div>
          <button 
            className="btn-verify-code" 
            onClick={handleVerifyCode}
            disabled={loading || !verificationCode}
          >
            {loading ? 'Đang xác thực...' : 'Xác nhận'}
          </button>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="auth-footer">
        <button 
          type="button" 
          onClick={onCancel} 
          className="cancel-button"
          style={{
            padding: '12px 25px',
            backgroundColor: '#f5f5f5', // Màu xám nhạt thay vì màu đỏ
            color: '#616161',           // Màu chữ xám đậm thay vì đỏ
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginRight: '10px',
            width: '100%'              // Chiếm hết chiều rộng của container
          }}
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default EmailAuth;