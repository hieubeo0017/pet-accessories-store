// Dữ liệu mẫu
const categoriesData = [
  {
    id: 1,
    name: 'Thức ăn cho chó',
    description: 'Các sản phẩm thức ăn dành riêng cho chó',
    slug: 'thuc-an-cho-cho',
    type: 'food',
    image_url: 'https://example.com/dog-food.jpg',
    is_active: true
  },
  {
    id: 2,
    name: 'Thức ăn cho mèo',
    description: 'Các sản phẩm thức ăn dành riêng cho mèo',
    slug: 'thuc-an-cho-meo',
    type: 'food',
    image_url: 'https://example.com/cat-food.jpg',
    is_active: true
  },
  {
    id: 3,
    name: 'Vòng cổ & Dây dắt',
    description: 'Phụ kiện vòng cổ và dây dắt cho thú cưng',
    slug: 'vong-co-day-dat',
    type: 'accessory',
    image_url: 'https://example.com/collar.jpg',
    is_active: true
  },
  {
    id: 4,
    name: 'Chó cảnh',
    description: 'Các giống chó cảnh được nuôi phổ biến',
    slug: 'cho-canh',
    type: 'pet',
    image_url: 'https://example.com/dogs.jpg',
    is_active: true
  },
  {
    id: 5,
    name: 'Mèo cảnh',
    description: 'Các giống mèo cảnh được nuôi phổ biến',
    slug: 'meo-canh',
    type: 'pet',
    image_url: 'https://example.com/cats.jpg',
    is_active: true
  }
];

export const fetchCategories = async ({ page = 1, pageSize = 10, searchTerm = '', filter = null } = {}) => {
  try {
    // Lọc dữ liệu dựa trên searchTerm và filter
    let filteredCategories = [...categoriesData];
    
    if (searchTerm) {
      filteredCategories = filteredCategories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filter && filter !== 'all') {
      filteredCategories = filteredCategories.filter(category => category.type === filter);
    }
    
    // Tính toán phân trang
    const total = filteredCategories.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedCategories = filteredCategories.slice(startIndex, startIndex + pageSize);
    
    return {
      data: paginatedCategories,
      total: total,
      page: page,
      pageSize: pageSize
    };
  } catch (error) {
    throw new Error('Failed to fetch categories');
  }
};

// Lấy danh mục theo ID
export const fetchCategoryById = async (id) => {
  // Giả lập call API
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const category = categoriesData.find(category => category.id === Number(id));
      if (category) {
        resolve({...category});
      } else {
        reject(new Error('Không tìm thấy danh mục'));
      }
    }, 500);
  });
};

// Tạo danh mục mới
export const createCategory = async (categoryData) => {
  // Giả lập call API
  return new Promise((resolve) => {
    setTimeout(() => {
      const newCategory = {
        id: categoriesData.length + 1,
        ...categoryData,
        created_at: new Date().toISOString()
      };
      categoriesData.push(newCategory);
      resolve(newCategory);
    }, 500);
  });
};

// Cập nhật danh mục
export const updateCategory = async (id, categoryData) => {
  // Giả lập call API
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = categoriesData.findIndex(category => category.id === Number(id));
      if (index !== -1) {
        categoriesData[index] = { ...categoriesData[index], ...categoryData };
        resolve(categoriesData[index]);
      } else {
        reject(new Error('Không tìm thấy danh mục'));
      }
    }, 500);
  });
};

// Xóa danh mục
export const deleteCategory = async (id) => {
  // Giả lập call API
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = categoriesData.findIndex(category => category.id === Number(id));
      if (index !== -1) {
        categoriesData.splice(index, 1);
        resolve({ success: true });
      } else {
        reject(new Error('Không tìm thấy danh mục'));
      }
    }, 500);
  });
};