import axios from 'axios';

const API_URL = 'http://localhost:5000/api/pets';

// Sửa lại function fetchPets để phù hợp với cách gọi từ PetsPage
export const fetchPets = async (params = {}) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      searchTerm = '',  // Thêm tham số này
      filter = null,    // Thêm tham số này
      limit = 12,
      search = '', 
      type = '', 
      breed = '', 
      gender = '',
      min_price = '', 
      max_price = '',
      is_active, // Chỉ thêm tham số is_active nếu nó được định nghĩa
      sort_by = 'id',
      sort_order = 'desc'
    } = params;

    let url = `${API_URL}?page=${page}&limit=${pageSize || limit}`;
    
    // Chỉ thêm is_active vào URL khi nó là true hoặc false, không thêm khi là null
    if (is_active === true) {
      url += `&is_active=true`;
    } else if (is_active === false) {
      url += `&is_active=false`;
    }
    // Khi is_active là null, không thêm vào URL để lấy tất cả records
    
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`; 
    else if (search) url += `&search=${encodeURIComponent(search)}`;
    
    if (filter && filter !== 'all') url += `&type=${filter}`;
    else if (type && type !== 'all') url += `&type=${type}`;
    
    if (breed && breed !== 'all') url += `&breed=${encodeURIComponent(breed)}`;
    if (gender && gender !== 'all') url += `&gender=${gender}`;
    if (min_price) url += `&min_price=${min_price}`;
    if (max_price) url += `&max_price=${max_price}`;
    if (sort_by) url += `&sort_by=${sort_by}`;
    if (sort_order) url += `&sort_order=${sort_order}`;
    
    const response = await axios.get(url);
    
    // Đảm bảo trả về đúng cấu trúc dữ liệu mà component cần
    return {
      data: response.data.data || [], 
      total: response.data.pagination?.total || 0,
      page: response.data.pagination?.page || 1,
      limit: response.data.pagination?.limit || pageSize,
      totalPages: response.data.pagination?.totalPages || 1
    };
  } catch (error) {
    console.error('Error fetching pets:', error);
    throw error;
  }
};

// Lấy thông tin chi tiết thú cưng theo ID
export const fetchPetById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pet details:', error);
    throw error;
  }
};

// Tạo thú cưng mới
export const createPet = async (petData) => {
  try {
    const response = await axios.post(API_URL, petData);
    return response.data;
  } catch (error) {
    console.error('Error creating pet:', error);
    throw error;
  }
};

// Cập nhật thú cưng
export const updatePet = async (id, petData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, petData);
    return response.data;
  } catch (error) {
    console.error('Error updating pet:', error);
    throw error;
  }
};

// Xóa thú cưng
export const deletePet = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting pet:', error);
    throw error;
  }
};

// Kiểm tra thú cưng có đang được sử dụng không
export const checkPetInUse = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}/in-use`);
    return response.data.inUse;
  } catch (error) {
    console.error('Error checking if pet is in use:', error);
    throw error;
  }
};