import api from './api'; // Sử dụng axios instance đã configured

const createUser = async (userData) => {
    try {
        // Đảm bảo dữ liệu được chuẩn hóa trước khi gửi
        const normalizedData = Object.entries(userData).reduce((acc, [key, value]) => {
            acc[key] = typeof value === 'string' ? value.normalize('NFC') : value;
            return acc;
        }, {});
        
        const response = await api.post('/users', normalizedData, {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        
        // Hiển thị thông báo lỗi cụ thể từ server
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Không thể tạo người dùng');
    }
};

const fetchUsers = async ({ page = 1, pageSize = 10, searchTerm = '' } = {}) => {
    try {
        const response = await api.get('/users', {
            params: {
                page,
                limit: pageSize,
                search: searchTerm,
                sortBy: 'id',
                sortOrder: 'desc'
            }
        });

        // Chuẩn hóa dữ liệu trước khi trả về
        const normalizedUsers = response.data.data.map(user => {
            return Object.entries(user).reduce((acc, [key, value]) => {
                acc[key] = typeof value === 'string' ? value.normalize('NFC') : value;
                return acc;
            }, {});
        });

        return {
            data: normalizedUsers,
            total: response.data.pagination.totalItems,
            page: response.data.pagination.page,
            pageSize: response.data.pagination.limit,
            totalPages: response.data.pagination.totalPages
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error(error.response?.data?.message || 'Không thể tải danh sách người dùng');
    }
};

const fetchUserById = async (id) => {
    try {
        const response = await api.get(`/users/${id}`);
        
        // Chuẩn hóa dữ liệu
        const userData = response.data.data;
        const normalizedUser = Object.entries(userData).reduce((acc, [key, value]) => {
            acc[key] = typeof value === 'string' ? value.normalize('NFC') : value;
            return acc;
        }, {});
        
        return normalizedUser;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error(error.response?.data?.message || 'Không tìm thấy người dùng');
    }
};

const updateUser = async (id, userData) => {
    try {
        const response = await api.put(`/users/${id}`, userData);
        return response.data.data;
    } catch (error) {
        console.error('Error updating user:', error);
        const errorMessage = error.response?.data?.message || 'Không thể cập nhật người dùng';
        throw new Error(errorMessage);
    }
};

const deleteUser = async (id) => {
    try {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw new Error(error.response?.data?.message || 'Không thể xóa người dùng');
    }
};

const fetchReviews = async ({ page = 1, pageSize = 10, searchTerm = '' } = {}) => {
    try {
        const response = await api.get('/reviews', { // Không còn là /users/api/reviews
            params: {
                page,
                limit: pageSize,
                search: searchTerm,
                sortBy: 'created_at',
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
        console.error('Error fetching reviews:', error);
        throw new Error(error.response?.data?.message || 'Không thể tải danh sách đánh giá');
    }
};

const deleteReview = async (id) => {
    try {
        const response = await api.delete(`/reviews/${id}`); // Không còn là /users/api/reviews/id
        return response.data;
    } catch (error) {
        console.error('Error deleting review:', error);
        throw new Error(error.response?.data?.message || 'Không thể xóa đánh giá');
    }
};

// Cập nhật trạng thái duyệt của đánh giá
const toggleReviewApproval = async (id, isApproved) => {
    try {
        const response = await api.patch(`/reviews/${id}/approval`, { is_approved: isApproved });
        return response.data;
    } catch (error) {
        console.error('Error toggling review approval:', error);
        throw new Error(error.response?.data?.message || 'Không thể cập nhật trạng thái đánh giá');
    }
};

export default {
    fetchUsers,
    createUser,
    fetchUserById,
    updateUser,
    deleteUser,
    fetchReviews,
    deleteReview,
    toggleReviewApproval, // Thêm hàm này
};
