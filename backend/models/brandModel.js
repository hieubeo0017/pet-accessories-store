const sql = require('mssql');
// Sửa đường dẫn từ '../config/db' thành '../config/database'
const { connectDB } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class BrandModel {
  // Lấy tất cả thương hiệu với phân trang và lọc
  async getAll({ page = 1, limit = 10, search = '', sortBy = 'name', sortOrder = 'asc', isActive = null }) {
    try {
      const pool = await connectDB();
      
      // Xây dựng câu truy vấn SQL với các điều kiện lọc
      let query = `
        SELECT 
          id, name, logo, description, website, is_active, is_featured, created_at,
          COUNT(*) OVER() AS total_count
        FROM brands
        WHERE 1=1
      `;
      
      const params = [];
      
      if (search) {
        query += ` AND (name LIKE @search OR description LIKE @search)`;
        params.push({ name: 'search', value: `%${search}%` });
      }
      
      if (isActive !== null) {
        query += ` AND is_active = @isActive`;
        params.push({ name: 'isActive', value: isActive });
      }
      
      // Sắp xếp
      query += ` ORDER BY ${this.validateSortColumn(sortBy)} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
      
      // Phân trang
      const offset = (page - 1) * limit;
      query += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
      
      // Tạo request và thêm tham số
      const request = pool.request();
      params.forEach(param => {
        request.input(param.name, param.value);
      });
      
      const result = await request.query(query);
      
      const brands = result.recordset;

      // Sau khi lấy danh sách thương hiệu
      for (const brand of brands) {
        // Đếm số lượng sản phẩm cho mỗi thương hiệu
        const countResult = await pool.request()
          .input('brand_id', sql.VarChar(50), brand.id)
          .query(`
            SELECT COUNT(*) AS total_count
            FROM products
            WHERE brand_id = @brand_id
          `);
          
        brand.total_count = countResult.recordset[0].total_count;
      }
      
      // Tính toán thông tin phân trang
      const totalCount = brands.length > 0 ? brands[0].total_count : 0;
      const totalPages = Math.ceil(totalCount / limit);
      
      return {
        data: brands,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems: totalCount,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error in BrandModel.getAll:', error);
      throw error;
    }
  }

  // Lấy thương hiệu theo ID và đếm sản phẩm
  async getById(id) {
    try {
      const pool = await connectDB();
      
      // Lấy thông tin thương hiệu
      const brandResult = await pool.request()
        .input('id', sql.VarChar(50), id)
        .query(`
          SELECT * FROM brands WHERE id = @id
        `);
        
      if (brandResult.recordset.length === 0) {
        return null;
      }
      
      const brand = brandResult.recordset[0];
      
      // Đếm số lượng sản phẩm sử dụng thương hiệu này
      const countResult = await pool.request()
        .input('brand_id', sql.VarChar(50), id)
        .query(`
          SELECT COUNT(*) AS total_count
          FROM products
          WHERE brand_id = @brand_id
        `);
        
      // Thêm thông tin số lượng sản phẩm vào kết quả
      brand.total_count = countResult.recordset[0].total_count;
      
      return brand;
    } catch (error) {
      console.error('Error in brandModel.getById:', error);
      throw error;
    }
  }

  // Tạo thương hiệu mới
  async create(brandData) {
    try {
      const pool = await connectDB();
      
      // Tạo ID mới theo định dạng "BRD-XXXX"
      const result = await pool.request().query(`
        SELECT MAX(CAST(SUBSTRING(id, 5, LEN(id)-4) AS INT)) as maxNum
        FROM brands
        WHERE id LIKE 'BRD-%'
      `);
      
      let nextNum = 1;
      if (result.recordset[0].maxNum !== null) {
        nextNum = result.recordset[0].maxNum + 1;
      }
      
      const brandId = `BRD-${nextNum.toString().padStart(4, '0')}`;
      
      // Thêm thương hiệu mới vào database
      const insertResult = await pool
        .request()
        .input('id', sql.VarChar, brandId)
        .input('name', sql.NVarChar, brandData.name)
        .input('logo', sql.NVarChar, brandData.logo)
        .input('description', sql.NVarChar, brandData.description || null)
        .input('website', sql.NVarChar, brandData.website || null)
        .input('is_active', sql.Bit, brandData.is_active !== undefined ? brandData.is_active : true)
        .input('is_featured', sql.Bit, brandData.is_featured !== undefined ? brandData.is_featured : false) // Thêm trường is_featured
        .query(`
          INSERT INTO brands (id, name, logo, description, website, is_active, is_featured)
          OUTPUT INSERTED.*
          VALUES (@id, @name, @logo, @description, @website, @is_active, @is_featured);
        `);
      
      return insertResult.recordset[0];
    } catch (error) {
      console.error('Error in BrandModel.create:', error);
      throw error;
    }
  }

  // Cập nhật thương hiệu
  async update(id, brandData) {
    try {
      const pool = await connectDB();
      
      // Kiểm tra thương hiệu tồn tại
      const checkResult = await pool
        .request()
        .input('id', sql.VarChar, id)
        .query('SELECT COUNT(*) as count FROM brands WHERE id = @id');
      
      if (checkResult.recordset[0].count === 0) {
        throw new Error('Brand not found');
      }
      
      // Xây dựng câu query update động dựa trên dữ liệu được cung cấp
      let updateFields = [];
      const request = pool.request().input('id', sql.VarChar, id);
      
      // Thêm các trường cần update
      if (brandData.name !== undefined) {
        updateFields.push('name = @name');
        request.input('name', sql.NVarChar, brandData.name);
      }
      
      if (brandData.logo !== undefined) {
        updateFields.push('logo = @logo');
        request.input('logo', sql.NVarChar, brandData.logo);
      }
      
      if (brandData.description !== undefined) {
        updateFields.push('description = @description');
        request.input('description', sql.NVarChar, brandData.description);
      }
      
      if (brandData.website !== undefined) {
        updateFields.push('website = @website');
        request.input('website', sql.NVarChar, brandData.website);
      }
      
      if (brandData.is_active !== undefined) {
        updateFields.push('is_active = @is_active');
        request.input('is_active', sql.Bit, brandData.is_active);
      }
      
      // Thêm trường is_featured vào danh sách cập nhật
      if (brandData.is_featured !== undefined) {
        updateFields.push('is_featured = @is_featured');
        request.input('is_featured', sql.Bit, brandData.is_featured);
      }
      
      if (updateFields.length === 0) {
        return await this.getById(id);
      }
      
      // Thực hiện cập nhật
      const updateQuery = `
        UPDATE brands
        SET ${updateFields.join(', ')}
        WHERE id = @id;
        
        SELECT * FROM brands WHERE id = @id;
      `;
      
      const result = await request.query(updateQuery);
      return result.recordset[0];
    } catch (error) {
      console.error('Error in BrandModel.update:', error);
      throw error;
    }
  }

  // Xóa thương hiệu
  async delete(id) {
    try {
      const pool = await connectDB();
      
      // Kiểm tra xem thương hiệu có đang được sử dụng không
      const checkProductsResult = await pool
        .request()
        .input('id', sql.VarChar, id)
        .query('SELECT COUNT(*) as count FROM products WHERE brand_id = @id');
      
      if (checkProductsResult.recordset[0].count > 0) {
        throw new Error('Cannot delete brand because it is associated with products');
      }
      
      // Thực hiện xóa thương hiệu
      const result = await pool
        .request()
        .input('id', sql.VarChar, id)
        .query('DELETE FROM brands WHERE id = @id');
      
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error in BrandModel.delete:', error);
      throw error;
    }
  }

  // Hàm kiểm tra và bảo vệ tên cột sắp xếp để tránh SQL Injection
  validateSortColumn(column) {
    const validColumns = ['id', 'name', 'website', 'is_active', 'created_at'];
    return validColumns.includes(column) ? column : 'name';
  }

  // Lấy danh sách thương hiệu nổi bật
  async getFeatured({ limit = 5 } = {}) {
    try {
      const pool = await connectDB();
      
      // Lấy danh sách thương hiệu nổi bật
      const query = `
        SELECT TOP ${parseInt(limit)} *
        FROM brands
        WHERE is_featured = 1 AND is_active = 1
        ORDER BY name
      `;
      
      const result = await pool.request().query(query);
      
      return result.recordset;
    } catch (error) {
      console.error('Error in brandModel.getFeatured:', error);
      throw error;
    }
  }
}

module.exports = new BrandModel();