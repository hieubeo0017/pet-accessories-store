import api from './api';

const API_URL = '/spa-time-slots';

// Lấy danh sách khung giờ với phân trang và lọc
export const fetchTimeSlotsWithPagination = async (params = {}) => {
  try {
    const response = await api.get(API_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching time slots:', error);
    throw error;
  }
};

// Lấy chi tiết khung giờ theo ID
export const fetchTimeSlotById = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching time slot details:', error);
    throw error;
  }
};

// Tạo khung giờ mới
export const createTimeSlot = async (timeSlotData) => {
  try {
    const response = await api.post(API_URL, timeSlotData);
    return response.data;
  } catch (error) {
    console.error('Error creating time slot:', error);
    throw error;
  }
};

// Cập nhật khung giờ
export const updateTimeSlot = async (id, timeSlotData) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, timeSlotData);
    return response.data;
  } catch (error) {
    console.error('Error updating time slot:', error);
    throw error;
  }
};

// Xóa khung giờ
export const deleteTimeSlot = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting time slot:', error);
    throw error;
  }
};

// Kiểm tra tình trạng khả dụng theo ngày
export const checkTimeSlotAvailability = async (date) => {
  try {
    const response = await api.get(`${API_URL}/availability`, {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
};