import api from './api';

const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        console.error('Register error:', error);
        throw error.response?.data || { message: 'Đã xảy ra lỗi khi đăng ký' };
    }
};

const login = async (userData) => {
    try {
        const response = await api.post('/auth/login', userData);
        
        // Lưu token vào localStorage nếu API trả về
        if (response.data.token) {
            localStorage.setItem('accessToken', response.data.token);
        }
        
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error.response?.data || { message: 'Đăng nhập thất bại' };
    }
};

const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

export default {
    register,
    login,
    logout,
    getCurrentUser,
};