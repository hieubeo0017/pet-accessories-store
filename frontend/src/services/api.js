import axios from 'axios';

// Định nghĩa API_URL ở mức file để tất cả các hàm có thể sử dụng
const API_URL = 'http://localhost:5000/api';

// Tạo instance axios cho API
const api = axios.create({
  baseURL: API_URL, // Sử dụng đường dẫn tuyệt đối
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor để tự động thêm token vào mỗi request
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Tạo instance axios cho API client
const clientApi = axios.create({
  baseURL: API_URL, 
  headers: {
    'Content-Type': 'application/json',
    'x-client-view': 'true'  // Mặc định áp dụng cho tất cả request
  }
});

// Cập nhật các interceptors cho instance mới này
clientApi.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Lấy danh sách sản phẩm
export const fetchProducts = async (params) => {
  try {
    console.log('Đang gửi request tới API products với params:', params);
    
    // Tạo đối tượng URLSearchParams để debug
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.category_id) queryParams.append('category_id', params.category_id);
    if (params.brand_id) queryParams.append('brand_id', params.brand_id);
    if (params.pet_type) queryParams.append('pet_type', params.pet_type);
    if (params.min_price) queryParams.append('min_price', params.min_price);
    if (params.max_price) queryParams.append('max_price', params.max_price);
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active);
    
    console.log('Query URL:', `/products?${queryParams.toString()}`);
    
    const response = await clientApi.get('/products', { params });
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Lấy chi tiết sản phẩm theo ID
export const fetchProductById = async (id) => {
  try {
    const response = await clientApi.get(`/products/${id}`);
    
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
    const response = await clientApi.get('/pets', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching pets:', error);
    throw error;
  }
};

// Lấy chi tiết thú cưng theo ID
export const fetchPetById = async (id) => {
  try {
    const response = await clientApi.get(`/pets/${id}`);
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
    const response = await clientApi.get('/categories', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Lấy danh sách sản phẩm theo danh mục
export const fetchProductsByCategory = async (categoryId, params = {}) => {
  try {
    const response = await clientApi.get(`/products`, { 
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
    const response = await clientApi.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Lấy tất cả các thương hiệu
export const fetchAllBrands = async (params = {}) => {
  try {
    const response = await clientApi.get('/brands', { params });
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
    
    const response = await clientApi.get(`/pets/featured?${queryParams.toString()}`);
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
    
    const response = await clientApi.get(`/products/featured?${queryParams.toString()}`);
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
    
    const response = await clientApi.get(`/brands/featured?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured brands:', error);
    throw error;
  }
};

// Lấy danh sách dịch vụ spa nổi bật
export const fetchFeaturedSpaServices = async (params = {}) => {
  try {
    const limit = params.limit || 6; // Đã thay đổi từ 4 thành 6
    
    const response = await clientApi.get(`/spa-services/featured?limit=${limit}`);
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
    
    // Chỉ gửi pet_type khi giá trị khác 'all'
    if (params.petType && params.petType !== 'all') {
      queryParams.append('pet_type', params.petType);
    }
    
    // Chỉ gửi pet_size khi giá trị khác 'all'
    if (params.petSize && params.petSize !== 'all') {
      queryParams.append('pet_size', params.petSize);
    }
    
    // Log URL để debug
    const url = `/spa-services?${queryParams.toString()}`;
    console.log('API request URL:', url);
    
    const response = await clientApi.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching spa services:', error);
    throw error;
  }
};

// Lấy chi tiết một dịch vụ spa theo ID
export const fetchSpaServiceById = async (id) => {
  try {
    // Đảm bảo gọi đúng endpoint
    const response = await clientApi.get(`/spa-services/${id}`);
    
    // Debug để kiểm tra response
    console.log(`Service data for ${id}:`, response.data);
    
    // Trả về response phù hợp với cấu trúc backend
    return response.data;
  } catch (error) {
    console.error(`Error fetching spa service with ID ${id}:`, error);
    throw error;
  }
};

// Tạo lịch hẹn spa mới
export const createSpaAppointment = async (bookingData) => {
  try {
    const response = await clientApi.post('/spa-appointments', bookingData);
    return response;
  } catch (error) {
    console.error('Error creating spa appointment:', error);
    throw error;
  }
};

// Lấy danh sách lịch hẹn spa của người dùng
export const getUserSpaAppointments = async () => {
  try {
    const response = await clientApi.get('/spa-appointments');
    return response.data;
  } catch (error) {
    console.error('Error fetching user spa appointments:', error);
    throw error;
  }
};

// Hủy lịch hẹn spa
export const cancelSpaAppointment = async (appointmentId) => {
  try {
    const response = await clientApi.put(`/spa-appointments/${appointmentId}/status`, {
      status: 'cancelled'
    });
    return response.data;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

// Đổi lịch hẹn spa
export const rescheduleSpaAppointment = async (appointmentId, { date, time }) => {
  try {
    // Format lại date nếu là ISO string hoặc Date object
    let formattedDate = date;
    
    // Nếu date chứa ký tự 'T' (là định dạng ISO)
    if (typeof date === 'string' && date.includes('T')) {
      formattedDate = date.split('T')[0];
    } 
    // Nếu date là Date object
    else if (date instanceof Date) {
      formattedDate = date.toISOString().split('T')[0];
    }
    
    const formattedTime = time.includes(':00') ? time : `${time}:00`;
    
    console.log('Gửi request đổi lịch với dữ liệu:', {
      appointment_date: formattedDate,
      appointment_time: formattedTime
    });
    
    const response = await clientApi.put(`/spa-appointments/${appointmentId}/reschedule`, {
      appointment_date: formattedDate,
      appointment_time: formattedTime
    });
    
    console.log('Kết quả response từ API đổi lịch:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    throw error;
  }
};

// Khôi phục lịch hẹn spa
export const restoreSpaAppointment = async (appointmentId) => {
  try {
    const response = await clientApi.put(`/spa-appointments/${appointmentId}/restore`);
    return response.data;
  } catch (error) {
    console.error('Error restoring appointment:', error);
    throw error;
  }
};

// Lấy chi tiết lịch hẹn spa
export const getAppointmentDetails = async (appointmentId) => {
  try {
    const response = await clientApi.get(`/spa-appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching spa appointment with id ${appointmentId}:`, error);
    throw error;
  }
};

// Gửi đánh giá dịch vụ spa
export const submitSpaReview = async (appointmentId, reviewData) => {
  try {
    const response = await clientApi.post(`/spa-reviews/${appointmentId}`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error submitting spa review:', error);
    throw error;
  }
};

// Thêm các hàm API cho xác thực email và đặt lịch spa
export const sendVerificationCode = async (email) => {
  try {
    const response = await clientApi.post('/verification/send-code', { email });
    return response.data;
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw error;
  }
};

export const verifyEmailCode = async (email, code) => {
  try {
    const response = await clientApi.post('/verification/verify-code', { 
      email, 
      code 
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
};

// Thêm API kiểm tra khả dụng khung giờ
export const fetchTimeSlotAvailability = async (date) => {
  try {
    const response = await clientApi.get(`/spa-appointments/availability?date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Error checking time slot availability:', error);
    throw error;
  }
};

// Thêm hàm mới để gọi API lấy danh sách giống
export const fetchBreeds = async (type = '') => {
  try {
    // Log để kiểm tra tham số type
    console.log('Fetching breeds for type:', type);
    
    // Sử dụng API_URL đã định nghĩa
    let url = `${API_URL}/pets/breeds`;
    if (type && type !== 'all') {
      url += `?type=${type}`;
    }
    
    const response = await clientApi.get(url);
    
    // Log kết quả trả về
    console.log('Breeds API response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching breeds:', error);
    // Trả về mảng rỗng khi có lỗi để tránh crash app
    return { data: [] };
  }
};

// Hàm tìm kiếm lịch hẹn
export const searchAppointments = async (searchData) => {
  try {
    const response = await clientApi.get('/spa-appointments/search', { params: searchData });
    
    // Thêm logic xử lý dữ liệu
    if (response.data.success && Array.isArray(response.data.data)) {
      const formattedData = response.data.data.map(appointment => {
        // Chỉ cho phép hủy khi trạng thái là pending (chờ xác nhận) và chưa thanh toán
        const canCancel = appointment.status === 'pending' && appointment.payment_status !== 'paid';
        
        // Cho phép đổi lịch khi trạng thái là pending HOẶC confirmed
        const canReschedule = ['pending', 'confirmed'].includes(appointment.status);
        
        // Cho phép đánh giá khi đã hoàn thành và đã thanh toán
        const canReview = appointment.status === 'completed' && appointment.payment_status === 'paid';
        
        // Thêm các trường này vào đối tượng trả về
        return {
          ...appointment,
          can_cancel: canCancel,
          can_reschedule: canReschedule,
          can_review: canReview
        };
      });
      
      // Trả về dữ liệu đã xử lý
      return {
        success: response.data.success,
        data: formattedData
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error searching appointments:', error);
    throw error;
  }
};

// Thêm export này vào file api.js
export const fetchSpaTimeSlotAvailability = async (date) => {
  try {
    console.log('Calling availability API with date:', date);
    const response = await clientApi.get(`/spa-time-slots/availability?date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Error checking time slot availability:', error);
    return { success: false, data: {} };
  }
};

// Tạo thanh toán mới cho lịch hẹn
export const createSpaPayment = async (appointmentId, paymentData) => {
  try {
    // Đảm bảo luôn có trường payment_method
    if (!paymentData.payment_method) {
      paymentData.payment_method = 'cash'; // Giá trị mặc định
    }
    
    const response = await clientApi.post(`/payments/appointments/${appointmentId}/payments`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Lấy lịch sử thanh toán cho lịch hẹn
export const getPaymentHistory = async (appointmentId) => {
  try {
    const response = await clientApi.get(`/payments/appointments/${appointmentId}/payments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

// Tạo URL thanh toán VNPay cho lịch hẹn
export const createVnPayUrl = async (appointmentId, amount, redirectUrl, bankCode = '') => {
  try {
    console.log('Tạo URL VNPay với thông tin:', {
      appointment_id: appointmentId,
      amount: amount,
      redirect_url: redirectUrl
    });
    
    // Đảm bảo URL chuyển hướng là về frontend
    const returnUrl = `${window.location.origin}/payment/callback`;
    
    const response = await clientApi.post(`/vnpay/create-payment-url`, {
      appointment_id: appointmentId,
      amount: amount,
      redirect_url: returnUrl,  // Về trang frontend
      bankCode: bankCode,
      useIpnUrl: true  // THÊM THAM SỐ NÀY để kích hoạt IPN URL trong backend
    });
    
    console.log("VNPay URL response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating VNPay URL:', error);
    throw error;
  }
};

// Xác nhận thanh toán VNPay
export const confirmVnpayPayment = async (queryParams) => {
  try {
    // Tạo URL với đầy đủ thông số từ VNPay
    const params = new URLSearchParams(queryParams);
    
    // Sử dụng API endpoint đúng - có thể dùng api instance đã được cấu hình
    const response = await clientApi.get(`/vnpay/callback?${params.toString()}`);
    
    console.log("VNPay confirmation response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error confirming VNPay payment:', error);
    throw error;
  }
};

// Đổi phương thức thanh toán cho lịch hẹn
export const changePaymentMethod = async (appointmentId, newPaymentMethod, transactionId = null) => {
  try {
    const response = await clientApi.put(`/payments/appointments/${appointmentId}/payment-method`, {
      new_payment_method: newPaymentMethod,
      transaction_id: transactionId
    });
    return response.data;
  } catch (error) {
    console.error('Error changing payment method:', error);
    throw error;
  }
};

// Thêm export này vào frontend/src/services/api.js
export const searchAll = async (query, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Nếu có query thì thêm vào params
    if (query) queryParams.append('query', query);
    
    // Thêm các tham số khác
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type) queryParams.append('type', params.type);
    if (params.featured) queryParams.append('featured', params.featured);
    
    const response = await clientApi.get(`/search?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
};

// Thêm các phương thức API cho quên mật khẩu

export const forgotPassword = async (email) => {
  try {
    const response = await clientApi.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

export const verifyResetToken = async (token) => {
  try {
    const response = await clientApi.get(`/auth/reset-password/${token}`);
    return response.data;
  } catch (error) {
    console.error('Error verifying reset token:', error);
    throw error;
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await clientApi.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Thêm API đổi mật khẩu
export const changePassword = async (userId, passwordData) => {
  try {
    const response = await clientApi.put(`/users/${userId}/change-password`, passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Sửa hàm fetchRelatedSpaServices
export const fetchRelatedSpaServices = async (serviceId, limit = 4) => {
  try {
    console.log(`Fetching related services for ${serviceId} with limit ${limit}`);
    const response = await clientApi.get(`/spa-services/related/${serviceId}`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching related spa services:', error);
    return { data: [] };
  }
};

// Thêm sessionId vào tham số
export const sendChatbotMessage = async (message, sessionId) => {
  try {
    const response = await clientApi.post('/chatbot/chat', { 
      message,
      sessionId 
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message to chatbot:', error);
    throw error;
  }
};

export default api;