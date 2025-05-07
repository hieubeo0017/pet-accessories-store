import api from './api';

// Lấy danh sách blog với phân trang và tìm kiếm
const fetchBlogs = async ({ page = 1, pageSize = 10, searchTerm = '' } = {}) => {
  try {
    const response = await api.get('/blogs', {
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
    console.error('Error fetching blogs:', error);
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách bài viết');
  }
};

// Tạo bài viết mới
const createBlog = async (blogData) => {
  try {
    const response = await api.post('/blogs', blogData);
    return response.data;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw new Error(error.response?.data?.message || 'Không thể tạo bài viết mới');
  }
};

// Lấy chi tiết bài viết theo ID
const fetchBlogById = async (id) => {
  try {
    const response = await api.get(`/blogs/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching blog details:', error);
    throw new Error(error.response?.data?.message || 'Không thể tải thông tin bài viết');
  }
};

// Cập nhật bài viết
const updateBlog = async (id, blogData) => {
  try {
    const response = await api.put(`/blogs/${id}`, blogData);
    return response.data;
  } catch (error) {
    console.error('Error updating blog:', error);
    throw new Error(error.response?.data?.message || 'Không thể cập nhật bài viết');
  }
};

// Xóa bài viết
const deleteBlog = async (id) => {
  try {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw new Error(error.response?.data?.message || 'Không thể xóa bài viết');
  }
};

// Lấy danh sách bài viết nổi bật
const fetchFeaturedBlogs = async (limit = 3) => {
  try {
    const response = await api.get(`/blogs/featured?limit=${limit}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    return [];
  }
};

// Cập nhật trạng thái nổi bật
const toggleFeatured = async (id, isFeatured) => {
  try {
    const response = await api.put(`/blogs/${id}/featured`, { is_featured: isFeatured });
    return response.data;
  } catch (error) {
    console.error('Error updating featured status:', error);
    throw new Error(error.response?.data?.message || 'Không thể cập nhật trạng thái nổi bật');
  }
};

export default {
  fetchBlogs,
  createBlog,
  fetchBlogById,
  updateBlog,
  deleteBlog,
  fetchFeaturedBlogs,
  toggleFeatured
};
