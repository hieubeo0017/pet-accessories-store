const { connectDB, sql } = require('../config/database');

const SpaTimeSlotModel = {
  // Cập nhật phương thức getAllTimeSlots để hỗ trợ phân trang và lọc
  getAllTimeSlots: async (filters = {}) => {
    try {
      // Xử lý tham số phân trang
      const page = filters.page ? parseInt(filters.page) : 1;
      const limit = filters.limit ? parseInt(filters.limit) : 10;
      const offset = (page - 1) * limit;
      
      // Xây dựng câu truy vấn với các điều kiện lọc
      let whereConditions = ['1=1']; // Always true condition to start
      
      // Chuẩn bị request
      const pool = await connectDB();
      const request = pool.request();
      
      // Lọc theo trạng thái hoạt động
      if (filters.is_active !== undefined) {
        whereConditions.push('is_active = @is_active');
        request.input('is_active', sql.Bit, filters.is_active === 'true' || filters.is_active === true ? 1 : 0);
      }
      
      // Lọc theo khoảng thời gian
      if (filters.time_from) {
        whereConditions.push('time_slot >= @time_from');
        // Chuyển đổi chuỗi thời gian thành định dạng SQL Server chấp nhận được
        try {
          // Đảm bảo định dạng hh:mm:ss
          let timeFrom = filters.time_from;
          if (!timeFrom.includes(':')) {
            timeFrom += ':00:00';
          } else if (timeFrom.split(':').length === 2) {
            timeFrom += ':00';
          }
          request.input('time_from', sql.VarChar(8), timeFrom);
        } catch (error) {
          console.error('Error formatting time_from:', error);
          throw new Error('Định dạng thời gian không hợp lệ cho time_from');
        }
      }
      
      if (filters.time_to) {
        whereConditions.push('time_slot <= @time_to');
        try {
          // Đảm bảo định dạng hh:mm:ss
          let timeTo = filters.time_to;
          if (!timeTo.includes(':')) {
            timeTo += ':00:00';
          } else if (timeTo.split(':').length === 2) {
            timeTo += ':00';
          }
          request.input('time_to', sql.VarChar(8), timeTo);
        } catch (error) {
          console.error('Error formatting time_to:', error);
          throw new Error('Định dạng thời gian không hợp lệ cho time_to');
        }
      }
      
      // Xử lý tìm kiếm
      if (filters.search) {
        // Kiểm tra xem có phải định dạng thời gian không (HH:MM hoặc H:MM)
        const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
        if (timeRegex.test(filters.search)) {
          // Người dùng đang tìm kiếm theo định dạng thời gian
          // Đảm bảo định dạng HH:MM:SS cho SQL
          let searchTime = filters.search;
          if (searchTime.split(':').length === 2) {
            searchTime = `${searchTime}:00`;
          }
          
          // Tìm kiếm chính xác theo time_slot
          whereConditions.push('CONVERT(VARCHAR(5), time_slot, 108) LIKE @time_search');
          request.input('time_search', sql.NVarChar, `%${filters.search}%`);
        } else {
          // Tìm kiếm thông thường
          whereConditions.push('id LIKE @search');
          request.input('search', sql.NVarChar, `%${filters.search}%`);
        }
      }
      
      // Sắp xếp
      const sortBy = filters.sort_by || 'time_slot';
      const sortOrder = (filters.sort_order || 'asc').toUpperCase();
      
      // Câu truy vấn đếm tổng số bản ghi
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM spa_time_slots 
        WHERE ${whereConditions.join(' AND ')}
      `;
      
      // Câu truy vấn lấy dữ liệu có phân trang - Thay đổi cách phân trang
      const query = `
        SELECT 
          id,
          CONVERT(VARCHAR(5), time_slot, 108) as time_slot_formatted,
          time_slot,
          max_capacity,
          is_active,
          created_at,
          updated_at
        FROM spa_time_slots 
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY 
          ${sortBy === 'time_slot' ? 'CAST(time_slot AS TIME)' : sortBy} ${sortOrder}
        OFFSET @offset ROWS 
        FETCH NEXT @limit ROWS ONLY
      `;
      
      // Thêm tham số offset và limit
      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, limit);
      
      // Thực thi cả hai truy vấn
      const countResult = await request.query(countQuery);
      const dataResult = await request.query(query);
      
      // Tính toán thông tin phân trang
      const total = countResult.recordset[0].total;
      const totalPages = Math.ceil(total / limit);
      
      return {
        data: dataResult.recordset,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error in getAllTimeSlots:', error);
      throw error;
    }
  },
  
  // Lấy khung giờ theo ID
  getTimeSlotById: async (id) => {
    try {
      const pool = await connectDB();
      const query = `
        SELECT * FROM spa_time_slots 
        WHERE id = @id
      `;
      const result = await pool.request()
        .input('id', sql.VarChar(50), id)
        .query(query);
      return result;
    } catch (error) {
      console.error('Error in getTimeSlotById:', error);
      throw error;
    }
  },
  
  // Tạo khung giờ mới
  createTimeSlot: async (timeSlotData) => {
    try {
      const pool = await connectDB();
      
      const idResult = await pool.request().query(`
        SELECT MAX(CAST(SUBSTRING(id, 5, LEN(id)-4) AS INT)) as maxNum
        FROM spa_time_slots
        WHERE id LIKE 'STS-%'
      `);
      
      let nextNum = 1;
      if (idResult.recordset[0].maxNum !== null) {
        nextNum = idResult.recordset[0].maxNum + 1;
      }
      
      const id = `STS-${nextNum.toString().padStart(4, '0')}`;
      
      const query = `
        INSERT INTO spa_time_slots (
          id, time_slot, max_capacity, is_active
        )
        VALUES (
          @id, @time_slot, @max_capacity, @is_active
        )
        SELECT * FROM spa_time_slots WHERE id = @id
      `;
      
      // Sửa dòng này - Thay đổi từ sql.Time sang sql.VarChar
      return await pool.request()
        .input('id', sql.VarChar(50), id)
        .input('time_slot', sql.VarChar(8), timeSlotData.time_slot)
        .input('max_capacity', sql.Int, timeSlotData.max_capacity)
        .input('is_active', sql.Bit, timeSlotData.is_active !== undefined ? timeSlotData.is_active : true)
        .query(query);
    } catch (error) {
      console.error('Error in createTimeSlot:', error);
      throw error;
    }
  },
  
  // Cập nhật khung giờ
  updateTimeSlot: async (id, timeSlotData) => {
    try {
      const pool = await connectDB();
      const query = `
        UPDATE spa_time_slots
        SET
          time_slot = @time_slot,
          max_capacity = @max_capacity,
          is_active = @is_active,
          updated_at = GETDATE()
        WHERE id = @id
        SELECT * FROM spa_time_slots WHERE id = @id
      `;
      
      // Sửa dòng này - Thay đổi từ sql.Time sang sql.VarChar
      return await pool.request()
        .input('id', sql.VarChar(50), id)
        .input('time_slot', sql.VarChar(8), timeSlotData.time_slot)
        .input('max_capacity', sql.Int, timeSlotData.max_capacity)
        .input('is_active', sql.Bit, timeSlotData.is_active)
        .query(query);
    } catch (error) {
      console.error('Error in updateTimeSlot:', error);
      throw error;
    }
  },
  
  // Xóa khung giờ
  deleteTimeSlot: async (id) => {
    try {
      const pool = await connectDB();
      const query = `
        DELETE FROM spa_time_slots
        WHERE id = @id
      `;
      
      return await pool.request()
        .input('id', sql.VarChar(50), id)
        .query(query);
    } catch (error) {
      console.error('Error in deleteTimeSlot:', error);
      throw error;
    }
  },
  
  // Cập nhật phương thức checkAvailability
  checkAvailability: async (date) => {
    try {
      const pool = await connectDB();
      
      // Truy vấn lấy tất cả các khung giờ đang hoạt động
      const query = `
        SELECT 
          ts.id,
          ts.time_slot,
          ts.max_capacity,
          ISNULL((
            SELECT COUNT(*) 
            FROM spa_appointments 
            WHERE appointment_date = @date 
            AND CAST(appointment_time AS TIME) = ts.time_slot
            AND status NOT IN ('cancelled')
          ), 0) AS booked_slots,
          (ts.max_capacity - ISNULL((
            SELECT COUNT(*) 
            FROM spa_appointments 
            WHERE appointment_date = @date 
            AND CAST(appointment_time AS TIME) = ts.time_slot
            AND status NOT IN ('cancelled')
          ), 0)) AS available_slots
        FROM spa_time_slots ts
        WHERE ts.is_active = 1
        ORDER BY ts.time_slot
      `;
      
      const result = await pool.request()
        .input('date', sql.Date, date)
        .query(query);
      
      // Log để kiểm tra kết quả SQL trước khi trả về
      console.log('Kết quả truy vấn khả dụng:', JSON.stringify(result.recordset, null, 2));
      
      return result;
    } catch (error) {
      console.error('Error in checkAvailability:', error);
      throw error;
    }
  },
};

module.exports = SpaTimeSlotModel;