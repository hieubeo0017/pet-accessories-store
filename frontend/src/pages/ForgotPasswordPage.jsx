import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPasswordPage.css';
import api from '../services/api';
import { toast } from 'react-toastify';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setEmail(e.target.value);
        setError('');
    };

    const validateEmail = () => {
        if (!email.trim()) {
            setError('Vui lòng nhập email');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Email không hợp lệ');
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateEmail()) {
            return;
        }
        
        setLoading(true);
        
        try {
            // Gọi API quên mật khẩu
            const response = await api.post('/auth/forgot-password', { email });
            
            // Hiển thị thông báo thành công
            setSubmitted(true);
            toast.success('Yêu cầu đặt lại mật khẩu đã được gửi!');
            
        } catch (err) {
            console.error('Lỗi khi gửi yêu cầu đặt lại mật khẩu:', err);
            setError(err.response?.data?.message || 'Không thể xử lý yêu cầu của bạn. Vui lòng thử lại sau.');
            toast.error('Không thể gửi yêu cầu đặt lại mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-box">
                <h2>Quên mật khẩu</h2>
                
                {!submitted ? (
                    <>
                        <p className="forgot-password-info">
                            Nhập địa chỉ email bạn đã đăng ký. Chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
                        </p>
                        
                        {error && <div className="error-message">{error}</div>}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={handleChange}
                                    placeholder="Nhập email của bạn"
                                    disabled={loading}
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="success-message">
                        <div className="success-icon">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <h3>Yêu cầu đã được gửi!</h3>
                        <p>
                            Nếu email <strong>{email}</strong> có trong hệ thống của chúng tôi, 
                            bạn sẽ nhận được mật khẩu mới trong vài phút tới.
                        </p>
                        <p>
                            Vui lòng kiểm tra cả hộp thư chính và thư rác.
                        </p>
                    </div>
                )}
                
                <div className="additional-links">
                    <Link to="/login">Quay lại đăng nhập</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;