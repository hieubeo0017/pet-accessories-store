import axios from 'axios';

const API_URL = 'http://localhost:5000/api/spa-appointments';

// Lấy danh sách cuộc hẹn spa với phân trang và lọc
export const fetchSpaAppointments = async (params = {}) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      searchTerm = '',
      status = '',
      date_from = '',
      date_to = '',
      pet_type = '',
      sort_by = 'appointment_date',
      sort_order = 'desc'
    } = params;

    let url = `${API_URL}/admin?page=${page}&limit=${pageSize}`;
    
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
    if (status) url += `&status=${status}`;
    if (date_from) url += `&date_from=${date_from}`;
    if (date_to) url += `&date_to=${date_to}`;
    if (pet_type) url += `&pet_type=${pet_type}`;
    if (sort_by) url += `&sort_by=${sort_by}`;
    if (sort_order) url += `&sort_order=${sort_order}`;
    
    const response = await axios.get(url);
    
    return {
      data: response.data.data || [],
      total: response.data.pagination?.total || 0,
      page: response.data.pagination?.page || 1,
      limit: response.data.pagination?.limit || pageSize,
      totalPages: response.data.pagination?.totalPages || 1
    };
  } catch (error) {
    console.error('Error fetching spa appointments:', error);
    throw error;
  }
};

// Lấy chi tiết cuộc hẹn spa theo ID
export const fetchSpaAppointmentById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching spa appointment details:', error);
    throw error;
  }
};

// Cập nhật trạng thái cuộc hẹn spa
export const updateAppointmentStatus = async (id, status) => {
  try {
    const response = await axios.put(`${API_URL}/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

// Cập nhật trạng thái thanh toán
export const updatePaymentStatus = async (id, paymentStatus) => {
  try {
    const response = await axios.put(`${API_URL}/${id}/payment-status`, { payment_status: paymentStatus });
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

export const mockSpaAppointments = [
  {
    id: "AP001",
    full_name: "Nguyễn Văn An",
    phone_number: "0901234567",
    email: "nguyenvanan@gmail.com",
    appointment_date: "2025-04-20",
    appointment_time: "09:00:00",
    pet_name: "Lucky",
    pet_type: "dog",
    pet_breed: "Poodle",
    pet_size: "small",
    pet_notes: "Hay sợ nước, cần nhẹ nhàng",
    status: "confirmed",
    payment_status: "paid",
    total_amount: 350000,
    services: [
      { id: "SV001", name: "Tắm và vệ sinh cơ bản", price: 250000 },
      { id: "SV005", name: "Vệ sinh tai và mắt", price: 100000 }
    ],
    created_at: "2025-04-15T08:30:00.000Z"
  },
  {
    id: "AP002",
    full_name: "Trần Thị Bình",
    phone_number: "0912345678",
    email: "tranthib@example.com",
    appointment_date: "2025-04-20",
    appointment_time: "10:00:00",
    pet_name: "Mochi",
    pet_type: "cat",
    pet_breed: "British Shorthair",
    pet_size: "medium",
    pet_notes: "",
    status: "pending",
    payment_status: "pending",
    total_amount: 450000,
    services: [
      { id: "SV003", name: "Spa trọn gói cao cấp", price: 450000 }
    ],
    created_at: "2025-04-16T14:20:00.000Z"
  },
  {
    id: "AP003",
    full_name: "Lê Hoàng Phúc",
    phone_number: "0987654321",
    email: "hoangphuc@gmail.com",
    appointment_date: "2025-04-19",
    appointment_time: "15:00:00",
    pet_name: "Bông",
    pet_type: "dog",
    pet_breed: "Chihuahua",
    pet_size: "small",
    pet_notes: "Chỉ cắt tỉa lông phần chân và đuôi",
    status: "completed",
    payment_status: "paid",
    total_amount: 350000,
    services: [
      { id: "SV002", name: "Cắt tỉa lông chuyên nghiệp", price: 350000 }
    ],
    created_at: "2025-04-14T09:15:00.000Z"
  },
  {
    id: "AP004",
    full_name: "Phạm Minh Tuấn",
    phone_number: "0978123456",
    email: "minhtuanpham@yahoo.com",
    appointment_date: "2025-04-20",
    appointment_time: "16:00:00",
    pet_name: "Kitty",
    pet_type: "cat",
    pet_breed: "Ragdoll",
    pet_size: "large",
    pet_notes: "Mèo rất quý giá, cẩn thận khi tắm",
    status: "pending",
    payment_status: "pending",
    total_amount: 250000,
    services: [
      { id: "SV001", name: "Tắm và vệ sinh cơ bản", price: 250000 }
    ],
    created_at: "2025-04-17T10:45:00.000Z"
  },
  {
    id: "AP005",
    full_name: "Vũ Thị Hương",
    phone_number: "0923456789",
    email: "vuhuong83@gmail.com",
    appointment_date: "2025-04-18",
    appointment_time: "11:00:00",
    pet_name: "Mickey",
    pet_type: "dog",
    pet_breed: "Shiba Inu",
    pet_size: "medium",
    pet_notes: "",
    status: "cancelled",
    payment_status: "pending",
    total_amount: 650000,
    services: [
      { id: "SV004", name: "Nhuộm lông nghệ thuật", price: 650000 }
    ],
    created_at: "2025-04-14T16:30:00.000Z"
  }
];