const { connectDB, sql } = require('../config/database');

const productModel = {
  // Lấy tất cả sản phẩm với bộ lọc và phân trang
  getAll: async (options = {}) => {
    try {
      const { 
        search = '', 
        page = 1, 
        limit = 10, 
        category_id,
        brand_id, 
        pet_type,
        min_price,
        max_price,
        is_active,
        sortBy = 'id', 
        sortOrder = 'desc' 
      } = options;
      
      const pool = await connectDB();
      let query = `
        SELECT 
          p.*,
          c.name as category_name,
          b.name as brand_name
        FROM 
          products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN brands b ON p.brand_id = b.id
        WHERE 1=1
      `;
      
      const params = [];
      
      // Lọc theo từ khóa tìm kiếm
      if (search) {
        query += ' AND (p.name LIKE @search OR p.description LIKE @search)';
        params.push({ name: 'search', value: `%${search}%`, type: sql.NVarChar });
      }
      
      // Lọc theo danh mục
      if (category_id) {
        query += ' AND p.category_id = @category_id';
        params.push({ name: 'category_id', value: category_id, type: sql.VarChar(50) });
      }
      
      // Lọc theo thương hiệu
      if (brand_id) {
        query += ' AND p.brand_id = @brand_id';
        params.push({ name: 'brand_id', value: brand_id, type: sql.VarChar(50) });
      }
      
      // Lọc theo loại thú cưng
      if (pet_type && pet_type !== 'all') {
        query += ' AND p.pet_type = @pet_type';
        params.push({ name: 'pet_type', value: pet_type, type: sql.VarChar });
      }
      
      // Lọc theo giá
      if (min_price !== undefined) {
        query += ' AND p.price >= @min_price';
        params.push({ name: 'min_price', value: parseFloat(min_price), type: sql.Decimal(10, 2) });
      }
      
      if (max_price !== undefined) {
        query += ' AND p.price <= @max_price';
        params.push({ name: 'max_price', value: parseFloat(max_price), type: sql.Decimal(10, 2) });
      }
      
      // Lọc theo trạng thái
      if (is_active !== undefined) {
        query += ' AND p.is_active = @is_active';
        params.push({ name: 'is_active', value: is_active ? 1 : 0, type: sql.Bit });
      }
      
      // Đếm tổng số bản ghi thỏa mãn điều kiện lọc
      const countQuery = query.replace(/SELECT\s+p\.\*,\s+c\.name\s+as\s+category_name,\s+b\.name\s+as\s+brand_name/i, 'SELECT COUNT(*) as total');
      const countRequest = pool.request();
      params.forEach(param => {
        countRequest.input(param.name, param.type, param.value);
      });
      const countResult = await countRequest.query(countQuery);
      const totalItems = countResult.recordset[0].total;
      
      // Xử lý sắp xếp kết quả
      if (sortBy === 'id') {
        // Xử lý đặc biệt cho ID dạng chuỗi (PRD-XXXX)
        query += ` ORDER BY CAST(SUBSTRING(p.id, 5, LEN(p.id)-4) AS INT) ${sortOrder.toUpperCase()}`;
      } else if (sortBy === 'price') {
        query += ` ORDER BY p.price ${sortOrder.toUpperCase()}`;
      } else if (sortBy === 'name') {
        query += ` ORDER BY p.name ${sortOrder.toUpperCase()}`;
      } else if (sortBy === 'category') {
        query += ` ORDER BY category_name ${sortOrder.toUpperCase()}`;
      } else if (sortBy === 'brand') {
        query += ` ORDER BY brand_name ${sortOrder.toUpperCase()}`;
      } else {
        query += ` ORDER BY p.${sortBy} ${sortOrder.toUpperCase()}`;
      }
      
      // Phân trang
      const offset = (page - 1) * limit;
      query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
      params.push(
        { name: 'offset', value: offset, type: sql.Int },
        { name: 'limit', value: parseInt(limit), type: sql.Int }
      );
      
      // Thực hiện truy vấn chính
      const request = pool.request();
      params.forEach(param => {
        request.input(param.name, param.type, param.value);
      });
      
      const result = await request.query(query);
      
      // Lấy hình ảnh cho mỗi sản phẩm
      const products = [];
      for (const product of result.recordset) {
        // Lấy hình ảnh của sản phẩm
        const imagesResult = await pool.request()
          .input('product_id', sql.VarChar(50), product.id)
          .query(`
            SELECT * 
            FROM product_images 
            WHERE product_id = @product_id 
            ORDER BY is_primary DESC, display_order ASC
          `);
          
        // Lấy thông số kỹ thuật của sản phẩm
        const specificationsResult = await pool.request()
          .input('product_id', sql.VarChar(50), product.id)
          .query(`
            SELECT * 
            FROM product_specifications 
            WHERE product_id = @product_id
          `);
        
        products.push({
          ...product,
          images: imagesResult.recordset,
          specifications: specificationsResult.recordset
        });
      }
      
      return {
        data: products,
        pagination: {
          total: totalItems,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalItems / limit)
        }
      };
    } catch (error) {
      console.error('Error in productModel.getAll:', error);
      throw error;
    }
  },
  
  // Lấy chi tiết sản phẩm theo ID
  getById: async (id) => {
    try {
      const pool = await connectDB();
      
      // Lấy thông tin sản phẩm và các bảng liên kết
      const result = await pool.request()
        .input('id', sql.VarChar(50), id)
        .query(`
          SELECT 
            p.*,
            c.name as category_name,
            b.name as brand_name
          FROM 
            products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
          WHERE 
            p.id = @id
        `);
      
      if (result.recordset.length === 0) {
        return null;
      }
      
      const product = result.recordset[0];
      
      // Lấy hình ảnh của sản phẩm
      const imagesResult = await pool.request()
        .input('product_id', sql.VarChar(50), id)
        .query(`
          SELECT * 
          FROM product_images 
          WHERE product_id = @product_id 
          ORDER BY is_primary DESC, display_order ASC
        `);
      
      // Lấy thông số kỹ thuật của sản phẩm
      const specificationsResult = await pool.request()
        .input('product_id', sql.VarChar(50), id)
        .query(`
          SELECT spec_name, spec_value 
          FROM product_specifications 
          WHERE product_id = @product_id
        `);
      
      // Kết hợp tất cả dữ liệu
      return {
        ...product,
        images: imagesResult.recordset,
        specifications: specificationsResult.recordset
      };
    } catch (error) {
      console.error('Error in productModel.getById:', error);
      throw error;
    }
  },
  
  // Tạo sản phẩm mới với ID dạng chuỗi
  create: async (productData, images = [], specifications = []) => {
    try {
      const pool = await connectDB();
      const transaction = pool.transaction();
      
      try {
        await transaction.begin();
        
        // Tạo ID mới theo định dạng "PRD-XXXX"
        const result = await pool.request().query(`
          SELECT MAX(CAST(SUBSTRING(id, 5, LEN(id)-4) AS INT)) as maxNum
          FROM products
          WHERE id LIKE 'PRD-%'
        `);
        
        let nextNum = 1;
        if (result.recordset[0].maxNum !== null) {
          nextNum = result.recordset[0].maxNum + 1;
        }
        
        const newProductId = `PRD-${nextNum.toString().padStart(4, '0')}`;
        
        // Thêm sản phẩm mới vào database
        const { 
          name, description, price, category_id, brand_id, pet_type, 
          sku, stock, discount, is_active, is_featured // Thêm is_featured vào đây
        } = productData;
        
        // Không sử dụng OUTPUT trong câu lệnh INSERT
        await pool.request()
          .input('id', sql.VarChar(50), newProductId)
          .input('name', sql.NVarChar, name)
          .input('description', sql.NVarChar, description)
          .input('price', sql.Decimal(10, 2), parseFloat(price))
          .input('category_id', sql.VarChar(50), category_id)
          .input('brand_id', sql.VarChar(50), brand_id || null)
          .input('pet_type', sql.VarChar(20), pet_type || 'all')
          .input('sku', sql.VarChar(50), sku || null)
          .input('stock', sql.Int, stock !== undefined ? parseInt(stock) : 0)
          .input('discount', sql.Decimal(5, 2), discount !== undefined ? parseFloat(discount) : 0)
          .input('is_active', sql.Bit, is_active !== undefined ? is_active : true)
          .input('is_featured', sql.Bit, is_featured !== undefined ? is_featured : false) // Thêm dòng này
          .query(`
            INSERT INTO products (
              id, name, description, price, category_id, brand_id, pet_type,
              sku, stock, discount, is_active, is_featured
            )
            VALUES (
              @id, @name, @description, @price, @category_id, @brand_id, @pet_type,
              @sku, @stock, @discount, @is_active, @is_featured
            );
          `);
        
        // Lấy thông tin sản phẩm sau khi thêm
        const productResult = await pool.request()
          .input('id', sql.VarChar(50), newProductId)
          .query(`SELECT * FROM products WHERE id = @id`);
        
        const product = productResult.recordset[0];
        
        // Thêm hình ảnh cho sản phẩm
        const savedImages = [];
        if (images && images.length > 0) {
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            // Tạo ID mới cho hình ảnh
            const imageResult = await pool.request().query(`
              SELECT MAX(CAST(SUBSTRING(id, 5, LEN(id)-4) AS INT)) as maxNum
              FROM product_images
              WHERE id LIKE 'IMG-%'
            `);
            
            let imageNextNum = 1;
            if (imageResult.recordset[0].maxNum !== null) {
              imageNextNum = imageResult.recordset[0].maxNum + 1;
            }
            
            const imageId = `IMG-${imageNextNum.toString().padStart(4, '0')}`;
            
            // Lưu hình ảnh - Loại bỏ OUTPUT
            await pool.request()
              .input('id', sql.VarChar(50), imageId)
              .input('product_id', sql.VarChar(50), newProductId)
              .input('image_url', sql.NVarChar, image.image_url)
              .input('is_primary', sql.Bit, image.is_primary ? 1 : 0)
              .input('display_order', sql.Int, image.display_order || i)
              .query(`
                INSERT INTO product_images (id, product_id, image_url, is_primary, display_order)
                VALUES (@id, @product_id, @image_url, @is_primary, @display_order);
              `);
            
            // Lấy hình ảnh vừa thêm
            const insertedImage = await pool.request()
              .input('id', sql.VarChar(50), imageId)
              .query(`SELECT * FROM product_images WHERE id = @id`);
            
            savedImages.push(insertedImage.recordset[0]);
          }
        }
        
        // Thêm thông số kỹ thuật cho sản phẩm
        const savedSpecs = [];
        if (specifications && specifications.length > 0) {
          for (const spec of specifications) {
            // Tạo ID mới cho thông số kỹ thuật
            const specResult = await pool.request().query(`
              SELECT MAX(CAST(SUBSTRING(id, 5, LEN(id)-4) AS INT)) as maxNum
              FROM product_specifications
              WHERE id LIKE 'SPC-%'
            `);
            
            let specNextNum = 1;
            if (specResult.recordset[0].maxNum !== null) {
              specNextNum = specResult.recordset[0].maxNum + 1;
            }
            
            const specId = `SPC-${specNextNum.toString().padStart(4, '0')}`;
            
            // Lưu thông số kỹ thuật - Loại bỏ OUTPUT
            await pool.request()
              .input('id', sql.VarChar(50), specId)
              .input('product_id', sql.VarChar(50), newProductId)
              .input('spec_name', sql.NVarChar, spec.name)
              .input('spec_value', sql.NVarChar, spec.value)
              .query(`
                INSERT INTO product_specifications (id, product_id, spec_name, spec_value)
                VALUES (@id, @product_id, @spec_name, @spec_value);
              `);
            
            // Lấy thông số kỹ thuật vừa thêm
            const insertedSpec = await pool.request()
              .input('id', sql.VarChar(50), specId)
              .query(`SELECT * FROM product_specifications WHERE id = @id`);
            
            savedSpecs.push(insertedSpec.recordset[0]);
          }
        }
        
        await transaction.commit();
        
        return {
          ...product,
          images: savedImages,
          specifications: savedSpecs
        };
      } catch (err) {
        await transaction.rollback();
        console.error('Transaction rolled back due to error:', err);
        throw err;
      }
    } catch (error) {
      console.error('Error in productModel.create:', error);
      throw error;
    }
  },
  
  // Cập nhật sản phẩm
  update: async (id, productData, images = null, specifications = null) => {
    try {
      const pool = await connectDB();
      const transaction = pool.transaction();
      
      try {
        await transaction.begin();
        
        // Kiểm tra sản phẩm tồn tại
        const checkProduct = await pool.request()
          .input('id', sql.VarChar(50), id)
          .query('SELECT * FROM products WHERE id = @id');
        
        if (checkProduct.recordset.length === 0) {
          throw new Error('Sản phẩm không tồn tại');
        }
        
        // Xây dựng câu lệnh update động
        const updateFields = [];
        const params = [{ name: 'id', value: id, type: sql.VarChar(50) }];
        
        if (productData.name !== undefined) {
          updateFields.push('name = @name');
          params.push({ name: 'name', value: productData.name, type: sql.NVarChar });
        }
        
        if (productData.description !== undefined) {
          updateFields.push('description = @description');
          params.push({ name: 'description', value: productData.description, type: sql.NVarChar });
        }
        
        if (productData.price !== undefined) {
          updateFields.push('price = @price');
          params.push({ name: 'price', value: parseFloat(productData.price), type: sql.Decimal(10, 2) });
        }
        
        if (productData.category_id !== undefined) {
          updateFields.push('category_id = @category_id');
          params.push({ name: 'category_id', value: productData.category_id, type: sql.VarChar(50) });
        }
        
        if (productData.brand_id !== undefined) {
          updateFields.push('brand_id = @brand_id');
          params.push({ name: 'brand_id', value: productData.brand_id || null, type: sql.VarChar(50) });
        }
        
        if (productData.pet_type !== undefined) {
          updateFields.push('pet_type = @pet_type');
          params.push({ name: 'pet_type', value: productData.pet_type, type: sql.VarChar(20) });
        }
        
        if (productData.sku !== undefined) {
          updateFields.push('sku = @sku');
          params.push({ name: 'sku', value: productData.sku || null, type: sql.VarChar(50) });
        }
        
        if (productData.stock !== undefined) {
          updateFields.push('stock = @stock');
          params.push({ name: 'stock', value: parseInt(productData.stock), type: sql.Int });
        }
        
        if (productData.discount !== undefined) {
          updateFields.push('discount = @discount');
          params.push({ name: 'discount', value: parseFloat(productData.discount), type: sql.Decimal(5, 2) });
        }
        
        if (productData.is_active !== undefined) {
          updateFields.push('is_active = @is_active');
          params.push({ name: 'is_active', value: productData.is_active, type: sql.Bit });
        }

        if (productData.is_featured !== undefined) {
          updateFields.push('is_featured = @is_featured');
          const boolValue = productData.is_featured === true ? 1 : 0;
          params.push({ name: 'is_featured', value: boolValue, type: sql.Bit });
        }
        
        // Cập nhật sản phẩm
        let product = null;
        
        if (updateFields.length > 0) {
          // Loại bỏ OUTPUT từ câu lệnh UPDATE
          const updateQuery = `
            UPDATE products 
            SET ${updateFields.join(', ')}, updated_at = GETDATE()
            WHERE id = @id
          `;
          
          const request = pool.request();
          params.forEach(param => {
            request.input(param.name, param.type, param.value);
          });
          
          await request.query(updateQuery);
          
          // Lấy thông tin sản phẩm sau khi cập nhật
          const updateResult = await pool.request()
            .input('id', sql.VarChar(50), id)
            .query('SELECT * FROM products WHERE id = @id');
            
          product = updateResult.recordset[0];
        } else {
          product = checkProduct.recordset[0];
        }
        
        // Cập nhật hình ảnh nếu có cung cấp
        if (images !== null) {
          // Xóa tất cả hình ảnh cũ
          await pool.request()
            .input('product_id', sql.VarChar(50), id)
            .query('DELETE FROM product_images WHERE product_id = @product_id');
          
          // Thêm hình ảnh mới
          const savedImages = [];
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            
            // Tạo ID mới cho hình ảnh
            const imageResult = await pool.request().query(`
              SELECT MAX(CAST(SUBSTRING(id, 5, LEN(id)-4) AS INT)) as maxNum
              FROM product_images
              WHERE id LIKE 'IMG-%'
            `);
            
            let imageNextNum = 1;
            if (imageResult.recordset[0].maxNum !== null) {
              imageNextNum = imageResult.recordset[0].maxNum + 1;
            }
            
            const imageId = `IMG-${imageNextNum.toString().padStart(4, '0')}`;
            
            // Lưu hình ảnh - Loại bỏ OUTPUT
            await pool.request()
              .input('id', sql.VarChar(50), imageId)
              .input('product_id', sql.VarChar(50), id)
              .input('image_url', sql.NVarChar, image.image_url)
              .input('is_primary', sql.Bit, image.is_primary ? 1 : 0)
              .input('display_order', sql.Int, image.display_order || i)
              .query(`
                INSERT INTO product_images (id, product_id, image_url, is_primary, display_order)
                VALUES (@id, @product_id, @image_url, @is_primary, @display_order);
              `);
              
            // Lấy hình ảnh vừa thêm
            const insertedImage = await pool.request()
              .input('id', sql.VarChar(50), imageId)
              .query(`SELECT * FROM product_images WHERE id = @id`);
              
            savedImages.push(insertedImage.recordset[0]);
          }
          
          product.images = savedImages;
        }
        
        // Cập nhật thông số kỹ thuật nếu có cung cấp
        if (specifications !== null) {
          // Xóa tất cả thông số kỹ thuật cũ
          await pool.request()
            .input('product_id', sql.VarChar(50), id)
            .query('DELETE FROM product_specifications WHERE product_id = @product_id');
          
          // Thêm thông số kỹ thuật mới
          const savedSpecs = [];
          for (const spec of specifications) {
            // Tạo ID mới cho thông số kỹ thuật
            const specResult = await pool.request().query(`
              SELECT MAX(CAST(SUBSTRING(id, 5, LEN(id)-4) AS INT)) as maxNum
              FROM product_specifications
              WHERE id LIKE 'SPC-%'
            `);
            
            let specNextNum = 1;
            if (specResult.recordset[0].maxNum !== null) {
              specNextNum = specResult.recordset[0].maxNum + 1;
            }
            
            const specId = `SPC-${specNextNum.toString().padStart(4, '0')}`;
            
            // Lưu thông số kỹ thuật - Loại bỏ OUTPUT
            await pool.request()
              .input('id', sql.VarChar(50), specId)
              .input('product_id', sql.VarChar(50), id)
              .input('spec_name', sql.NVarChar, spec.spec_name || spec.name || '') // Sửa: chấp nhận cả hai trường
              .input('spec_value', sql.NVarChar, spec.spec_value || spec.value || '') // Sửa: chấp nhận cả hai trường
              .query(`
                INSERT INTO product_specifications (id, product_id, spec_name, spec_value)
                VALUES (@id, @product_id, @spec_name, @spec_value);
              `);
              
            // Lấy thông số kỹ thuật vừa thêm
            const insertedSpec = await pool.request()
              .input('id', sql.VarChar(50), specId)
              .query(`SELECT * FROM product_specifications WHERE id = @id`);
              
            savedSpecs.push(insertedSpec.recordset[0]);
          }
          
          product.specifications = savedSpecs;
        }
        
        await transaction.commit();
        
        // Lấy thông tin chi tiết sản phẩm sau khi cập nhật
        return await productModel.getById(id);
      } catch (err) {
        await transaction.rollback();
        console.error('Transaction rolled back due to error:', err);
        throw err;
      }
    } catch (error) {
      console.error('Error in productModel.update:', error);
      throw error;
    }
  },
  
  // Xóa sản phẩm
  delete: async (id) => {
    try {
      const pool = await connectDB();
      const transaction = pool.transaction();
      
      try {
        await transaction.begin();
        
        // Lấy thông tin sản phẩm trước khi xóa
        const productResult = await pool.request()
          .input('id', sql.VarChar(50), id)
          .query('SELECT * FROM products WHERE id = @id');
          
        if (productResult.recordset.length === 0) {
          await transaction.rollback();
          return null;
        }
        
        const product = productResult.recordset[0];
        
        // Lấy hình ảnh của sản phẩm
        const imagesResult = await pool.request()
          .input('product_id', sql.VarChar(50), id)
          .query('SELECT * FROM product_images WHERE product_id = @product_id');
          
        // Lấy thông số kỹ thuật của sản phẩm
        const specificationsResult = await pool.request()
          .input('product_id', sql.VarChar(50), id)
          .query('SELECT * FROM product_specifications WHERE product_id = @product_id');
          
        // Xóa thông số kỹ thuật của sản phẩm
        await pool.request()
          .input('product_id', sql.VarChar(50), id)
          .query('DELETE FROM product_specifications WHERE product_id = @product_id');
          
        // Xóa hình ảnh của sản phẩm
        await pool.request()
          .input('product_id', sql.VarChar(50), id)
          .query('DELETE FROM product_images WHERE product_id = @product_id');
          
        // Xóa sản phẩm
        await pool.request()
          .input('id', sql.VarChar(50), id)
          .query('DELETE FROM products WHERE id = @id');
          
        await transaction.commit();
        
        // Thêm dữ liệu hình ảnh và thông số kỹ thuật vào đối tượng sản phẩm để trả về
        product.images = imagesResult.recordset;
        product.specifications = specificationsResult.recordset;
        
        return product;
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch (error) {
      console.error('Error in productModel.delete:', error);
      throw error;
    }
  },
  
  // Kiểm tra xem sản phẩm có đang được sử dụng trong đơn hàng không
  checkProductInUse: async (id) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('id', sql.VarChar(50), id)
        .query(`
          SELECT COUNT(*) as count 
          FROM order_items 
          WHERE product_id = @id
        `);
        
      return result.recordset[0].count > 0;
    } catch (error) {
      console.error('Error in productModel.checkProductInUse:', error);
      throw error;
    }
  },

  // Lấy danh sách sản phẩm nổi bật
  getFeatured: async (options = {}) => {
    try {
      const { 
        type = '', 
        category_id = '',
        limit = 4
      } = options;
      
      const pool = await connectDB();
      let query = `
        SELECT 
          p.*,
          c.name as category_name,
          b.name as brand_name
        FROM 
          products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN brands b ON p.brand_id = b.id
        WHERE 
          p.is_featured = 1 
          AND p.is_active = 1
      `;
      
      const params = [];
      
      // Lọc theo loại thú cưng nếu có
      if (type && type !== 'all') {
        query += ' AND p.pet_type = @type';
        params.push({ name: 'type', value: type, type: sql.VarChar });
      }
      
      // Lọc theo category_id nếu có
      if (category_id) {
        query += ' AND p.category_id = @category_id';
        params.push({ name: 'category_id', value: category_id, type: sql.VarChar(50) });
      }
      
      // Sắp xếp và giới hạn số lượng kết quả
      query += ` ORDER BY CAST(SUBSTRING(p.id, 5, LEN(p.id)-4) AS INT) DESC 
                OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY`;
      
      params.push({ name: 'limit', value: parseInt(limit), type: sql.Int });
      
      // Thực hiện truy vấn
      const request = pool.request();
      params.forEach(param => {
        request.input(param.name, param.type, param.value);
      });
      
      const result = await request.query(query);
      
      // Lấy hình ảnh và thông số cho mỗi sản phẩm
      const featuredProducts = [];
      for (const product of result.recordset) {
        // Lấy hình ảnh của sản phẩm
        const imagesResult = await pool.request()
          .input('product_id', sql.VarChar(50), product.id)
          .query(`
            SELECT * 
            FROM product_images 
            WHERE product_id = @product_id 
            ORDER BY is_primary DESC, display_order ASC
          `);
          
        // Lấy thông số kỹ thuật của sản phẩm
        const specificationsResult = await pool.request()
          .input('product_id', sql.VarChar(50), product.id)
          .query(`
            SELECT * 
            FROM product_specifications 
            WHERE product_id = @product_id
          `);
        
        featuredProducts.push({
          ...product,
          images: imagesResult.recordset,
          specifications: specificationsResult.recordset
        });
      }
      
      return featuredProducts;
    } catch (error) {
      console.error('Error in productModel.getFeatured:', error);
      throw error;
    }
  }
};

module.exports = productModel;