import axios from 'axios';

// Tạo instance axios cho API
const api = axios.create({
  baseURL: '/api', // Sử dụng đường dẫn tương đối để tận dụng proxy
  headers: {
    'Content-Type': 'application/json'
  }
});

// Lấy danh sách sản phẩm
export const fetchProducts = async (params = {}) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Lấy chi tiết sản phẩm theo ID
export const fetchProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    
    // Đảm bảo trả về đúng cấu trúc dữ liệu
    let data = response.data;
    
    // Trích xuất dữ liệu từ cấu trúc response
    if (response.data && response.data.data) {
      data = response.data.data;
    }
    
    // Đảm bảo có thuộc tính price
    if (!data.price && data.price !== 0) {
      data.price = 0;
    }
    
    // Log để kiểm tra
    console.log("Product data from API:", data);
    
    return data;
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
};

// Lấy danh sách thú cưng
export const fetchPets = async (params = {}) => {
  try {
    const response = await api.get('/pets', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching pets:', error);
    throw error;
  }
};

// Lấy chi tiết thú cưng theo ID
export const fetchPetById = async (id) => {
  try {
    const response = await api.get(`/pets/${id}`);
    // Đảm bảo is_featured luôn là boolean
    return {
      ...response.data,
      is_featured: response.data.is_featured === true || response.data.is_featured === 1
    };
  } catch (error) {
    console.error('Error fetching pet by ID:', error);
    throw error;
  }
};

// Lấy danh sách danh mục
export const fetchCategories = async (params = {}) => {
  try {
    const response = await api.get('/categories', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Lấy danh sách sản phẩm theo danh mục
export const fetchProductsByCategory = async (categoryId, params = {}) => {
  try {
    const response = await api.get(`/products`, { 
      params: { 
        ...params,
        category_id: categoryId 
      } 
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching products by category ${categoryId}:`, error);
    throw error;
  }
};

// Tạo đơn hàng mới
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Lấy tất cả các thương hiệu
export const fetchAllBrands = async (params = {}) => {
  try {
    const response = await api.get('/brands', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
};

// Thêm mới các hàm API 
export const fetchFeaturedPets = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.type) queryParams.append('type', params.type);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const response = await api.get(`/pets/featured?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured pets:', error);
    throw error;
  }
};

export const fetchFeaturedProducts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.type) queryParams.append('type', params.type);
    if (params.category_id) queryParams.append('category_id', params.category_id);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const response = await api.get(`/products/featured?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

// Thêm hàm lấy thương hiệu nổi bật
export const fetchFeaturedBrands = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append('limit', params.limit);
    
    const response = await api.get(`/brands/featured?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured brands:', error);
    throw error;
  }
};

// Lấy danh sách dịch vụ spa nổi bật
export const fetchFeaturedSpaServices = async (params = {}) => {
  try {
    const limit = params.limit || 4;
    
    const response = await api.get(`/spa-services/featured?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured spa services:', error);
    throw error;
  }
};

// Lấy danh sách tất cả dịch vụ spa với tùy chọn lọc
export const fetchSpaServices = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.petType && params.petType !== 'all') queryParams.append('petType', params.petType);
    if (params.petSize && params.petSize !== 'all') queryParams.append('petSize', params.petSize);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const response = await api.get(`/spa-services?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching spa services:', error);
    throw error;
  }
};

// Lấy chi tiết một dịch vụ spa theo ID
export const fetchSpaServiceById = async (serviceId) => {
  try {
    const response = await api.get(`/spa-services/${serviceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching spa service with id ${serviceId}:`, error);
    throw error;
  }
};

// Tạo lịch hẹn spa mới
export const createSpaAppointment = async (appointmentData) => {
  try {
    const response = await api.post('/spa-appointments', appointmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating spa appointment:', error);
    throw error;
  }
};

// Lấy danh sách lịch hẹn spa của người dùng
export const getUserSpaAppointments = async () => {
  try {
    const response = await api.get('/spa-appointments');
    return response.data;
  } catch (error) {
    console.error('Error fetching user spa appointments:', error);
    throw error;
  }
};

// Hủy lịch hẹn spa
export const cancelSpaAppointment = async (appointmentId) => {
  try {
    const response = await api.put(`/spa-appointments/${appointmentId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling spa appointment:', error);
    throw error;
  }
};

// Đổi lịch hẹn spa
export const rescheduleSpaAppointment = async (appointmentId, rescheduleData) => {
  try {
    const response = await api.put(`/spa-appointments/${appointmentId}/reschedule`, rescheduleData);
    return response.data;
  } catch (error) {
    console.error('Error rescheduling spa appointment:', error);
    throw error;
  }
};

// Lấy chi tiết lịch hẹn spa
export const getAppointmentDetails = async (appointmentId) => {
  try {
    const response = await api.get(`/spa-appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching spa appointment with id ${appointmentId}:`, error);
    throw error;
  }
};

// Gửi đánh giá dịch vụ spa
export const submitSpaReview = async (appointmentId, reviewData) => {
  try {
    const response = await api.post(`/spa-reviews/${appointmentId}`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error submitting spa review:', error);
    throw error;
  }
};

export default api;