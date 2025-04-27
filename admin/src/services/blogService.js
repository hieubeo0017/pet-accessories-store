import axiosInstance from "@/services/axios";

const createBlog = async (blogData) => {
    const response = await axiosInstance.post(`/blogs`, blogData);
    return response.data;
};

const fetchBlogs = async ({ page = 1, pageSize = 10, searchTerm = '' } = {}) => {
    try {
        const response = await axiosInstance.get(`/blogs`, {
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
        console.error('Error fetching brands:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch brands');
    }
};
const fetchBlogById = async (id) => {
    try {
        const response = await axiosInstance.get(`/blogs/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching brand:', error);
        throw new Error(error.response?.data?.message || 'Không tìm thấy bài viết');
    }
};
const updateBlog = async (id, blogData) => {
    try {
        const response = await axiosInstance.put(`/blogs/${id}`, blogData);
        return response.data;
    } catch (error) {
        console.error('Error updating brand:', error);
        throw new Error(error.response?.data?.message || 'Failed to update brand');
    }
};
const deleteBlog = async (id) => {
    try {
        await axiosInstance.delete(`/blogs/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting brand:', error);
        throw new Error(error.response?.data?.message || 'Failed to delete brand');
    }
}

export default {
    fetchBlogs,
    createBlog,
    fetchBlogById,
    updateBlog,
    deleteBlog,
};
