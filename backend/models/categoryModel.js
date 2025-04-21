const { connectDB, sql } = require('../config/database');

const categoryModel = {
  // Lấy tất cả danh mục
  getAll: async () => {
    try {
      const pool = await connectDB();
      const result = await pool.request().query('SELECT * FROM categories ORDER BY id DESC');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  },
  
  // Lấy danh mục theo ID
  getById: async (id) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('id', sql.VarChar(50), id) 
        .query('SELECT * FROM categories WHERE id = @id');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Thêm danh mục mới với ID dạng chuỗi
  create: async (categoryData) => {
    const { name, description, slug, type, image_url, is_active } = categoryData;
    
    try {
      const pool = await connectDB();
      
      // Tạo ID mới theo định dạng "CAT-XXXX"
      const result = await pool.request().query(`
        SELECT MAX(CAST(SUBSTRING(id, 5, LEN(id)-4) AS INT)) as maxNum
        FROM categories
        WHERE id LIKE 'CAT-%'
      `);
      
      let nextNum = 1;
      if (result.recordset[0].maxNum !== null) {
        nextNum = result.recordset[0].maxNum + 1;
      }
      
      const newCategoryId = `CAT-${nextNum.toString().padStart(4, '0')}`;
      
      // Thực hiện thêm dữ liệu
      const insertResult = await pool.request()
        .input('id', sql.VarChar(50), newCategoryId)
        .input('name', sql.NVarChar, name)
        .input('description', sql.NVarChar, description)
        .input('slug', sql.VarChar, slug || name.toLowerCase().replace(/\s+/g, '-'))
        .input('type', sql.VarChar, type)
        .input('image_url', sql.NVarChar, image_url || null)
        .input('is_active', sql.Bit, is_active === undefined ? 1 : is_active)
        .query(`
          INSERT INTO categories (id, name, description, slug, type, image_url, is_active)
          OUTPUT INSERTED.*
          VALUES (@id, @name, @description, @slug, @type, @image_url, @is_active)
        `);
      
      return insertResult.recordset[0];
    } catch (error) {
      console.error('Lỗi khi tạo danh mục:', error);
      throw error;
    }
  },
  
  // Cập nhật danh mục
  update: async (id, categoryData) => {
    const { name, description, slug, type, image_url, is_active } = categoryData;
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('id', sql.VarChar(50), id) // Thay đổi từ sql.Int sang sql.VarChar
        .input('name', sql.NVarChar, name)
        .input('description', sql.NVarChar, description)
        .input('slug', sql.VarChar, slug)
        .input('type', sql.VarChar, type)
        .input('image_url', sql.NVarChar, image_url)
        .input('is_active', sql.Bit, is_active)
        .query(`
          UPDATE categories 
          SET name = @name, 
              description = @description, 
              slug = @slug, 
              type = @type, 
              image_url = @image_url, 
              is_active = @is_active
          OUTPUT INSERTED.*
          WHERE id = @id
        `);
      
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('id', sql.VarChar(50), id) // Thay đổi từ sql.Int sang sql.VarChar
        .query('DELETE FROM categories OUTPUT DELETED.* WHERE id = @id');
      
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Lấy danh mục theo loại
  getByType: async (type) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('type', sql.VarChar, type)
        .query('SELECT * FROM categories WHERE type = @type');
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = categoryModel;