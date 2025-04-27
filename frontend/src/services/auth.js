import axiosInstance from "@/services/axios";

const register = async (userData) => {
    const response = await axiosInstance.post(`/auth/register`, userData);
    return response.data;
};

const login = async (userData) => {
    const response = await axiosInstance.post(`/auth/login`, userData);
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