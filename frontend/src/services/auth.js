import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

const register = async (userData) => {
    const response = await axios.post(`${API_URL}register`, userData);
    return response.data;
};

const login = async (userData) => {
    const response = await axios.post(`${API_URL}login`, userData);
    return response.data;
};

const logout = () => {
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