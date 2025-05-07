// Đường dẫn: backend/controllers/productController.js
const productModel = require('../models/productModel');
const { sql, connectDB } = require('../config/database');

const productController = {
  // GET tất cả sản phẩm với phân trang và lọc
  getAllProducts: async (req, res) => {
    try {
      const { 
        search, 
        page = 1, 
        limit = 10, 
        category_id,
        category_type, // Thêm tham số này
        brand_id,
        pet_type,
        min_price,
        max_price,
        is_active,
        is_featured,
        sort_by = 'id',
        sort_order = 'desc'
      } = req.query;
      
      // Xác định nếu request đến từ client
      const isClientRequest = req.headers['x-client-view'] === 'true';
      
      // Xử lý category_id nếu là danh sách được phân tách bằng dấu phẩy
      const categoryIds = category_id ? category_id.split(',') : undefined;
      
      const options = {
        search,
        page: parseInt(page),
        limit: parseInt(limit),
        category_ids: categoryIds,
        category_id,
        category_type, // Thêm tham số mới vào options
        brand_id,
        pet_type,
        min_price: min_price ? parseFloat(min_price) : undefined,
        max_price: max_price ? parseFloat(max_price) : undefined,
        is_active: isClientRequest ? true : (is_active !== undefined ? is_active === 'true' : undefined),
        is_featured: is_featured === 'true' || is_featured === true ? true : 
                     is_featured === 'false' || is_featured === false ? false : undefined,
        sortBy: sort_by,
        sortOrder: sort_order
      };
      
      const result = await productModel.getAll(options);
      
      res.json({
        message: 'Lấy danh sách sản phẩm thành công',
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', err);
      res.status(500).json({ 
        message: 'Đã xảy ra lỗi khi lấy danh sách sản phẩm', 
        error: err.message 
      });
    }
  },
  
  // GET sản phẩm theo ID
  getProductById: async (req, res) => {
    try {
      const id = req.params.id;
      const product = await productModel.getById(id);
      
      // Xử lý trạng thái is_primary cho images khi trả về client
      if (product && product.images && product.images.length > 0) {
        // Tìm ảnh đầu tiên có is_primary = true
        const primaryIndex = product.images.findIndex(img => img.is_primary);
        
        if (primaryIndex !== -1) {
          // Nếu có ảnh primary, đảm bảo chỉ ảnh đó là primary
          product.images = product.images.map((img, index) => ({
            ...img,
            is_primary: index === primaryIndex
          }));
        } else {
          // Nếu không có ảnh nào là primary, đặt ảnh đầu tiên làm primary
          product.images = product.images.map((img, index) => ({
            ...img,
            is_primary: index === 0
          }));
        }
      }
      
      if (!product) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      }
      
      res.json({
        message: 'Lấy chi tiết sản phẩm thành công',
        data: product
      });
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết sản phẩm:', err);
      res.status(500).json({ 
        message: 'Đã xảy ra lỗi khi lấy chi tiết sản phẩm', 
        error: err.message 
      });
    }
  },
  
  // POST tạo sản phẩm mới
  createProduct: async (req, res) => {
    try {
      const { 
        name, description, price, category_id, brand_id, pet_type, 
        sku, stock, discount, is_active, 
        images, specifications 
      } = req.body;
      
      // Validate dữ liệu đầu vào
      if (!name || !description || !price || !category_id) {
        return res.status(400).json({ 
          message: 'Thiếu thông tin bắt buộc',
          required: ['name', 'description', 'price', 'category_id']
        });
      }
      
      // Kiểm tra giá trị hợp lệ
      if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        return res.status(400).json({ 
          message: 'Giá sản phẩm không hợp lệ',
          detail: 'Giá phải là số dương'
        });
      }
      
      // Kiểm tra category_id có tồn tại không
      const pool = await connectDB();
      const categoryResult = await pool.request()
        .input('id', sql.VarChar(50), category_id)
        .query('SELECT id FROM categories WHERE id = @id');
        
      if (categoryResult.recordset.length === 0) {
        return res.status(400).json({ 
          message: 'Danh mục không tồn tại',
          detail: `Không tìm thấy danh mục với ID ${category_id}`
        });
      }
      
      // Kiểm tra brand_id có tồn tại không (nếu có)
      if (brand_id) {
        const brandResult = await pool.request()
          .input('id', sql.VarChar(50), brand_id)
          .query('SELECT id FROM brands WHERE id = @id');
          
        if (brandResult.recordset.length === 0) {
          return res.status(400).json({ 
            message: 'Thương hiệu không tồn tại',
            detail: `Không tìm thấy thương hiệu với ID ${brand_id}`
          });
        }
      }
      
      // Kiểm tra pet_type hợp lệ
      if (pet_type && !['dog', 'cat', 'all'].includes(pet_type)) {
        return res.status(400).json({ 
          message: 'Loại thú cưng không hợp lệ',
          validTypes: ['dog', 'cat', 'all']
        });
      }
      
      // Dữ liệu sản phẩm
      const productData = {
        name,
        description,
        price,
        category_id,
        brand_id,
        pet_type: pet_type || 'all',
        sku,
        stock: stock !== undefined ? parseInt(stock) : 0,
        discount: discount !== undefined ? parseFloat(discount) : 0,
        is_active: is_active !== undefined ? is_active : true,
        is_featured: req.body.is_featured || false // Thêm dòng này
      };
      
      // Xử lý is_primary cho images (chỉ cho phép 1 ảnh chính)
      let primaryFound = false;
      const processedImages = (images || []).map(img => {
        if (img.is_primary) {
          if (primaryFound) {
            return { ...img, is_primary: false };
          }
          primaryFound = true;
          return img;
        }
        return img;
      });
      
      if (!primaryFound && processedImages.length > 0) {
        processedImages[0].is_primary = true;
      }
      
      // Tạo sản phẩm mới
      const newProduct = await productModel.create(
        productData,
        processedImages,
        specifications || []
      );
      
      res.status(201).json({
        message: 'Thêm sản phẩm mới thành công',
        data: newProduct
      });
    } catch (err) {
      console.error('Lỗi khi tạo sản phẩm mới:', err);
      res.status(500).json({ 
        message: 'Đã xảy ra lỗi khi tạo sản phẩm mới', 
        error: err.message 
      });
    }
  },
  
  // PUT cập nhật sản phẩm
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const productData = req.body;
      const { images = [], specifications = [] } = productData;
      
      // Xử lý is_primary cho images (chỉ cho phép 1 ảnh chính)
      let primaryFound = false;
      const processedImages = images.map(img => {
        if (img.is_primary) {
          if (primaryFound) {
            return { ...img, is_primary: false };
          }
          primaryFound = true;
          return img;
        }
        return img;
      });
      
      if (!primaryFound && processedImages.length > 0) {
        processedImages[0].is_primary = true;
      }
      
      // Cập nhật productData với images đã xử lý
      productData.images = processedImages;
      
      // Cập nhật sản phẩm
      const updatedProduct = await productModel.update(id, productData, processedImages, specifications);
      
      res.json({
        success: true,
        message: 'Cập nhật sản phẩm thành công',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật sản phẩm', error: error.message });
    }
  },
  
  // DELETE xóa sản phẩm
  deleteProduct: async (req, res) => {
    try {
      const id = req.params.id;
      
      // Kiểm tra sản phẩm có tồn tại không
      const product = await productModel.getById(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      }
      
      // Kiểm tra sản phẩm có đang được sử dụng không
      const isInUse = await productModel.checkProductInUse(id);
      if (isInUse) {
        return res.status(400).json({
          message: 'Không thể xóa sản phẩm đang được sử dụng trong đơn hàng',
          suggestion: 'Bạn có thể đánh dấu là không hoạt động (is_active = false) thay vì xóa'
        });
      }
      
      // Xóa sản phẩm
      const deletedProduct = await productModel.delete(id);
      
      res.json({
        message: 'Xóa sản phẩm thành công',
        data: deletedProduct
      });
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm:', err);
      res.status(500).json({ 
        message: 'Đã xảy ra lỗi khi xóa sản phẩm', 
        error: err.message 
      });
    }
  },

  // Lấy danh sách sản phẩm nổi bật
  getFeaturedProducts: async (req, res) => {
    try {
      const { type, category_id, limit = 4 } = req.query;
      
      const featuredProducts = await productModel.getFeatured({
        type,
        category_id,
        limit
      });
      
      res.json({
        message: 'Lấy danh sách sản phẩm nổi bật thành công',
        data: featuredProducts
      });
    } catch (err) {
      console.error('Lỗi khi lấy danh sách sản phẩm nổi bật:', err);
      res.status(500).json({ 
        message: 'Đã xảy ra lỗi khi lấy danh sách sản phẩm nổi bật', 
        error: err.message 
      });
    }
  },

  // GET tất cả thú cưng với phân trang và lọc
  getAllPets: async (req, res) => {
    try {
      // Lấy các tham số từ query
      const { 
        search, page, limit, type, breed, gender, min_price, 
        max_price, is_adopted, is_active, is_featured, category_id, sort_by, sort_order 
      } = req.query;
      
      // Chuyển đổi is_adopted và is_active từ chuỗi sang boolean nếu có
      let adoptedFilter, activeFilter, featuredFilter;
      
      if (is_adopted !== undefined) {
        adoptedFilter = is_adopted === 'true' || is_adopted === '1';
      }
      
      if (is_active !== undefined) {
        activeFilter = is_active === 'true' || is_active === '1';
      }
      
      // Thêm xử lý cho tham số is_featured
      if (is_featured !== undefined) {
        featuredFilter = is_featured === 'true' || is_featured === '1';
      }
      
      // Lấy danh sách thú cưng với bộ lọc
      const pets = await petModel.getAll({
        search,
        page,
        limit,
        type,
        breed,
        gender,
        min_price,
        max_price,
        is_adopted: adoptedFilter,
        is_active: activeFilter,
        is_featured: featuredFilter, // Thêm tham số này
        category_id,
        sortBy: sort_by,
        sortOrder: sort_order
      });
      
      res.json(pets);
    } catch (error) {
      console.error('Error getting all pets:', error);
      res.status(500).json({ message: 'Lỗi khi lấy danh sách thú cưng', error: error.message });
    }
  }
};

module.exports = productController;