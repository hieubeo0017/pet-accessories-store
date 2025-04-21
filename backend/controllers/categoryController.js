const categoryModel = require('../models/categoryModel');
const { sql, connectDB } = require('../config/database');

const categoryController = {
  // GET tất cả danh mục với phân trang và lọc
  getAllCategories: async (req, res) => {
    try {
      const { type, search, page = 1, limit = 10, sort = 'id', order = 'desc' } = req.query;

      // Thêm kiểm tra nếu limit là giá trị đặc biệt
      const useLimit = limit > 1000 ? 10000 : parseInt(limit); // Cho phép lấy tối đa 10000 bản ghi khi limit > 1000

      let query = 'SELECT * FROM categories WHERE 1=1';
      const params = [];
      
      // Lọc theo loại danh mục
      if (type) {
        query += ' AND type = @type';
        params.push({ name: 'type', value: type, type: sql.VarChar });
      }
      
      // Tìm kiếm theo tên
      if (search) {
        query += ' AND name LIKE @search';
        params.push({ name: 'search', value: `%${search}%`, type: sql.NVarChar });
      }
      
      // Sắp xếp kết quả - xử lý đặc biệt cho ID dạng chuỗi
      if (sort === 'id') {
        // Xử lý sắp xếp số trong id chuỗi (CAT-0001, CAT-0002, ...)
        query += ` ORDER BY CAST(SUBSTRING(id, 5, LEN(id)-4) AS INT) ${order === 'desc' ? 'DESC' : 'ASC'}`;
      } else {
        query += ` ORDER BY ${sort} ${order === 'desc' ? 'DESC' : 'ASC'}`;
      }
      
      // Phân trang
      const offset = (page - 1) * useLimit;
      query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
      params.push(
        { name: 'offset', value: offset, type: sql.Int },
        { name: 'limit', value: useLimit, type: sql.Int }
      );
      
      // Thực thi truy vấn
      const pool = await connectDB();
      const request = pool.request();
      
      // Add parameters
      params.forEach(param => {
        request.input(param.name, param.type, param.value);
      });
      
      const result = await request.query(query);
      
      // Lấy tổng số bản ghi để phân trang
      const countResult = await pool.request().query('SELECT COUNT(*) as total FROM categories');
      const total = countResult.recordset[0].total;
      
      res.json({
        data: result.recordset,
        pagination: {
          total,
          page: parseInt(page),
          limit: useLimit,
          totalPages: Math.ceil(total / useLimit)
        }
      });
    } catch (err) {
      console.error('Lỗi khi lấy danh mục:', err);
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },
  
  // GET danh mục theo ID
  getCategoryById: async (req, res) => {
    try {
      const category = await categoryModel.getById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      }
      res.json(category);
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết danh mục:', err);
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },
  
  // POST tạo danh mục mới với validation
  createCategory: async (req, res) => {
    try {
      const { name, description, slug, type, image_url, is_active } = req.body;
      
      // Validate dữ liệu đầu vào
      if (!name || !description || !type) {
        return res.status(400).json({ 
          message: 'Thiếu thông tin bắt buộc', 
          required: ['name', 'description', 'type'] 
        });
      }
      
      // Validate type phải thuộc các loại hợp lệ
      if (!['pet', 'food', 'accessory'].includes(type)) {
        return res.status(400).json({ 
          message: 'Loại danh mục không hợp lệ', 
          validTypes: ['pet', 'food', 'accessory'] 
        });
      }
      
      // Kiểm tra tên danh mục đã tồn tại chưa
      const pool = await connectDB();
      const checkResult = await pool.request()
        .input('name', sql.NVarChar, name)
        .query('SELECT COUNT(*) as count FROM categories WHERE name = @name');
      
      if (checkResult.recordset[0].count > 0) {
        return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
      }
      
      // Tạo slug nếu không có
      const slugToUse = slug || name.toLowerCase()
        .replace(/đ/g, 'd').replace(/[^a-z0-9]/gi, '-')
        .replace(/-+/g, '-').replace(/^-|-$/g, '');
      
      const categoryData = {
        name,
        description,
        slug: slugToUse,
        type,
        image_url: image_url || null,
        is_active: is_active === undefined ? true : Boolean(is_active)
      };
      
      const newCategory = await categoryModel.create(categoryData);
      res.status(201).json(newCategory);
    } catch (err) {
      console.error('Lỗi khi tạo danh mục:', err);
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },
  
  // PUT cập nhật danh mục với validation
  updateCategory: async (req, res) => {
    try {
      const { name, description, slug, type, image_url, is_active } = req.body;
      const categoryId = req.params.id;
      
      // Validate dữ liệu đầu vào
      if (!name || !description || !type) {
        return res.status(400).json({ 
          message: 'Thiếu thông tin bắt buộc', 
          required: ['name', 'description', 'type'] 
        });
      }
      
      // Validate type phải thuộc các loại hợp lệ
      if (!['pet', 'food', 'accessory'].includes(type)) {
        return res.status(400).json({ 
          message: 'Loại danh mục không hợp lệ', 
          validTypes: ['pet', 'food', 'accessory'] 
        });
      }
      
      // Kiểm tra category tồn tại
      const pool = await connectDB();
      const checkCategoryResult = await pool.request()
        .input('id', sql.VarChar(50), categoryId)
        .query('SELECT * FROM categories WHERE id = @id');
      
      if (checkCategoryResult.recordset.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      }
      
      // Kiểm tra tên danh mục đã tồn tại ở bản ghi khác chưa
      const checkNameResult = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('id', sql.VarChar(50), categoryId)
        .query('SELECT COUNT(*) as count FROM categories WHERE name = @name AND id != @id');
      
      if (checkNameResult.recordset[0].count > 0) {
        return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
      }
      
      // Tạo slug nếu không có
      const slugToUse = slug || name.toLowerCase()
        .replace(/đ/g, 'd').replace(/[^a-z0-9]/gi, '-')
        .replace(/-+/g, '-').replace(/^-|-$/g, '');
      
      const categoryData = {
        name,
        description,
        slug: slugToUse,
        type,
        image_url: image_url || null,
        is_active: is_active === undefined ? true : Boolean(is_active)
      };
      
      const updatedCategory = await categoryModel.update(categoryId, categoryData);
      res.json(updatedCategory);
    } catch (err) {
      console.error('Lỗi khi cập nhật danh mục:', err);
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },
  
  // DELETE xóa danh mục với kiểm tra ràng buộc
  deleteCategory: async (req, res) => {
    try {
      const categoryId = req.params.id;
      
      // Kiểm tra xem có sản phẩm hoặc thú cưng nào liên kết với danh mục này không
      const pool = await connectDB();
      const checkResult = await pool.request()
        .input('id', sql.VarChar(50), categoryId)
        .query(`
          SELECT 
            (SELECT COUNT(*) FROM products WHERE category_id = @id) as productCount,
            (SELECT COUNT(*) FROM pets WHERE category_id = @id) as petCount
        `);
      
      const { productCount, petCount } = checkResult.recordset[0];
      
      if (productCount > 0 || petCount > 0) {
        return res.status(400).json({
          message: 'Không thể xóa danh mục này vì đang được sử dụng',
          detail: {
            linkedProducts: productCount,
            linkedPets: petCount
          }
        });
      }
      
      const deletedCategory = await categoryModel.delete(categoryId);
      
      if (!deletedCategory) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      }
      
      res.json({
        message: 'Xóa danh mục thành công',
        data: deletedCategory
      });
    } catch (err) {
      console.error('Lỗi khi xóa danh mục:', err);
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },
  
  // NEW: Lấy danh mục theo loại
  getCategoriesByType: async (req, res) => {
    try {
      const { type } = req.params;
      
      if (!['pet', 'food', 'accessory'].includes(type)) {
        return res.status(400).json({ 
          message: 'Loại danh mục không hợp lệ', 
          validTypes: ['pet', 'food', 'accessory'] 
        });
      }
      
      const pool = await connectDB();
      const result = await pool.request()
        .input('type', sql.VarChar, type)
        .query('SELECT * FROM categories WHERE type = @type ORDER BY name ASC');
      
      res.json(result.recordset);
    } catch (err) {
      console.error('Lỗi khi lấy danh mục theo loại:', err);
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  }
};

module.exports = categoryController;