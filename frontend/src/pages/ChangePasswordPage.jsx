import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../services/api';
import './ChangePasswordPage.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Navigate } from 'react-router-dom';

const ChangePasswordPage = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    
    // Lấy thông tin người dùng từ Redux store
    const user = useSelector(state => state.user);
    
    // Kiểm tra nếu chưa đăng nhập thì chuyển về trang login
    if (!user) {
        return <Navigate to="/login" />;
    }
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Toggle hiện/ẩn mật khẩu
    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };
    
    const validateForm = () => {
        // Kiểm tra các trường dữ liệu
        if (formData.newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return false;
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không trùng khớp');
            return false;
        }
        
        return true;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            return;
        }
        
        // Đảm bảo có thông tin user
        if (!user || !user.id) {
            setError('Không thể xác định người dùng. Vui lòng đăng nhập lại.');
            return;
        }
        
        setLoading(true);
        
        try {
            // Đảm bảo token được thêm vào header
            // api.js nên có interceptor để tự động thêm token
            const response = await api.put(`/users/${user.id}/change-password`, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            
            if (response.data.success) {
                toast.success('Mật khẩu đã được thay đổi thành công!');
                // Reset form
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                setError(response.data.message || 'Đã xảy ra lỗi khi thay đổi mật khẩu');
            }
        } catch (err) {
            console.error('Lỗi khi đổi mật khẩu:', err);
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
                    // Có thể logout user và chuyển về trang login
                } else if (err.response.status === 400) {
                    setError(err.response.data.message || 'Mật khẩu hiện tại không chính xác');
                } else {
                    setError(err.response.data.message || 'Đã xảy ra lỗi khi thay đổi mật khẩu');
                }
            } else {
                setError('Không thể kết nối đến máy chủ');
            }
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="change-password-container">
            <div className="change-password-box">
                <h2>Đổi mật khẩu</h2>
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword.current ? "text" : "password"}
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                required
                                placeholder="Nhập mật khẩu hiện tại"
                            />
                            <button 
                                type="button"
                                className="toggle-password-btn"
                                onClick={() => togglePasswordVisibility('current')}
                            >
                                {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="newPassword">Mật khẩu mới</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword.new ? "text" : "password"}
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                                minLength="6"
                            />
                            <button 
                                type="button"
                                className="toggle-password-btn"
                                onClick={() => togglePasswordVisibility('new')}
                            >
                                {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword.confirm ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="Nhập lại mật khẩu mới"
                            />
                            <button 
                                type="button"
                                className="toggle-password-btn"
                                onClick={() => togglePasswordVisibility('confirm')}
                            >
                                {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="change-password-button" 
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordPage;