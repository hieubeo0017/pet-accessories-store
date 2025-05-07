const { sql, connectDB } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Lấy danh sách dịch vụ spa với các tùy chọn lọc và phân trang
 * @param {Object} options - Các tùy chọn lọc và phân trang
 * @returns {Object} - Dữ liệu và thông tin phân trang
 */
const getAllSpaServices = async (options = {}) => {
  try {
    const pool = await connectDB();
    const {
      page = 1,
      limit = 10,
      search = '',
      pet_type = '',
      pet_size = '',
      is_active = null,
      is_featured = null,
      sort_by = 'id',
      sort_order = 'DESC'
    } = options;

    const offset = (page - 1) * limit;

    // Xây dựng câu truy vấn với các điều kiện lọc
    let query = `
      SELECT s.*, 
             (SELECT COUNT(*) FROM spa_services 
              WHERE 1=1
    `;
    
    const conditions = [];
    const params = [];
    let paramIndex = 1;
    
    if (search) {
      conditions.push(`name LIKE @p${paramIndex}`);
      params.push({ name: `p${paramIndex++}`, value: `%${search}%` });
    }
    
    // Khi có cả pet_type và pet_size
    if (pet_type && pet_size) {
      conditions.push(`(
        (pet_type = @petType OR pet_type = 'all') AND 
        (pet_size = @petSize OR pet_size = 'all')
      )`);
      params.push({ name: 'petType', value: pet_type });
      params.push({ name: 'petSize', value: pet_size });
    } else {
      // Xử lý riêng từng trường hợp như trước
      if (pet_type) {
        conditions.push(`(pet_type = @p${paramIndex} OR pet_type = 'all')`);
        params.push({ name: `p${paramIndex++}`, value: pet_type });
      }
      
      if (pet_size) {
        conditions.push(`(pet_size = @p${paramIndex} OR pet_size = 'all')`);
        params.push({ name: `p${paramIndex++}`, value: pet_size });
      }
    }
    
    if (is_active !== null) {
      conditions.push(`is_active = @p${paramIndex}`);
      params.push({ name: `p${paramIndex++}`, value: is_active });
    }
    
    if (is_featured !== null) {
      conditions.push(`is_featured = @p${paramIndex}`);
      params.push({ name: `p${paramIndex++}`, value: is_featured });
    }
    
    // Thêm điều kiện vào câu truy vấn COUNT
    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }
    
    query += `) as total_count
      FROM spa_services s
      WHERE 1=1
    `;

    // Thêm điều kiện vào truy vấn chính
    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }
    
    // Sắp xếp giống như trong petModel
    if (sort_by === 'id') {
      // Xử lý đa dạng các định dạng ID
      query += ` ORDER BY CASE 
          WHEN s.id LIKE 'SPA-%' THEN CAST(SUBSTRING(s.id, 5, LEN(s.id)-4) AS INT) 
          WHEN s.id LIKE 'SVC%' THEN CAST(SUBSTRING(s.id, 4, LEN(s.id)-3) AS INT)
          WHEN s.id LIKE 'SV%' THEN CAST(SUBSTRING(s.id, 3, LEN(s.id)-2) AS INT)
          ELSE s.id
        END ${sort_order}`;
    } else if (sort_by === 'price') {
      query += ` ORDER BY s.price ${sort_order}`;
    } else if (sort_by === 'name') {
      query += ` ORDER BY s.name ${sort_order}`;
    } else {
      query += ` ORDER BY s.${sort_by} ${sort_order}`;
    }
    
    // Phân trang
    query += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

    const request = pool.request();
    
    // Thêm các tham số vào request
    params.forEach(param => {
      request.input(param.name, param.value);
    });
    
    const result = await request.query(query);
    
    // Tính tổng số trang
    const totalCount = result.recordset.length > 0 ? result.recordset[0].total_count : 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    // Lấy hình ảnh cho từng dịch vụ
    for (const service of result.recordset) {
      const imagesResult = await pool.request()
        .input('serviceId', service.id)
        .query(`
          SELECT id, image_url, is_primary, display_order 
          FROM spa_service_images
          WHERE service_id = @serviceId
          ORDER BY is_primary DESC, display_order ASC
        `);
      
      service.images = imagesResult.recordset;
      service.total_count = undefined; // Loại bỏ trường total_count khỏi item
    }
    
    return {
      data: result.recordset,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages
      }
    };
  } catch (error) {
    console.error('Error fetching spa services:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết dịch vụ spa theo ID
 * @param {string} id - ID của dịch vụ spa
 * @returns {Object} - Thông tin chi tiết dịch vụ spa
 */
const getSpaServiceById = async (id) => {
  try {
    const pool = await connectDB();
    
    // Truy vấn thông tin dịch vụ spa
    const serviceResult = await pool.request()
      .input('id', id)
      .query(`
        SELECT * FROM spa_services
        WHERE id = @id
      `);
    
    if (serviceResult.recordset.length === 0) {
      return null;
    }
    
    const service = serviceResult.recordset[0];
    
    // Truy vấn hình ảnh của dịch vụ
    const imagesResult = await pool.request()
      .input('serviceId', id)
      .query(`
        SELECT id, image_url, is_primary, display_order 
        FROM spa_service_images
        WHERE service_id = @serviceId
        ORDER BY is_primary DESC, display_order ASC
      `);
    
    // Thêm mảng hình ảnh vào đối tượng dịch vụ
    service.images = imagesResult.recordset;
    
    return service;
  } catch (error) {
    console.error(`Error fetching spa service with id ${id}:`, error);
    throw error;
  }
};

/**
 * Tạo dịch vụ spa mới
 * @param {Object} serviceData - Dữ liệu dịch vụ spa mới
 * @returns {Object} - Dịch vụ spa đã được tạo
 */
const createSpaService = async (serviceData) => {
  const transaction = new sql.Transaction(await connectDB());
  
  try {
    await transaction.begin();
    
    const { name, description, price, duration, pet_type, pet_size, is_active, is_featured, images } = serviceData;
    
    // Tạo ID mới theo định dạng "SPA-XXXX"
    const idResult = await new sql.Request(transaction).query(`
      SELECT MAX(CAST(SUBSTRING(id, 5, LEN(id)-4) AS INT)) as maxNum
      FROM spa_services
      WHERE id LIKE 'SPA-%'
    `);
    
    let nextNum = 1;
    if (idResult.recordset[0].maxNum !== null) {
      nextNum = idResult.recordset[0].maxNum + 1;
    }
    
    const serviceId = `SPA-${nextNum.toString().padStart(4, '0')}`;
    
    // Thêm dịch vụ vào CSDL
    const insertServiceResult = await new sql.Request(transaction)
      .input('id', serviceId)
      .input('name', name)
      .input('description', description)
      .input('price', sql.Decimal(10, 2), parseFloat(price))
      .input('duration', sql.Int, parseInt(duration))
      .input('pet_type', pet_type)
      .input('pet_size', pet_size)
      .input('is_active', sql.Bit, Boolean(is_active))
      .input('is_featured', sql.Bit, Boolean(is_featured))
      .query(`
        INSERT INTO spa_services (id, name, description, price, duration, pet_type, 
                                pet_size, is_active, is_featured)
        VALUES (@id, @name, @description, @price, @duration, @pet_type, 
               @pet_size, @is_active, @is_featured);
      `);
    
    // Xử lý hình ảnh nếu có
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        // Tạo ID mới cho hình ảnh với định dạng IMG-XXXX
        const imageResult = await new sql.Request(transaction).query(`
          SELECT MAX(CAST(SUBSTRING(id, 5, LEN(id)-4) AS INT)) as maxNum
          FROM spa_service_images
          WHERE id LIKE 'IMG-%'
        `);
        
        let imageNextNum = 1;
        if (imageResult.recordset[0].maxNum !== null) {
          imageNextNum = imageResult.recordset[0].maxNum + 1;
        }
        
        const imageId = `IMG-${imageNextNum.toString().padStart(4, '0')}`;
        const isPrimary = images[i].is_primary ? 1 : 0;
        
        await new sql.Request(transaction)
          .input('id', imageId)
          .input('serviceId', serviceId)
          .input('imageUrl', images[i].image_url)
          .input('isPrimary', sql.Bit, isPrimary)
          .input('displayOrder', sql.Int, i)
          .query(`
            INSERT INTO spa_service_images (id, service_id, image_url, is_primary, display_order)
            VALUES (@id, @serviceId, @imageUrl, @isPrimary, @displayOrder)
          `);
      }
    }
    
    await transaction.commit();
    
    // Truy vấn lại dịch vụ với hình ảnh để trả về
    return await getSpaServiceById(serviceId);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating spa service:', error);
    throw error;
  }
};

/**
 * Cập nhật dịch vụ spa
 * @param {string} id - ID của dịch vụ spa cần cập nhật
 * @param {Object} serviceData - Dữ liệu cập nhật
 * @returns {Object} - Dịch vụ spa sau khi cập nhật
 */
const updateSpaService = async (id, serviceData) => {
  const transaction = new sql.Transaction(await connectDB());
  
  try {
    await transaction.begin();
    
    // Kiểm tra dịch vụ tồn tại
    const checkResult = await new sql.Request(transaction)
      .input('id', id)
      .query('SELECT id FROM spa_services WHERE id = @id');
    
    if (checkResult.recordset.length === 0) {
      throw new Error(`Không tìm thấy dịch vụ spa có ID ${id}`);
    }
    
    const { name, description, price, duration, pet_type, pet_size, is_active, is_featured, images } = serviceData;
    
    // Cập nhật thông tin dịch vụ
    await new sql.Request(transaction)
      .input('id', id)
      .input('name', name)
      .input('description', description)
      .input('price', sql.Decimal(10, 2), parseFloat(price))
      .input('duration', sql.Int, parseInt(duration))
      .input('pet_type', pet_type)
      .input('pet_size', pet_size)
      .input('is_active', sql.Bit, Boolean(is_active))
      .input('is_featured', sql.Bit, Boolean(is_featured))
      .query(`
        UPDATE spa_services
        SET name = @name,
            description = @description,
            price = @price,
            duration = @duration,
            pet_type = @pet_type,
            pet_size = @pet_size,
            is_active = @is_active,
            is_featured = @is_featured,
            updated_at = GETDATE()
        WHERE id = @id
      `);
    
    // Xử lý hình ảnh nếu có cập nhật
    if (images) {
      // Xóa tất cả hình ảnh cũ
      await new sql.Request(transaction)
        .input('serviceId', id)
        .query('DELETE FROM spa_service_images WHERE service_id = @serviceId');
      
      // Thêm hình ảnh mới
      for (let i = 0; i < images.length; i++) {
        const imageId = `IMG${Date.now().toString().slice(-6)}-${i}`;
        const isPrimary = images[i].is_primary ? 1 : 0;
        
        await new sql.Request(transaction)
          .input('id', imageId)
          .input('serviceId', id)
          .input('imageUrl', images[i].image_url)
          .input('isPrimary', sql.Bit, isPrimary)
          .input('displayOrder', sql.Int, i)
          .query(`
            INSERT INTO spa_service_images (id, service_id, image_url, is_primary, display_order)
            VALUES (@id, @serviceId, @imageUrl, @isPrimary, @displayOrder)
          `);
      }
    }
    
    await transaction.commit();
    
    // Truy vấn lại dịch vụ với hình ảnh để trả về
    return await getSpaServiceById(id);
  } catch (error) {
    await transaction.rollback();
    console.error(`Error updating spa service with id ${id}:`, error);
    throw error;
  }
};

/**
 * Xóa dịch vụ spa
 * @param {string} id - ID của dịch vụ spa cần xóa
 * @returns {Object} - Kết quả xóa
 */
const deleteSpaService = async (id) => {
  const transaction = new sql.Transaction(await connectDB());
  
  try {
    await transaction.begin();
    
    // Kiểm tra dịch vụ tồn tại
    const checkResult = await new sql.Request(transaction)
      .input('id', id)
      .query('SELECT id FROM spa_services WHERE id = @id');
    
    if (checkResult.recordset.length === 0) {
      throw new Error(`Không tìm thấy dịch vụ spa có ID ${id}`);
    }
    
    // THÊM MỚI: Kiểm tra xem dịch vụ có đang được sử dụng trong lịch hẹn không
    // Cần thêm bảng spa_appointment_services trong cơ sở dữ liệu
    const inUseCheckResult = await new sql.Request(transaction)
      .input('serviceId', id)
      .query(`
        SELECT COUNT(*) as count 
        FROM spa_appointment_services 
        WHERE service_id = @serviceId
      `);
    
    const isInUse = inUseCheckResult.recordset[0].count > 0;
    
    if (isInUse) {
      // Nếu đang được sử dụng, chỉ đánh dấu không hoạt động thay vì xóa
      await new sql.Request(transaction)
        .input('id', id)
        .query(`
          UPDATE spa_services 
          SET is_active = 0, updated_at = GETDATE() 
          WHERE id = @id
        `);
      
      await transaction.commit();
      
      return { 
        success: true, 
        message: `Dịch vụ spa ID ${id} đang được sử dụng trong lịch hẹn, đã chuyển sang trạng thái không hoạt động`,
        inUse: true
      };
    }
    
    // Nếu không được sử dụng, xóa hình ảnh và dịch vụ
    // Xóa hình ảnh liên quan
    await new sql.Request(transaction)
      .input('serviceId', id)
      .query('DELETE FROM spa_service_images WHERE service_id = @serviceId');
    
    // Xóa dịch vụ
    await new sql.Request(transaction)
      .input('id', id)
      .query('DELETE FROM spa_services WHERE id = @id');
    
    await transaction.commit();
    
    return { 
      success: true, 
      message: `Đã xóa dịch vụ spa có ID ${id} hoàn toàn`,
      inUse: false
    };
  } catch (error) {
    await transaction.rollback();
    console.error(`Error deleting spa service with id ${id}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách dịch vụ spa nổi bật
 * @param {number} limit - Số lượng dịch vụ muốn lấy
 * @returns {Array} - Danh sách dịch vụ nổi bật
 */
const getFeaturedSpaServices = async (limit = 5) => {
  try {
    const pool = await connectDB();
    
    const result = await pool.request()
      .input('limit', sql.Int, parseInt(limit))
      .query(`
        SELECT TOP (@limit) s.* 
        FROM spa_services s
        WHERE s.is_active = 1 AND s.is_featured = 1
        ORDER BY s.id DESC
      `);
    
    // Lấy hình ảnh chính cho từng dịch vụ
    const services = result.recordset;
    
    for (const service of services) {
      const imagesResult = await pool.request()
        .input('serviceId', service.id)
        .query(`
          SELECT TOP 1 image_url 
          FROM spa_service_images
          WHERE service_id = @serviceId AND is_primary = 1
          ORDER BY display_order ASC
        `);
      
      service.image_url = imagesResult.recordset.length > 0 
        ? imagesResult.recordset[0].image_url 
        : null;
    }
    
    return services;
  } catch (error) {
    console.error('Error fetching featured spa services:', error);
    throw error;
  }
};

/**
 * Lấy danh sách dịch vụ theo ID lịch hẹn
 * @param {string} appointmentId - ID của lịch hẹn
 * @returns {Array} - Danh sách dịch vụ liên kết với lịch hẹn
 */
const getServicesByAppointmentId = async (appointmentId) => {
  try {
    const pool = await connectDB();
    
    // Truy vấn lấy dịch vụ liên kết với lịch hẹn
    const result = await pool.request()
      .input('appointment_id', sql.VarChar(50), appointmentId)
      .query(`
        SELECT 
          s.*,
          ss.name,
          ss.description,
          ss.duration,
          ss.pet_type,
          ss.pet_size
        FROM 
          spa_appointment_services s
          JOIN spa_services ss ON s.service_id = ss.id
        WHERE 
          s.appointment_id = @appointment_id
      `);
    
    // Định dạng dịch vụ phù hợp với email template
    return result.recordset.map(service => ({
      name: service.name || 'Dịch vụ spa',
      price: service.price
    }));
  } catch (error) {
    console.error('Lỗi khi lấy dịch vụ theo ID lịch hẹn:', error);
    return []; // Trả về mảng rỗng trong trường hợp lỗi
  }
};

/**
 * Lấy danh sách dịch vụ liên quan
 * @param {Object} options - Các tùy chọn để lấy dịch vụ liên quan
 * @returns {Array} - Danh sách dịch vụ liên quan
 */
const getRelatedServices = async (options) => {
  try {
    const { currentId, petType, petSize, limit = 4 } = options;
    
    const pool = await connectDB();
    
    // Lấy các dịch vụ liên quan dựa trên loại thú cưng và kích thước
    const result = await pool.request()
      .input('currentId', sql.VarChar, currentId)
      .input('petType', sql.VarChar, petType)
      .input('petSize', sql.VarChar, petSize)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT TOP (@limit)
          id, name, description, price, duration,
          pet_type, pet_size, is_active, is_featured
        FROM spa_services
        WHERE is_active = 1
          AND id != @currentId
          AND (
            (pet_type = @petType OR pet_type = 'all')
            OR
            (pet_size = @petSize OR pet_size = 'all')
          )
        ORDER BY 
          CASE WHEN pet_type = @petType THEN 1 ELSE 2 END,
          CASE WHEN is_featured = 1 THEN 1 ELSE 2 END,
          price DESC
      `);
    
    // Lấy hình ảnh cho từng dịch vụ
    const services = result.recordset;
    for (const service of services) {
      // Lấy hình ảnh chính cho dịch vụ
      const imagesResult = await pool.request()
        .input('serviceId', service.id)
        .query(`
          SELECT TOP 1 image_url 
          FROM spa_service_images
          WHERE service_id = @serviceId
          ORDER BY is_primary DESC, display_order ASC
        `);
      
      service.image_url = imagesResult.recordset.length > 0 
        ? imagesResult.recordset[0].image_url 
        : null;
    }
    
    return services;
  } catch (error) {
    console.error('Error getting related spa services:', error);
    throw error;
  }
};

module.exports = {
  getAllSpaServices,
  getSpaServiceById,
  createSpaService,
  updateSpaService,
  deleteSpaService,
  getFeaturedSpaServices,
  getServicesByAppointmentId,
  getRelatedServices
};