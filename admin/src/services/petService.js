// Giả lập dữ liệu thú cưng
const petsData = [
  {
    id: 1,
    name: 'Lucky',
    type: 'dog',
    breed: 'Golden Retriever',
    age: '2 tuổi',
    gender: 'male',
    color: 'Vàng',
    weight: '25kg',
    price: 10000000,
    description: 'Chó Golden Retriever thuần chủng, thông minh và thân thiện với trẻ em.',
    vaccination: 'Đã tiêm đầy đủ các mũi cơ bản',
    health: 'Khỏe mạnh, đã được kiểm tra sức khỏe định kỳ',
    origin: 'Việt Nam',
    stock: 1,
    is_adopted: false,
    is_active: true,
    images: [
      { 
        url: 'https://www.thesprucepets.com/thmb/x4mIjo62wYFqKwAjWk-e5GW8HNA=/1500x0/filters:no_upscale():strip_icc()/GettyImages-1144644179-79fa70758c2d48fa8c4bcf7a4e1c79e9.jpg',
        is_primary: true 
      },
      { 
        url: 'https://img.freepik.com/free-photo/isolated-happy-smiling-dog-white-background-portrait-3_1562-691.jpg',
        is_primary: false 
      }
    ]
  },
  {
    id: 2,
    name: 'Mimi',
    type: 'cat',
    breed: 'Munchkin',
    age: '1 tuổi',
    gender: 'female',
    color: 'Trắng xám',
    weight: '3kg',
    price: 8000000,
    description: 'Mèo Munchkin chân ngắn đáng yêu, tính cách thân thiện.',
    vaccination: 'Đã tiêm 2/3 mũi cơ bản',
    health: 'Khỏe mạnh',
    origin: 'Thái Lan',
    stock: 1,
    is_adopted: false,
    is_active: true,
    images: [
      { 
        url: 'https://petkingdomvn.com/wp-content/uploads/2020/06/meo-munchkin.jpg',
        is_primary: true 
      }
    ]
  },
  {
    id: 3,
    name: 'Rex',
    type: 'dog',
    breed: 'Husky',
    age: '6 tháng',
    gender: 'male',
    color: 'Đen trắng',
    weight: '15kg',
    price: 12000000,
    description: 'Chó Husky thuần chủng, rất năng động và thân thiện.',
    vaccination: 'Đã tiêm đầy đủ các mũi cơ bản theo độ tuổi',
    health: 'Khỏe mạnh',
    origin: 'Việt Nam',
    stock: 1,
    is_adopted: false,
    is_active: true,
    images: [
      { 
        url: 'https://petuni.vn/resources/article/202012/meo-munchkin-chan-ngan-1608795769.jpg',
        is_primary: true 
      }
    ]
  }
];

// Cập nhật fetchPets để hỗ trợ phân trang
export const fetchPets = async ({ page = 1, pageSize = 10, searchTerm = '', filter = null } = {}) => {
  try {
    // Lọc dữ liệu dựa trên searchTerm và filter
    let filteredPets = [...petsData]; // Sử dụng dữ liệu mẫu đã khai báo
    
    if (searchTerm) {
      filteredPets = filteredPets.filter(pet => 
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filter && filter !== 'all') {
      filteredPets = filteredPets.filter(pet => pet.type === filter);
    }
    
    // Tính toán phân trang
    const total = filteredPets.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedPets = filteredPets.slice(startIndex, startIndex + pageSize);
    
    return {
      data: paginatedPets,
      total: total,
      page: page,
      pageSize: pageSize
    };
  } catch (error) {
    throw new Error('Failed to fetch pets');
  }
};

// Lấy thú cưng theo ID
export const fetchPetById = async (id) => {
  // Giả lập call API
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const pet = petsData.find(pet => pet.id === Number(id));
      if (pet) {
        resolve({...pet});
      } else {
        reject(new Error('Không tìm thấy thú cưng'));
      }
    }, 500);
  });
};

// Tạo thú cưng mới
export const createPet = async (petData) => {
  // Giả lập call API
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPet = {
        id: petsData.length + 1,
        ...petData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      petsData.push(newPet);
      resolve(newPet);
    }, 1000);
  });
};

// Cập nhật thú cưng
export const updatePet = async (id, petData) => {
  // Giả lập call API
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = petsData.findIndex(pet => pet.id === Number(id));
      if (index !== -1) {
        petsData[index] = { 
          ...petsData[index], 
          ...petData,
          updated_at: new Date().toISOString()
        };
        resolve(petsData[index]);
      } else {
        reject(new Error('Không tìm thấy thú cưng'));
      }
    }, 1000);
  });
};

// Xóa thú cưng
export const deletePet = async (id) => {
  // Giả lập call API
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = petsData.findIndex(pet => pet.id === Number(id));
      if (index !== -1) {
        petsData.splice(index, 1);
        resolve({ success: true });
      } else {
        reject(new Error('Không tìm thấy thú cưng'));
      }
    }, 500);
  });
};