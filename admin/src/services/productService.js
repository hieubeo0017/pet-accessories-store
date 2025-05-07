import api from './api';

// Hàm lấy danh sách sản phẩm
export const fetchProducts = async (options = {}) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      searchTerm = '',
      category_id = '',
      brand_id = '',
      pet_type = '',
      is_active,
      is_featured, // Thêm tham số mới
      sort_by = 'id',
      sort_order = 'desc'
    } = options;
    
    let url = `/products?page=${page}&limit=${pageSize}`;
    
    // Thêm các tham số tìm kiếm và lọc
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
    if (category_id) url += `&category_id=${category_id}`;
    if (brand_id) url += `&brand_id=${brand_id}`;
    if (pet_type) url += `&pet_type=${pet_type}`;
    if (is_active !== undefined) url += `&is_active=${is_active}`;
    // Thay đổi phần kiểm tra is_featured
    if (is_featured === true) {
      url += `&is_featured=true`;
    } else if (is_featured === false) {
      url += `&is_featured=false`;
    }
    // Chỉ gửi tham số khi is_featured là true hoặc false, không gửi khi undefined hoặc null
    
    url += `&sort_by=${sort_by}&sort_order=${sort_order}`;
    
    const response = await api.get(url);
    
    return {
      data: response.data.data,
      total: response.data.pagination.total,
      page: response.data.pagination.page,
      totalPages: response.data.pagination.totalPages
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Hàm lấy chi tiết sản phẩm theo ID
export const fetchProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to fetch product details');
  }
};

// Hàm tạo sản phẩm mới
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Xử lý và hiển thị message lỗi cụ thể từ server
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    throw new Error('Failed to create product');
  }
};

// Hàm cập nhật sản phẩm
export const updateProduct = async (id, productData) => {
  try {
    // console.log('Sending product data to server:', JSON.stringify(productData));
    
    const response = await api.put(`/products/${id}`, productData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    
    // Log chi tiết lỗi từ server
    if (error.response) {
      console.error('Server response data:', error.response.data);
      console.error('Server response status:', error.response.status);
    }
    
    throw new Error(error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật sản phẩm');
  }
};

// Hàm xóa sản phẩm
export const deleteProduct = async (id) => {
  try {
    await api.delete(`/products/${id}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    
    // Xử lý thêm các lỗi đặc biệt như sản phẩm đang được sử dụng
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Không thể xóa sản phẩm');
    }
    
    throw new Error(error.response?.data?.message || 'Failed to delete product');
  }
};