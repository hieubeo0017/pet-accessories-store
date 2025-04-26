import api from './api';

// Chuẩn hóa API URL - Bỏ tiền tố /api
const API_URL = '/spa-appointments'; // Đã sửa - không cần /api/ ở đầu nữa

// Lấy danh sách lịch hẹn
export const fetchAppointments = async (params = {}) => {
  try {
    const response = await api.get(API_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

// Lấy chi tiết lịch hẹn theo ID
export const fetchAppointmentById = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    throw error;
  }
};

// Tạo lịch hẹn mới
export const createAppointment = async (appointmentData) => {
  try {
    const response = await api.post(API_URL, appointmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

// Cập nhật trạng thái lịch hẹn
export const updateAppointmentStatus = async (id, status) => {
  try {
    const response = await api.put(`${API_URL}/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

// Cập nhật trạng thái thanh toán
export const updatePaymentStatus = async (id, payment_status) => {
  try {
    const response = await api.put(`${API_URL}/${id}/payment-status`, { payment_status });
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

// Thêm hàm để kiểm tra slots khả dụng
export const fetchTimeSlotAvailability = async (date) => {
  try {
    console.log('Calling availability API with date:', date);
    // Thêm API_URL hoặc base URL đúng khi gọi API
    const response = await api.get(`${API_URL}/availability?date=${date}`);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching time slot availability:', error);
    // Trả về object rỗng để tránh crash ứng dụng
    return { success: true, data: {} };
  }
};

// Cập nhật thông tin lịch hẹn
export const updateAppointment = async (id, appointmentData, services = null) => {
  try {
    const requestData = {
      appointmentData,
      services
    };
    
    const response = await api.put(`${API_URL}/${id}`, requestData);
    return response.data;
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

// Đổi lịch hẹn (chỉ đổi ngày và giờ)
export const rescheduleAppointment = async (id, appointmentDate, appointmentTime) => {
  try {
    const response = await api.put(`${API_URL}/${id}/reschedule`, { 
      appointment_date: appointmentDate, 
      appointment_time: appointmentTime 
    });
    return response.data;
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    throw error;
  }
};

// Xóa lịch hẹn
export const deleteAppointment = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

// Thêm hàm khôi phục lịch hẹn

// Khôi phục lịch hẹn đã hủy
export const restoreAppointment = async (id) => {
  try {
    const response = await api.put(`${API_URL}/${id}/restore`);
    return response.data;
  } catch (error) {
    console.error('Error restoring appointment:', error);
    throw error;
  }
};

