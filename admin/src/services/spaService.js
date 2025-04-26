import api from './api';

// Chuẩn hóa API URL - Bỏ tiền tố /api
const API_URL = '/spa-services'; // Đã sửa - không cần /api/ ở đầu nữa

// Lấy danh sách dịch vụ spa với phân trang và lọc
export const fetchSpaServices = async (params = {}) => {
  try {
    // Đảm bảo các tham số đúng với API endpoint
    const apiParams = {
      page: params.page || 1,
      limit: params.pageSize || 10,
      search: params.searchTerm || '',
      pet_type: params.pet_type || '',
      is_active: params.is_active,
      is_featured: params.is_featured,
      sort_by: params.sort_by || 'id',
      sort_order: params.sort_order || 'DESC'
    };
    
    const response = await api.get(API_URL, { params: apiParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching spa services:', error);
    throw error;
  }
};

// Lấy chi tiết dịch vụ spa theo ID
export const fetchSpaServiceById = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching spa service with id ${id}:`, error);
    throw error;
  }
};

// Tạo dịch vụ spa mới
export const createSpaService = async (serviceData) => {
  try {
    const response = await api.post(API_URL, serviceData);
    return response.data;
  } catch (error) {
    console.error('Error creating spa service:', error);
    throw error;
  }
};

// Cập nhật dịch vụ spa
export const updateSpaService = async (id, serviceData) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, serviceData);
    return response.data;
  } catch (error) {
    console.error('Error updating spa service:', error);
    throw error;
  }
};

// Xóa dịch vụ spa
export const deleteSpaService = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting spa service:', error);
    throw error;
  }
};

export const mockSpaServices = [
  {
    id: 'SV001',
    name: 'Tắm và vệ sinh cơ bản',
    description: 'Dịch vụ tắm, vệ sinh tai, cắt móng và thơm tho cho thú cưng của bạn',
    price: 250000,
    duration: 60,
    pet_type: 'all',
    pet_size: 'all',
    is_active: true,
    is_featured: true,
    images: [
      { image_url: '/images/services/bath1.jpg', is_primary: true },
      { image_url: '/images/services/bath2.jpg', is_primary: false }
    ]
  },
  {
    id: 'SV002',
    name: 'Cắt tỉa lông chuyên nghiệp',
    description: 'Dịch vụ cắt tỉa lông theo yêu cầu, kiểu dáng với kỹ thuật viên chuyên nghiệp',
    price: 350000,
    duration: 90,
    pet_type: 'dog',
    pet_size: 'medium',
    is_active: true,
    is_featured: true,
    images: [
      { image_url: '/images/services/grooming1.jpg', is_primary: true },
      { image_url: '/images/services/grooming2.jpg', is_primary: false }
    ]
  },
  {
    id: 'SV003',
    name: 'Spa trọn gói cao cấp',
    description: 'Dịch vụ spa cao cấp bao gồm tắm, masage, dưỡng lông và nước hoa',
    price: 450000,
    duration: 120,
    pet_type: 'all',
    pet_size: 'all',
    is_active: true,
    is_featured: true,
    images: [
      { image_url: '/images/services/premium-spa.jpg', is_primary: true }
    ]
  },
  {
    id: 'SV004',
    name: 'Nhuộm lông nghệ thuật',
    description: 'Dịch vụ nhuộm lông an toàn với màu sắc thời trang',
    price: 650000,
    duration: 180,
    pet_type: 'dog',
    pet_size: 'small',
    is_active: true,
    is_featured: false,
    images: [
      { image_url: '/images/services/coloring.jpg', is_primary: true }
    ]
  },
  {
    id: 'SV005',
    name: 'Vệ sinh tai và mắt',
    description: 'Dịch vụ vệ sinh tai, mắt chuyên sâu, phòng ngừa bệnh',
    price: 150000,
    duration: 30,
    pet_type: 'all',
    pet_size: 'all',
    is_active: true,
    is_featured: false,
    images: [
      { image_url: '/images/services/ear-cleaning.jpg', is_primary: true }
    ]
  }
];