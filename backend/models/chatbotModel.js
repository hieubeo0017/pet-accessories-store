const { connectDB, sql } = require('../config/database');

const chatbotModel = {
  // Lấy dữ liệu sản phẩm phổ biến hoặc nổi bật
  getPopularProducts: async (limit = 5) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('limit', sql.Int, limit)
        .query(`
          SELECT TOP (@limit) 
            p.id, p.name, p.price, p.description,
            c.name as category_name,
            b.name as brand_name
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN brands b ON p.brand_id = b.id
          WHERE p.is_active = 1
          ORDER BY p.is_featured DESC, p.created_at DESC
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error in chatbotModel.getPopularProducts:', error);
      return [];
    }
  },
  
  // Tìm kiếm sản phẩm theo từ khóa
  searchProducts: async (keyword) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('search', sql.NVarChar, `%${keyword}%`)
        .query(`
          SELECT TOP 5
            p.id, p.name, p.price, p.description,
            c.name as category_name,
            b.name as brand_name,
            p.pet_type
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN brands b ON p.brand_id = b.id
          WHERE p.is_active = 1
          AND (p.name LIKE @search OR p.description LIKE @search)
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error in chatbotModel.searchProducts:', error);
      return [];
    }
  },

  // Lấy thông tin thú cưng phổ biến
  getPopularPets: async (limit = 3) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('limit', sql.Int, limit)
        .query(`
          SELECT TOP (@limit)
            p.id, p.name, p.breed, p.type, p.price, p.description
          FROM pets p
          WHERE p.is_active = 1 AND p.is_adopted = 0
          ORDER BY p.is_featured DESC
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error in chatbotModel.getPopularPets:', error);
      return [];
    }
  },

  // Lấy thông tin dịch vụ spa phổ biến
  getPopularSpaServices: async (limit = 3) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('limit', sql.Int, limit)
        .query(`
          SELECT TOP (@limit)
            id, name, description, price, duration,
            pet_type, pet_size
          FROM spa_services
          WHERE is_active = 1
          ORDER BY is_featured DESC
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error in chatbotModel.getPopularSpaServices:', error);
      return [];
    }
  },

  // Lấy tất cả dịch vụ spa
  getAllSpaServices: async () => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .query(`
          SELECT 
            id, name, description, price, duration,
            pet_type, pet_size, is_active, is_featured
          FROM spa_services
          WHERE is_active = 1
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error in chatbotModel.getAllSpaServices:', error);
      return [];
    }
  },

  // Tìm dịch vụ spa theo từ khóa
  searchSpaServices: async (keyword) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('search', sql.NVarChar, `%${keyword}%`)
        .query(`
          SELECT 
            id, name, description, price, duration,
            pet_type, pet_size
          FROM spa_services
          WHERE is_active = 1
            AND (name LIKE @search OR description LIKE @search)
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error in chatbotModel.searchSpaServices:', error);
      return [];
    }
  },
  
  // Lấy thông tin thương hiệu
  getBrands: async (limit = 5) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('limit', sql.Int, limit)
        .query(`
          SELECT TOP (@limit)
            id, name, description, website
          FROM brands
          WHERE is_active = 1
          ORDER BY is_featured DESC
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error in chatbotModel.getBrands:', error);
      return [];
    }
  },

  // Truy vấn danh sách các giống chó hoặc mèo phổ biến
  getPopularBreeds: async (petType) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('petType', sql.VarChar, petType)
        .query(`
          SELECT TOP 5 breed
          FROM pets
          WHERE type = @petType AND is_active = 1
          GROUP BY breed
          ORDER BY COUNT(*) DESC
        `);
      return result.recordset.map(item => item.breed);
    } catch (error) {
      console.error('Error in chatbotModel.getPopularBreeds:', error);
      return [];
    }
  },

  // Đếm số lượng thú cưng theo loại
  countPetsByType: async (petType) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('petType', sql.VarChar, petType)
        .query(`
          SELECT COUNT(*) as total
          FROM pets
          WHERE type = @petType AND is_active = 1 AND is_adopted = 0
        `);
      return result.recordset[0].total;
    } catch (error) {
      console.error('Error in chatbotModel.countPetsByType:', error);
      return 0;
    }
  },

  // Lấy danh sách thú cưng theo loại
  getAllPetsByType: async (petType, limit = 10) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('petType', sql.VarChar, petType)
        .input('limit', sql.Int, limit)
        .query(`
          SELECT TOP (@limit)
            p.id, p.name, p.breed, p.type, p.price
          FROM pets p
          WHERE p.type = @petType AND p.is_active = 1 AND p.is_adopted = 0
          ORDER BY p.is_featured DESC, p.created_at DESC
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error in chatbotModel.getAllPetsByType:', error);
      return [];
    }
  },

  // Thêm các hàm mới vào chatbotModel
  getAccessoriesByPetType: async (petType, limit = 8) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('petType', sql.VarChar, petType)
        .input('limit', sql.Int, limit)
        .query(`
          SELECT TOP (@limit)
            p.id, p.name, p.price, p.description,
            c.name as category_name,
            b.name as brand_name
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN brands b ON p.brand_id = b.id
          WHERE p.is_active = 1
            AND (p.pet_type = @petType OR p.pet_type = 'all')
            AND EXISTS (
              SELECT 1 FROM categories 
              WHERE id = p.category_id AND type = 'accessory'
            )
          ORDER BY p.is_featured DESC, p.created_at DESC
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error in chatbotModel.getAccessoriesByPetType:', error);
      return [];
    }
  },

  getFoodByPetType: async (petType, limit = 8) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('petType', sql.VarChar, petType)
        .input('limit', sql.Int, limit)
        .query(`
          SELECT TOP (@limit)
            p.id, p.name, p.price, p.description,
            c.name as category_name,
            b.name as brand_name
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN brands b ON p.brand_id = b.id
          WHERE p.is_active = 1
            AND (p.pet_type = @petType OR p.pet_type = 'all')
            AND EXISTS (
              SELECT 1 FROM categories 
              WHERE id = p.category_id AND type = 'food'
            )
          ORDER BY p.is_featured DESC, p.created_at DESC
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error in chatbotModel.getFoodByPetType:', error);
      return [];
    }
  },

  countAccessoriesByPetType: async (petType) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('petType', sql.VarChar, petType)
        .query(`
          SELECT COUNT(DISTINCT p.id) as total
          FROM products p
          WHERE p.is_active = 1
            AND (p.pet_type = @petType OR p.pet_type = 'all')
            AND EXISTS (
              SELECT 1 FROM categories 
              WHERE id = p.category_id AND type = 'accessory'
            )
        `);
      return result.recordset[0].total;
    } catch (error) {
      console.error('Error in chatbotModel.countAccessoriesByPetType:', error);
      return 0;
    }
  },

  // Thêm các hàm mới sau

  // Tìm kiếm sản phẩm theo tên chính xác
  searchProductExact: async (productName) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('productName', sql.NVarChar, `%${productName}%`)
        .input('productName2', sql.NVarChar, `%${productName.replace(/\s+/g, '%')}%`)
        .query(`
          SELECT p.id, p.name, p.price, p.stock, p.description, p.discount,
                 c.name as category_name, b.name as brand_name, p.pet_type,
                 (SELECT TOP 1 image_url FROM product_images WHERE product_id = p.id AND is_primary = 1) as image_url
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN brands b ON p.brand_id = b.id
          WHERE p.is_active = 1
          AND (
            p.name LIKE @productName 
            OR (p.name + ' ' + b.name) LIKE @productName
            OR (b.name + ' ' + p.name) LIKE @productName
            OR b.name LIKE @productName
          )
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error in chatbotModel.searchProductExact:', error);
      return [];
    }
  },

  // Tìm kiếm thú cưng theo tên, giống hoặc đặc điểm
  searchPetExact: async (petCriteria) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('criteria', sql.NVarChar, `%${petCriteria}%`)
        .query(`
          SELECT p.id, p.name, p.type, p.breed, p.age, p.gender, 
                 p.color, p.price, p.stock, p.is_adopted
          FROM pets p
          WHERE p.is_active = 1
          AND (p.name LIKE @criteria 
               OR p.breed LIKE @criteria
               OR p.color LIKE @criteria
               OR p.description LIKE @criteria)
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error in chatbotModel.searchPetExact:', error);
      return [];
    }
  },

  // Kiểm tra xem danh mục sản phẩm có tồn tại không
  checkCategoryExists: async (categoryName) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('categoryName', sql.NVarChar, `%${categoryName}%`)
        .query(`
          SELECT id, name, type 
          FROM categories 
          WHERE name LIKE @categoryName
        `);
      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error('Error in chatbotModel.checkCategoryExists:', error);
      return null;
    }
  },

  // Lấy sản phẩm theo danh mục
  getProductsByCategory: async (categoryId, limit = 5) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('categoryId', sql.VarChar, categoryId)
        .input('limit', sql.Int, limit)
        .query(`
          SELECT TOP (@limit) p.id, p.name, p.price, p.description,
                 c.name as category_name, b.name as brand_name
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN brands b ON p.brand_id = b.id
          WHERE p.is_active = 1 AND p.category_id = @categoryId
          ORDER BY p.is_featured DESC, p.created_at DESC
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error in chatbotModel.getProductsByCategory:', error);
      return [];
    }
  },

  // Kiểm tra xem giống thú cưng có tồn tại không
  checkBreedExists: async (breedName, petType = null) => {
    try {
      const pool = await connectDB();
      let query = `
        SELECT breed, type, COUNT(*) as count
        FROM pets
        WHERE breed LIKE @breedName AND is_active = 1
      `;
      
      if (petType) {
        query += ` AND type = @petType`;
      }
      
      query += ` GROUP BY breed, type`;
      
      const request = pool.request()
        .input('breedName', sql.NVarChar, `%${breedName}%`);
        
      if (petType) {
        request.input('petType', sql.VarChar, petType);
      }
      
      const result = await request.query(query);
      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error('Error in chatbotModel.checkBreedExists:', error);
      return null;
    }
  },

  // Tìm kiếm sản phẩm theo thương hiệu
  searchProductsByBrand: async (brandName) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('brandName', sql.NVarChar, `%${brandName}%`)
        .query(`
          SELECT p.id, p.name, p.price, p.stock, p.description, p.discount
          FROM products p
          JOIN brands b ON p.brand_id = b.id
          WHERE p.is_active = 1
          AND b.name LIKE @brandName
          ORDER BY p.is_featured DESC
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error in chatbotModel.searchProductsByBrand:', error);
      return [];
    }
  }
};

module.exports = chatbotModel;