import api from './api';

export const fetchCategories = async ({ page = 1, pageSize = 10, searchTerm = '', filter = null } = {}) => {
  try {
    // Xây dựng tham số truy vấn
    const params = {
      page,
      limit: pageSize,
      sort: 'id',
      order: 'desc'
    };
    
    // Thêm tham số tìm kiếm nếu có
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    // Thêm tham số lọc nếu có
    if (filter && filter !== 'all') {
      params.type = filter;
    }
    
    // Gọi API backend
    const response = await api.get('/categories', { params });
    
    // Trả về dữ liệu đã được định dạng theo cấu trúc mà component frontend mong đợi
    return {
      data: response.data.data,
      total: response.data.pagination.total,
      page: response.data.pagination.page,
      pageSize: response.data.pagination.limit
    };
  } catch (error) {
    console.error('Lỗi khi lấy danh sách danh mục:', error);
    throw new Error('Không thể lấy danh sách danh mục');
  }
};

// Lấy danh mục theo ID
export const fetchCategoryById = async (id) => {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết danh mục:', error);
    throw new Error('Không thể lấy chi tiết danh mục');
  }
};

// Tạo danh mục mới
export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo danh mục:', error);
    throw new Error(error.response?.data?.message || 'Không thể tạo danh mục');
  }
};

// Cập nhật danh mục
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật danh mục:', error);
    throw new Error(error.response?.data?.message || 'Không thể cập nhật danh mục');
  }
};

// Xóa danh mục
export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa danh mục:', error);
    throw new Error(error.response?.data?.message || 'Không thể xóa danh mục');
  }
};