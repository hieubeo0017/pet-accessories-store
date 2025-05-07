import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { toast } from 'react-toastify';
import { setUser } from '../store/userSlice';
import authService from '../services/auth';
import './LoginPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login(formData);
            
            // Lưu thông tin người dùng vào localStorage và Redux store
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
                dispatch(setUser(response.user));
                
                // Thông báo đăng nhập thành công
                toast.success('Đăng nhập thành công!');
                
                // Chuyển hướng đến trang chính
                navigate('/');
            } else {
                setError('Đăng nhập thành công nhưng không nhận được thông tin người dùng');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Email hoặc mật khẩu không chính xác');
            toast.error('Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Đăng nhập</h2>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Nhập email của bạn"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Nhập mật khẩu"
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className="additional-options">
                    <Link to="/forgot-password" className="forgot-password">
                        Quên mật khẩu?
                    </Link>
                    <p className="register-link">
                        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;