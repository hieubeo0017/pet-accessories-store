const { connectDB, sql } = require('../config/database');
const petModel = require('../models/petModel');
const productModel = require('../models/productModel');
const spaServiceModel = require('../models/spaServiceModel');

const searchController = {
  // Tìm kiếm tổng hợp
  searchAll: async (req, res) => {
    try {
      const { query, page = 1, limit = 20, type, featured } = req.query;
      
      // Kiểm tra xem có phải đang yêu cầu sản phẩm nổi bật không
      const isFeaturedRequest = featured === 'true';
      
      // Chỉ báo lỗi khi không có query và không phải là yêu cầu sản phẩm nổi bật
      if (!query && !isFeaturedRequest) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập từ khóa tìm kiếm'
        });
      }
      
      const offset = (page - 1) * limit;
      const pool = await connectDB();
      
      // Nếu là yêu cầu sản phẩm nổi bật và không có query
      if (isFeaturedRequest && !query) {
        // Tìm thú cưng nổi bật
        let petsPromise = Promise.resolve({ recordset: [] });
        if (!type || type === 'pet') {
          petsPromise = pool.request()
            .input('limit', sql.Int, parseInt(limit))
            .query(`
              SELECT TOP (@limit) p.*, 'pet' as type
              FROM pets p
              WHERE p.is_active = 1 AND p.is_featured = 1
              ORDER BY p.created_at DESC
            `);
        }
        
        // Tìm sản phẩm nổi bật
        let productsPromise = Promise.resolve({ recordset: [] });
        if (!type || type === 'product') {
          productsPromise = pool.request()
            .input('limit', sql.Int, parseInt(limit))
            .query(`
              SELECT TOP (@limit) p.*, 'product' as type
              FROM products p
              WHERE p.is_active = 1 AND p.is_featured = 1
              ORDER BY p.created_at DESC
            `);
        }
        
        // Tìm dịch vụ spa nổi bật
        let servicesPromise = Promise.resolve({ recordset: [] });
        if (!type || type === 'service') {
          servicesPromise = pool.request()
            .input('limit', sql.Int, parseInt(limit))
            .query(`
              SELECT TOP (@limit) s.*, 'service' as type
              FROM spa_services s
              WHERE s.is_active = 1 AND s.is_featured = 1
              ORDER BY s.created_at DESC
            `);
        }
        
        // Thực thi các truy vấn song song
        const [petsResult, productsResult, servicesResult] = await Promise.all([
          petsPromise, productsPromise, servicesPromise
        ]);
        
        // Lấy hình ảnh cho mỗi kết quả
        const pets = await Promise.all(petsResult.recordset.map(async (pet) => {
          const imagesResult = await pool.request()
            .input('pet_id', sql.VarChar(50), pet.id)
            .query(`
              SELECT TOP 1 image_url 
              FROM pet_images 
              WHERE pet_id = @pet_id
              ORDER BY is_primary DESC, display_order ASC
            `);
          
          return {
            ...pet,
            image: imagesResult.recordset.length > 0 ? imagesResult.recordset[0].image_url : null
          };
        }));
        
        const products = await Promise.all(productsResult.recordset.map(async (product) => {
          const imagesResult = await pool.request()
            .input('product_id', sql.VarChar(50), product.id)
            .query(`
              SELECT TOP 1 image_url 
              FROM product_images 
              WHERE product_id = @product_id
              ORDER BY is_primary DESC, display_order ASC
            `);
          
          return {
            ...product,
            image: imagesResult.recordset.length > 0 ? imagesResult.recordset[0].image_url : null
          };
        }));
        
        const services = await Promise.all(servicesResult.recordset.map(async (service) => {
          const imagesResult = await pool.request()
            .input('service_id', sql.VarChar(50), service.id)
            .query(`
              SELECT TOP 1 image_url 
              FROM spa_service_images 
              WHERE service_id = @service_id
              ORDER BY is_primary DESC, display_order ASC
            `);
          
          return {
            ...service,
            image: imagesResult.recordset.length > 0 ? imagesResult.recordset[0].image_url : service.image_url
          };
        }));
        
        // Trả về kết quả
        return res.json({
          success: true,
          query: query,
          pets,
          products,
          services,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit)
          }
        });
      }
      // Nếu là tìm kiếm thông thường (có query)
      else {
        // Tìm thú cưng
        let petsPromise = Promise.resolve({ recordset: [] });
        if (!type || type === 'pet') {
          petsPromise = pool.request()
            .input('search', sql.NVarChar, `%${query}%`)
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, parseInt(limit))
            .query(`
              SELECT p.*, 'pet' as type
              FROM pets p
              WHERE p.is_active = 1 AND (p.name LIKE @search OR p.breed LIKE @search OR p.description LIKE @search)
              ORDER BY p.is_featured DESC, p.created_at DESC
              OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `);
        }
        
        // Tìm sản phẩm
        let productsPromise = Promise.resolve({ recordset: [] });
        if (!type || type === 'product') {
          productsPromise = pool.request()
            .input('search', sql.NVarChar, `%${query}%`)
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, parseInt(limit))
            .query(`
              SELECT p.*, 'product' as type
              FROM products p
              WHERE p.is_active = 1 AND (p.name LIKE @search OR p.description LIKE @search)
              ORDER BY p.is_featured DESC, p.created_at DESC
              OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `);
        }
        
        // Tìm dịch vụ spa
        let servicesPromise = Promise.resolve({ recordset: [] });
        if (!type || type === 'service') {
          servicesPromise = pool.request()
            .input('search', sql.NVarChar, `%${query}%`)
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, parseInt(limit))
            .query(`
              SELECT s.*, 'service' as type
              FROM spa_services s
              WHERE s.is_active = 1 AND (s.name LIKE @search OR s.description LIKE @search)
              ORDER BY s.is_featured DESC, s.created_at DESC
              OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `);
        }
        
        // Thực thi các truy vấn song song
        const [petsResult, productsResult, servicesResult] = await Promise.all([
          petsPromise, productsPromise, servicesPromise
        ]);
        
        // Lấy hình ảnh cho mỗi kết quả
        const pets = await Promise.all(petsResult.recordset.map(async (pet) => {
          const imagesResult = await pool.request()
            .input('pet_id', sql.VarChar(50), pet.id)
            .query(`
              SELECT TOP 1 image_url 
              FROM pet_images 
              WHERE pet_id = @pet_id
              ORDER BY is_primary DESC, display_order ASC
            `);
          
          return {
            ...pet,
            image: imagesResult.recordset.length > 0 ? imagesResult.recordset[0].image_url : null
          };
        }));
        
        const products = await Promise.all(productsResult.recordset.map(async (product) => {
          const imagesResult = await pool.request()
            .input('product_id', sql.VarChar(50), product.id)
            .query(`
              SELECT TOP 1 image_url 
              FROM product_images 
              WHERE product_id = @product_id
              ORDER BY is_primary DESC, display_order ASC
            `);
          
          return {
            ...product,
            image: imagesResult.recordset.length > 0 ? imagesResult.recordset[0].image_url : null
          };
        }));
        
        const services = await Promise.all(servicesResult.recordset.map(async (service) => {
          const imagesResult = await pool.request()
            .input('service_id', sql.VarChar(50), service.id)
            .query(`
              SELECT TOP 1 image_url 
              FROM spa_service_images 
              WHERE service_id = @service_id
              ORDER BY is_primary DESC, display_order ASC
            `);
          
          return {
            ...service,
            image: imagesResult.recordset.length > 0 ? imagesResult.recordset[0].image_url : service.image_url
          };
        }));
        
        // Trả về kết quả
        res.json({
          success: true,
          query: query,
          pets,
          products,
          services,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit)
          }
        });
      }
    } catch (error) {
      console.error('Error in search:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tìm kiếm',
        error: error.message
      });
    }
  }
};

module.exports = searchController;