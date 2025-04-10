// Thêm dữ liệu mẫu để test UI
const productsData = [
  {
    id: 1,
    name: 'Royal Canin Medium Adult',
    description: 'Thức ăn cho chó trưởng thành giống vừa',
    price: 350000,
    category_id: 1,
    category_name: 'Thức ăn cho chó',
    brand_id: 1,
    brand_name: 'Royal Canin',
    pet_type: 'dog',
    stock: 50,
    image_url: 'https://example.com/images/royal-canin-medium-adult.jpg',
    is_active: true
  },
  {
    id: 2,
    name: 'Pedigree Puppy',
    description: 'Thức ăn dành cho chó con',
    price: 210000,
    category_id: 1,
    category_name: 'Thức ăn cho chó',
    brand_id: 3,
    brand_name: 'Pedigree',
    pet_type: 'dog',
    stock: 30,
    image_url: 'https://example.com/images/pedigree-puppy.jpg',
    is_active: true
  }
];

// Cập nhật hàm fetchProducts để trả về đúng định dạng
export const fetchProducts = async ({ page = 1, pageSize = 10, searchTerm = '' } = {}) => {
  try {
    // Trong môi trường dev, sử dụng dữ liệu mẫu
    let filteredProducts = [...productsData];
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Tính toán phân trang
    const total = filteredProducts.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);
    
    // Trả về đúng định dạng mà ProductsPage.jsx mong đợi
    return {
      data: paginatedProducts,
      total: total,
      page: page,
      pageSize: pageSize
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
};

// Hàm lấy chi tiết sản phẩm theo ID - CẦN CẬP NHẬT
export const fetchProductById = async (id) => {
  try {
    const product = productsData.find(p => p.id === parseInt(id));
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product');
  }
};

// Hàm tạo sản phẩm mới
export const createProduct = async (productData) => {
  try {
    // Giả lập thêm sản phẩm mới
    const newProduct = {
      ...productData,
      id: productsData.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    productsData.push(newProduct);
    return newProduct;
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product');
  }
};

// Hàm cập nhật sản phẩm
export const updateProduct = async (id, productData) => {
  try {
    const index = productsData.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      throw new Error('Product not found');
    }
    productsData[index] = {
      ...productsData[index],
      ...productData,
      updated_at: new Date().toISOString()
    };
    return productsData[index];
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
};

// Hàm xóa sản phẩm
export const deleteProduct = async (id) => {
  try {
    const index = productsData.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      throw new Error('Product not found');
    }
    productsData.splice(index, 1);
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
};