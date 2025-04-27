import axios from 'axios';
import {env} from "@/config/environment";

const axiosInstance = axios.create({
    baseURL: env.API_BACKEND,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

const handleUnauthorized = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
};

axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');

                if (!refreshToken) {
                    handleUnauthorized();
                    return Promise.reject(error);
                }

                const response = await axios.post(env.API_BACKEND+'/refresh-token', {
                    refreshToken
                });

                const { accessToken: newAccessToken } = response.data;

                localStorage.setItem('accessToken', newAccessToken);

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                return axiosInstance(originalRequest);

            } catch (refreshError) {
                handleUnauthorized();
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 403) {
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;