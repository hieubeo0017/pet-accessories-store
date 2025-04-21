import React from 'react';

const EmailAuth = ({ email, onVerified, onCancel }) => {
  const handleVerify = () => {
    // Giả lập xác thực thành công
    alert('Email đã được xác thực thành công');
    onVerified({ email });
  };

  return (
    <div className="email-auth">
      <h3>Xác thực Email</h3>
      <p>Chúng tôi sẽ gửi mã xác thực đến email: {email}</p>
      
      <div className="auth-buttons">
        <button onClick={onCancel} className="btn-cancel">Hủy</button>
        <button onClick={handleVerify} className="btn-verify">Xác thực</button>
      </div>
    </div>
  );
};

export default EmailAuth;