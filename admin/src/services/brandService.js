import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Lấy danh sách thương hiệu với phân trang và lọc
export const fetchBrands = async ({ page = 1, pageSize = 10, searchTerm = '' } = {}) => {
  try {
    const response = await axios.get(`${API_URL}/brands`, {
      params: {
        page,
        limit: pageSize,
        search: searchTerm,
        sortBy: 'id',
        sortOrder: 'desc'  // Thay đổi từ 'asc' thành 'desc' để sắp xếp giảm dần
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

// Lấy thương hiệu theo ID
export const fetchBrandById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/brands/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching brand:', error);
    throw new Error(error.response?.data?.message || 'Không tìm thấy thương hiệu');
  }
};

// Tạo thương hiệu mới
export const createBrand = async (brandData) => {
  try {
    console.log('Dữ liệu gửi đi:', brandData); // Debug dữ liệu gửi đi
    const response = await axios.post(`${API_URL}/brands`, brandData);
    return response.data;
  } catch (error) {
    console.error('Chi tiết lỗi từ server:', error.response?.data);
    
    // Lấy lỗi chi tiết từ validation errors
    if (error.response?.data?.errors && error.response.data.errors.length > 0) {
      throw new Error(error.response.data.errors.map(e => e.msg).join(', '));
    }
    
    // Lấy message từ server
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    // Lấy error từ server
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    throw new Error('Không thể tạo thương hiệu mới');
  }
};

// Cập nhật thương hiệu
export const updateBrand = async (id, brandData) => {
  try {
    const response = await axios.put(`${API_URL}/brands/${id}`, brandData);
    return response.data;
  } catch (error) {
    console.error('Error updating brand:', error);
    throw new Error(error.response?.data?.message || 'Failed to update brand');
  }
};

// Xóa thương hiệu
export const deleteBrand = async (id) => {
  try {
    await axios.delete(`${API_URL}/brands/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting brand:', error);
    if (error.response?.status === 400) {
      // Thương hiệu đang được sử dụng bởi sản phẩm
      throw new Error(error.response?.data?.message || 'Không thể xóa thương hiệu đang được sử dụng');
    }
    throw new Error(error.response?.data?.message || 'Failed to delete brand');
  }
};