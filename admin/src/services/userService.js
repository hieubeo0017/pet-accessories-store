import axiosInstance from "@/services/axios";

const createUser = async (userData) => {
    const response = await axiosInstance.post(`/users`, userData);
    return response.data;
};

const fetchUsers = async ({ page = 1, pageSize = 10, searchTerm = '' } = {}) => {
    try {
        const response = await axiosInstance.get(`/users`, {
            params: {
                page,
                limit: pageSize,
                search: searchTerm,
                sortBy: 'id',
                sortOrder: 'desc'
            }
        });

        return {
            data: response.data.data,
            total: response.data.pagination.totalItems,
            page: response.data.pagination.page,
            pageSize: response.data.pagination.limit,
            totalPages: response.data.pagination.totalPages
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
};
const fetchUserById = async (id) => {
    try {
        const response = await axiosInstance.get(`/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error(error.response?.data?.message || 'Không tìm thấy bài viết');
    }
};
const updateUser = async (id, userData) => {
    try {
        const response = await axiosInstance.put(`/users/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error(error.response?.data?.message || 'Failed to update user');
    }
};
const deleteUser = async (id) => {
    try {
        await axiosInstance.delete(`/users/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
}
const fetchReviews = async ({ page = 1, pageSize = 10, searchTerm = '' } = {}) => {
    try {
        const response = await axiosInstance.get(`/reviews`, {
            params: {
                page,
                limit: pageSize,
                search: searchTerm,
                sortBy: 'id',
                sortOrder: 'desc'
            }
        });
        return {
            data: response.data.data,
            total: response.data.pagination.totalItems,
            page: response.data.pagination.page,
            pageSize: response.data.pagination.limit,
            totalPages: response.data.pagination.totalPages
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
}
const deleteReview = async (id) => {
    try {
        await axiosInstance.delete(`/reviews/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
}

export default {
    fetchUsers,
    createUser,
    fetchUserById,
    updateUser,
    deleteUser,
    fetchReviews,
    deleteReview,
};
