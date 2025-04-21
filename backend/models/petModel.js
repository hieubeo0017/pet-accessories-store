const { connectDB, sql } = require('../config/database');

const petModel = {
  // Lấy tất cả thú cưng với bộ lọc và phân trang
  getAll: async (options = {}) => {
    try {
      const { 
        search = '', 
        page = 1, 
        limit = 10, 
        type,
        breed,
        gender,
        min_price,
        max_price,
        is_adopted,
        is_active,
        category_id,
        sortBy = 'id', 
        sortOrder = 'desc' 
      } = options;
      
      const pool = await connectDB();
      let query = `
        SELECT 
          p.*,
          c.name as category_name
        FROM 
          pets p
          LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
      `;
      
      const params = [];
      
      // Lọc theo từ khóa tìm kiếm
      if (search) {
        query += ' AND (p.name LIKE @search OR p.breed LIKE @search OR p.description LIKE @search)';
        params.push({ name: 'search', value: `%${search}%`, type: sql.NVarChar });
      }
      
      // Lọc theo loại thú cưng
      if (type && type !== 'all') {
        query += ' AND p.type = @type';
        params.push({ name: 'type', value: type, type: sql.VarChar });
      }
      
      // Lọc theo giống
      if (breed && breed !== 'all') {
        query += ' AND p.breed LIKE @breed';
        params.push({ name: 'breed', value: `%${breed}%`, type: sql.NVarChar });
      }
      
      // Lọc theo giới tính
      if (gender && gender !== 'all') {
        query += ' AND p.gender = @gender';
        params.push({ name: 'gender', value: gender, type: sql.VarChar });
      }
      
      // Lọc theo danh mục
      if (category_id) {
        query += ' AND p.category_id = @category_id';
        params.push({ name: 'category_id', value: category_id, type: sql.VarChar(50) });
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
      
      // Lọc theo trạng thái đã bán
      if (is_adopted !== undefined) {
        query += ' AND p.is_adopted = @is_adopted';
        params.push({ name: 'is_adopted', value: is_adopted ? 1 : 0, type: sql.Bit });
      }
      
      // Lọc theo trạng thái kích hoạt
      if (is_active !== undefined) {
        query += ' AND p.is_active = @is_active';
        params.push({ name: 'is_active', value: is_active ? 1 : 0, type: sql.Bit });
      }
      
      // Đếm tổng số bản ghi thỏa mãn điều kiện lọc
      const countQuery = query.replace(/SELECT\s+p\.\*,\s+c\.name\s+as\s+category_name/i, 'SELECT COUNT(*) as total');
      const countRequest = pool.request();
      params.forEach(param => {
        countRequest.input(param.name, param.type, param.value);
      });
      const countResult = await countRequest.query(countQuery);
      const totalItems = countResult.recordset[0].total;
      
      // Xử lý sắp xếp kết quả
      if (sortBy === 'id') {
        // Xử lý đặc biệt cho ID dạng chuỗi (PET-XXXX)
        query += ` ORDER BY CAST(SUBSTRING(p.id, 5, LEN(p.id)-4) AS INT) ${sortOrder.toUpperCase()}`;
      } else if (sortBy === 'price') {
        query += ` ORDER BY p.price ${sortOrder.toUpperCase()}`;
      } else if (sortBy === 'name') {
        query += ` ORDER BY p.name ${sortOrder.toUpperCase()}`;
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
      
      // Lấy hình ảnh cho mỗi thú cưng
      const pets = [];
      for (const pet of result.recordset) {
        // Lấy hình ảnh của thú cưng
        const imagesResult = await pool.request()
          .input('pet_id', sql.VarChar(50), pet.id)
          .query(`
            SELECT * 
            FROM pet_images 
            WHERE pet_id = @pet_id 
            ORDER BY is_primary DESC, display_order ASC
          `);
        
        pets.push({
          ...pet,
          images: imagesResult.recordset
        });
      }
      
      return {
        data: pets,
        pagination: {
          total: totalItems,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalItems / limit)
        }
      };
    } catch (error) {
      console.error('Error in petModel.getAll:', error);
      throw error;
    }
  },
  
  // Lấy chi tiết thú cưng theo ID
  getById: async (id) => {
    try {
      const pool = await connectDB();
      
      // Lấy thông tin thú cưng và danh mục
      const result = await pool.request()
        .input('id', sql.VarChar(50), id)
        .query(`
          SELECT 
            p.*,
            c.name as category_name
          FROM 
            pets p
            LEFT JOIN categories c ON p.category_id = c.id
          WHERE 
            p.id = @id
        `);
      
      if (result.recordset.length === 0) {
        return null;
      }
      
      const pet = result.recordset[0];
      
      // Lấy hình ảnh của thú cưng
      const imagesResult = await pool.request()
        .input('pet_id', sql.VarChar(50), id)
        .query(`
          SELECT * 
          FROM pet_images 
          WHERE pet_id = @pet_id 
          ORDER BY is_primary DESC, display_order ASC
        `);
      
      // Kết hợp tất cả dữ liệu
      return {
        ...pet,
        images: imagesResult.recordset
      };
    } catch (error) {
      console.error('Error in petModel.getById:', error);
      throw error;
    }
  },
  
  // Tạo thú cưng mới
  create: async (petData, images = []) => {
    try {
      const pool = await connectDB();
      const transaction = pool.transaction();
      
      try {
        await transaction.begin();
        
        // Tạo ID mới theo định dạng "PET-XXXX"
        const result = await pool.request().query(`
          SELECT MAX(CAST(SUBSTRING(id, 5, LEN(id)-4) AS INT)) as maxNum
          FROM pets
          WHERE id LIKE 'PET-%'
        `);
        
        let nextNum = 1;
        if (result.recordset[0].maxNum !== null) {
          nextNum = result.recordset[0].maxNum + 1;
        }
        
        const newPetId = `PET-${nextNum.toString().padStart(4, '0')}`;
        
        // Thêm thú cưng mới vào database
        const { 
          name, type, breed, age, gender, color, weight, 
          price, description, vaccination, health, origin, 
          stock, is_adopted, is_active, category_id, is_featured // Thêm is_featured vào đây
        } = petData;
        
        await pool.request()
          .input('id', sql.VarChar(50), newPetId)
          .input('name', sql.NVarChar, name)
          .input('type', sql.VarChar(20), type)
          .input('breed', sql.NVarChar(100), breed)
          .input('age', sql.VarChar(50), age)
          .input('gender', sql.VarChar(20), gender)
          .input('color', sql.NVarChar(50), color || null)
          .input('weight', sql.VarChar(50), weight || null)
          .input('price', sql.Decimal(10, 2), parseFloat(price))
          .input('description', sql.NVarChar, description)
          .input('vaccination', sql.NVarChar, vaccination || null)
          .input('health', sql.NVarChar, health || null)
          .input('origin', sql.NVarChar(255), origin || null)
          .input('stock', sql.Int, stock !== undefined ? parseInt(stock) : 1)
          .input('is_adopted', sql.Bit, is_adopted !== undefined ? is_adopted : false)
          .input('is_active', sql.Bit, is_active !== undefined ? is_active : true)
          .input('category_id', sql.VarChar(50), category_id || null)
          .input('is_featured', sql.Bit, is_featured !== undefined ? is_featured : false) // Thêm input parameter
          .query(`
            INSERT INTO pets (
              id, name, type, breed, age, gender, color, weight, 
              price, description, vaccination, health, origin, 
              stock, is_adopted, is_active, category_id, is_featured
            )
            VALUES (
              @id, @name, @type, @breed, @age, @gender, @color, @weight, 
              @price, @description, @vaccination, @health, @origin, 
              @stock, @is_adopted, @is_active, @category_id, @is_featured
            );
          `);
        
        // Lấy thông tin thú cưng sau khi thêm
        const petResult = await pool.request()
          .input('id', sql.VarChar(50), newPetId)
          .query(`SELECT * FROM pets WHERE id = @id`);
        
        const pet = petResult.recordset[0];
        
        // Thêm hình ảnh cho thú cưng
        const savedImages = [];
        if (images && images.length > 0) {
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            // Tạo ID mới cho hình ảnh
            const imageResult = await pool.request().query(`
              SELECT MAX(CAST(SUBSTRING(id, 5, LEN(id)-4) AS INT)) as maxNum
              FROM pet_images
              WHERE id LIKE 'IMG-%'
            `);
            
            let imageNextNum = 1;
            if (imageResult.recordset[0].maxNum !== null) {
              imageNextNum = imageResult.recordset[0].maxNum + 1;
            }
            
            const imageId = `IMG-${imageNextNum.toString().padStart(4, '0')}`;
            
            // Lưu hình ảnh
            await pool.request()
              .input('id', sql.VarChar(50), imageId)
              .input('pet_id', sql.VarChar(50), newPetId)
              .input('image_url', sql.NVarChar, image.image_url)
              .input('is_primary', sql.Bit, image.is_primary === true ? 1 : 0)
              .input('display_order', sql.Int, image.display_order || i)
              .query(`
                INSERT INTO pet_images (id, pet_id, image_url, is_primary, display_order)
                VALUES (@id, @pet_id, @image_url, @is_primary, @display_order);
              `);
            
            // Lấy hình ảnh vừa thêm
            const insertedImage = await pool.request()
              .input('id', sql.VarChar(50), imageId)
              .query(`SELECT * FROM pet_images WHERE id = @id`);
            
            savedImages.push(insertedImage.recordset[0]);
          }
        }
        
        await transaction.commit();
        
        return {
          ...pet,
          images: savedImages
        };
      } catch (err) {
        await transaction.rollback();
        console.error('Transaction rolled back due to error:', err);
        throw err;
      }
    } catch (error) {
      console.error('Error in petModel.create:', error);
      throw error;
    }
  },
  
  // Cập nhật thông tin thú cưng
  update: async (id, petData, images = null) => {
    try {
      const pool = await connectDB();
      const transaction = pool.transaction();
      
      try {
        await transaction.begin();
        
        // Kiểm tra thú cưng tồn tại
        const checkPet = await pool.request()
          .input('id', sql.VarChar(50), id)
          .query('SELECT * FROM pets WHERE id = @id');
        
        if (checkPet.recordset.length === 0) {
          throw new Error('Thú cưng không tồn tại');
        }
        
        // Xây dựng câu lệnh update động
        const updateFields = [];
        const params = [{ name: 'id', value: id, type: sql.VarChar(50) }];
        
        if (petData.name !== undefined) {
          updateFields.push('name = @name');
          params.push({ name: 'name', value: petData.name, type: sql.NVarChar });
        }
        
        if (petData.type !== undefined) {
          updateFields.push('type = @type');
          params.push({ name: 'type', value: petData.type, type: sql.VarChar(20) });
        }
        
        if (petData.breed !== undefined) {
          updateFields.push('breed = @breed');
          params.push({ name: 'breed', value: petData.breed, type: sql.NVarChar(100) });
        }
        
        if (petData.age !== undefined) {
          updateFields.push('age = @age');
          params.push({ name: 'age', value: petData.age, type: sql.VarChar(50) });
        }
        
        if (petData.gender !== undefined) {
          updateFields.push('gender = @gender');
          params.push({ name: 'gender', value: petData.gender, type: sql.VarChar(20) });
        }
        
        if (petData.color !== undefined) {
          updateFields.push('color = @color');
          params.push({ name: 'color', value: petData.color || null, type: sql.NVarChar(50) });
        }
        
        if (petData.weight !== undefined) {
          updateFields.push('weight = @weight');
          params.push({ name: 'weight', value: petData.weight || null, type: sql.VarChar(50) });
        }
        
        if (petData.price !== undefined) {
          updateFields.push('price = @price');
          params.push({ name: 'price', value: parseFloat(petData.price), type: sql.Decimal(10, 2) });
        }
        
        if (petData.description !== undefined) {
          updateFields.push('description = @description');
          params.push({ name: 'description', value: petData.description, type: sql.NVarChar });
        }
        
        if (petData.vaccination !== undefined) {
          updateFields.push('vaccination = @vaccination');
          params.push({ name: 'vaccination', value: petData.vaccination || null, type: sql.NVarChar });
        }
        
        if (petData.health !== undefined) {
          updateFields.push('health = @health');
          params.push({ name: 'health', value: petData.health || null, type: sql.NVarChar });
        }
        
        if (petData.origin !== undefined) {
          updateFields.push('origin = @origin');
          params.push({ name: 'origin', value: petData.origin || null, type: sql.NVarChar(255) });
        }
        
        if (petData.stock !== undefined) {
          updateFields.push('stock = @stock');
          params.push({ name: 'stock', value: parseInt(petData.stock), type: sql.Int });
        }
        
        if (petData.is_adopted !== undefined) {
          updateFields.push('is_adopted = @is_adopted');
          params.push({ name: 'is_adopted', value: petData.is_adopted, type: sql.Bit });
        }
        
        if (petData.is_active !== undefined) {
          updateFields.push('is_active = @is_active');
          params.push({ name: 'is_active', value: petData.is_active, type: sql.Bit });
        }
        
        if (petData.category_id !== undefined) {
          updateFields.push('category_id = @category_id');
          params.push({ name: 'category_id', value: petData.category_id || null, type: sql.VarChar(50) });
        }

        if (petData.is_featured !== undefined) {
          updateFields.push('is_featured = @is_featured');
          // Chuyển đổi rõ ràng thành 1 hoặc 0
          const boolValue = petData.is_featured === true ? 1 : 0;
          params.push({ name: 'is_featured', value: boolValue, type: sql.Bit });
        }
        
        // Cập nhật thú cưng
        let pet = null;
        
        if (updateFields.length > 0) {
          const updateQuery = `
            UPDATE pets 
            SET ${updateFields.join(', ')}, updated_at = GETDATE()
            WHERE id = @id
          `;
          
          const request = pool.request();
          params.forEach(param => {
            request.input(param.name, param.type, param.value);
          });
          
          await request.query(updateQuery);
          
          // Lấy thông tin thú cưng sau khi cập nhật
          const updateResult = await pool.request()
            .input('id', sql.VarChar(50), id)
            .query('SELECT * FROM pets WHERE id = @id');
            
          pet = updateResult.recordset[0];
        } else {
          pet = checkPet.recordset[0];
        }
        
        // Cập nhật hình ảnh nếu có cung cấp
        if (images !== null) {
          // Xóa tất cả hình ảnh cũ
          await pool.request()
            .input('pet_id', sql.VarChar(50), id)
            .query('DELETE FROM pet_images WHERE pet_id = @pet_id');
          
          // Thêm hình ảnh mới
          const savedImages = [];
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            
            // Tạo ID mới cho hình ảnh
            const imageResult = await pool.request().query(`
              SELECT MAX(CAST(SUBSTRING(id, 5, LEN(id)-4) AS INT)) as maxNum
              FROM pet_images
              WHERE id LIKE 'IMG-%'
            `);
            
            let imageNextNum = 1;
            if (imageResult.recordset[0].maxNum !== null) {
              imageNextNum = imageResult.recordset[0].maxNum + 1;
            }
            
            const imageId = `IMG-${imageNextNum.toString().padStart(4, '0')}`;
            
            // Lưu hình ảnh
            await pool.request()
              .input('id', sql.VarChar(50), imageId)
              .input('pet_id', sql.VarChar(50), id)
              .input('image_url', sql.NVarChar, image.image_url)
              .input('is_primary', sql.Bit, image.is_primary === true ? 1 : 0)
              .input('display_order', sql.Int, image.display_order || i)
              .query(`
                INSERT INTO pet_images (id, pet_id, image_url, is_primary, display_order)
                VALUES (@id, @pet_id, @image_url, @is_primary, @display_order);
              `);
              
            // Lấy hình ảnh vừa thêm
            const insertedImage = await pool.request()
              .input('id', sql.VarChar(50), imageId)
              .query(`SELECT * FROM pet_images WHERE id = @id`);
              
            savedImages.push(insertedImage.recordset[0]);
          }
          
          pet.images = savedImages;
        }
        
        await transaction.commit();
        
        // Lấy thông tin chi tiết thú cưng sau khi cập nhật
        return await petModel.getById(id);
      } catch (err) {
        await transaction.rollback();
        console.error('Transaction rolled back due to error:', err);
        throw err;
      }
    } catch (error) {
      console.error('Error in petModel.update:', error);
      throw error;
    }
  },
  
  // Xóa thú cưng
  delete: async (id) => {
    try {
      const pool = await connectDB();
      const transaction = pool.transaction();
      
      try {
        await transaction.begin();
        
        // Lấy thông tin thú cưng trước khi xóa
        const petResult = await pool.request()
          .input('id', sql.VarChar(50), id)
          .query('SELECT * FROM pets WHERE id = @id');
          
        if (petResult.recordset.length === 0) {
          await transaction.rollback();
          return null;
        }
        
        const pet = petResult.recordset[0];
        
        // Lấy hình ảnh của thú cưng
        const imagesResult = await pool.request()
          .input('pet_id', sql.VarChar(50), id)
          .query('SELECT * FROM pet_images WHERE pet_id = @pet_id');
          
        // Xóa hình ảnh của thú cưng (không cần xóa riêng, ON DELETE CASCADE sẽ tự xóa)
        
        // Xóa thú cưng
        await pool.request()
          .input('id', sql.VarChar(50), id)
          .query('DELETE FROM pets WHERE id = @id');
          
        await transaction.commit();
        
        // Thêm dữ liệu hình ảnh vào đối tượng thú cưng để trả về
        pet.images = imagesResult.recordset;
        
        return pet;
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch (error) {
      console.error('Error in petModel.delete:', error);
      throw error;
    }
  },

  // Kiểm tra xem thú cưng có đang được sử dụng trong đơn hàng không
  checkPetInUse: async (id) => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('id', sql.VarChar(50), id)
        .query(`
          SELECT COUNT(*) as count 
          FROM order_items 
          WHERE pet_id = @id
        `);
        
      return result.recordset[0].count > 0;
    } catch (error) {
      console.error('Error in petModel.checkPetInUse:', error);
      throw error;
    }
  },

  // Lấy danh sách thú cưng nổi bật
  getFeatured: async (options = {}) => {
    try {
      const { 
        type = '', 
        limit = 4
      } = options;
      
      const pool = await connectDB();
      let query = `
        SELECT 
          p.*,
          c.name as category_name
        FROM 
          pets p
          LEFT JOIN categories c ON p.category_id = c.id
        WHERE 
          p.is_featured = 1 
          AND p.is_active = 1
      `;
      
      const params = [];
      
      // Lọc theo loại thú cưng nếu có
      if (type && type !== 'all') {
        query += ' AND p.type = @type';
        params.push({ name: 'type', value: type, type: sql.VarChar });
      }
      
      // Sắp xếp theo ID (để có thứ tự nhất quán) và giới hạn số lượng kết quả
      query += ` ORDER BY CAST(SUBSTRING(p.id, 5, LEN(p.id)-4) AS INT) DESC 
                OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY`;
      
      params.push({ name: 'limit', value: parseInt(limit), type: sql.Int });
      
      // Thực hiện truy vấn
      const request = pool.request();
      params.forEach(param => {
        request.input(param.name, param.type, param.value);
      });
      
      const result = await request.query(query);
      
      // Lấy hình ảnh cho mỗi thú cưng
      const featuredPets = [];
      for (const pet of result.recordset) {
        // Lấy hình ảnh của thú cưng
        const imagesResult = await pool.request()
          .input('pet_id', sql.VarChar(50), pet.id)
          .query(`
            SELECT * 
            FROM pet_images 
            WHERE pet_id = @pet_id 
            ORDER BY is_primary DESC, display_order ASC
          `);
        
        featuredPets.push({
          ...pet,
          images: imagesResult.recordset
        });
      }
      
      return featuredPets;
    } catch (error) {
      console.error('Error in petModel.getFeatured:', error);
      throw error;
    }
  }
};

module.exports = petModel;