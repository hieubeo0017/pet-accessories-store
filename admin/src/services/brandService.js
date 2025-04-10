// Dữ liệu mẫu
const brandsData = [
  {
    id: 1,
    name: 'Royal Canin',
    logo: 'https://cdn.royalcanin-weshare-online.io/UCImG2oBaxEApS7LuQnZ/v2/rc-logo-global-600-600-golden-ratio',
    description: 'Royal Canin là thương hiệu thức ăn cho thú cưng từ Pháp, nổi tiếng với công thức dinh dưỡng được nghiên cứu kỹ lưỡng.',
    website: 'https://www.royalcanin.com',
    is_active: true
  },
  {
    id: 2,
    name: 'Whiskas',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Whiskas_logo.svg/1200px-Whiskas_logo.svg.png',
    description: 'Whiskas là thương hiệu thức ăn cho mèo nổi tiếng toàn cầu với nhiều loại thức ăn đa dạng.',
    website: 'https://www.whiskas.com',
    is_active: true
  },
  {
    id: 3,
    name: 'Pedigree',
    logo: 'https://logos-world.net/wp-content/uploads/2021/08/Pedigree-Logo.png',
    description: 'Pedigree là thương hiệu thức ăn cho chó hàng đầu, cung cấp đa dạng các sản phẩm dinh dưỡng.',
    website: 'https://www.pedigree.com',
    is_active: true
  }
];

export const fetchBrands = async ({ page = 1, pageSize = 10, searchTerm = '' } = {}) => {
  try {
    // Lọc dữ liệu dựa trên searchTerm
    let filteredBrands = [...brandsData];
    
    if (searchTerm) {
      filteredBrands = filteredBrands.filter(brand => 
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Tính toán phân trang
    const total = filteredBrands.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedBrands = filteredBrands.slice(startIndex, startIndex + pageSize);
    
    return {
      data: paginatedBrands,
      total: total,
      page: page,
      pageSize: pageSize
    };
  } catch (error) {
    throw new Error('Failed to fetch brands');
  }
};

// Lấy thương hiệu theo ID
export const fetchBrandById = async (id) => {
  // Giả lập call API
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const brand = brandsData.find(brand => brand.id === Number(id));
      if (brand) {
        resolve({...brand});
      } else {
        reject(new Error('Không tìm thấy thương hiệu'));
      }
    }, 500);
  });
};

// Tạo thương hiệu mới
export const createBrand = async (brandData) => {
  // Giả lập call API
  return new Promise((resolve) => {
    setTimeout(() => {
      const newBrand = {
        id: brandsData.length + 1,
        ...brandData,
        created_at: new Date().toISOString()
      };
      brandsData.push(newBrand);
      resolve(newBrand);
    }, 500);
  });
};

// Cập nhật thương hiệu
export const updateBrand = async (id, brandData) => {
  // Giả lập call API
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = brandsData.findIndex(brand => brand.id === Number(id));
      if (index !== -1) {
        brandsData[index] = { ...brandsData[index], ...brandData };
        resolve(brandsData[index]);
      } else {
        reject(new Error('Không tìm thấy thương hiệu'));
      }
    }, 500);
  });
};

// Xóa thương hiệu
export const deleteBrand = async (id) => {
  // Giả lập call API
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = brandsData.findIndex(brand => brand.id === Number(id));
      if (index !== -1) {
        brandsData.splice(index, 1);
        resolve({ success: true });
      } else {
        reject(new Error('Không tìm thấy thương hiệu'));
      }
    }, 500);
  });
};