const { connectDB, sql } = require('../config/database');

const spaAppointmentModel = {
  // Lấy tất cả lịch hẹn với bộ lọc và phân trang
  getAll: async (options = {}) => {
    try {
      const { 
        search = '', 
        page = 1, 
        limit = 10, 
        status,
        payment_status,
        from_date,
        to_date,
        sortBy = 'appointment_date', 
        sortOrder = 'desc' 
      } = options;
      
      const pool = await connectDB();
      let query = `
        SELECT 
          a.*,
          COUNT(*) OVER() as total_count
        FROM 
          spa_appointments a
        WHERE 1=1
      `;
      
      const params = [];
      let paramIndex = 1;
      
      // Lọc theo từ khóa tìm kiếm
      if (search) {
        query += ` AND (a.full_name LIKE @p${paramIndex} OR a.phone_number LIKE @p${paramIndex} OR a.email LIKE @p${paramIndex} OR a.pet_name LIKE @p${paramIndex})`;
        params.push({ name: `p${paramIndex++}`, value: `%${search}%` });
      }

      // Tìm kiếm chính xác theo ID nếu có
      if (options.id) {
        query += ` AND a.id = @p${paramIndex}`;
        params.push({ name: `p${paramIndex++}`, value: options.id });
      }

      // Tìm kiếm chính xác theo số điện thoại nếu có
      if (options.phone_number) {
        query += ` AND a.phone_number = @p${paramIndex}`;
        params.push({ name: `p${paramIndex++}`, value: options.phone_number });
      }

      // Tìm kiếm chính xác theo email nếu có
      if (options.email) {
        query += ` AND a.email = @p${paramIndex}`;
        params.push({ name: `p${paramIndex++}`, value: options.email });
      }
      
      // Lọc theo trạng thái
      if (status) {
        query += ` AND a.status = @p${paramIndex}`;
        params.push({ name: `p${paramIndex++}`, value: status });
      }
      
      // Lọc theo trạng thái thanh toán
      if (payment_status) {
        query += ` AND a.payment_status = @p${paramIndex}`;
        params.push({ name: `p${paramIndex++}`, value: payment_status });
      }
      
      // Lọc theo khoảng thời gian
      if (from_date) {
        // Đảm bảo sử dụng CAST thay vì CONVERT để xử lý ngày nhất quán hơn
        query += ` AND CAST(a.appointment_date AS DATE) >= CAST(@p${paramIndex} AS DATE)`;
        params.push({ name: `p${paramIndex++}`, value: from_date });
      }
      
      if (to_date) {
        query += ` AND CAST(a.appointment_date AS DATE) <= CAST(@p${paramIndex} AS DATE)`;
        params.push({ name: `p${paramIndex++}`, value: to_date });
      }
      
      // Sắp xếp
      query += ` ORDER BY a.${sortBy} ${sortOrder}`;
      
      // Phân trang
      const offset = (page - 1) * limit;
      query += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

      
      
      // Thực hiện truy vấn
      const request = pool.request();
      params.forEach(param => {
        request.input(param.name, param.value);
      });
      
      const result = await request.query(query);
      
      // Lấy services cho mỗi lịch hẹn
      const appointments = [];
      for (const appointment of result.recordset) {
        // Lấy dịch vụ của lịch hẹn
        const servicesResult = await pool.request()
          .input('appointment_id', sql.VarChar(50), appointment.id)
          .query(`
            SELECT 
              s.*,
              ss.name as service_name,
              ss.duration
            FROM 
              spa_appointment_services s
              JOIN spa_services ss ON s.service_id = ss.id
            WHERE 
              s.appointment_id = @appointment_id
          `);
        
        appointments.push({
          ...appointment,
          services: servicesResult.recordset
        });
      }
      
      // Tính tổng số lịch hẹn để phân trang
      const totalItems = result.recordset.length > 0 ? result.recordset[0].total_count : 0;
      
      return {
        data: appointments,
        pagination: {
          total: totalItems,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalItems / limit)
        }
      };
    } catch (error) {
    //   console.error('Error in spaAppointmentModel.getAll:', error);
      throw error;
    }
  },
  
  // Lấy chi tiết lịch hẹn theo ID
  getById: async (id) => {
    try {
      const pool = await connectDB();
      
      // Lấy thông tin lịch hẹn
      const result = await pool.request()
        .input('id', sql.VarChar(50), id)
        .query(`
          SELECT * 
          FROM spa_appointments 
          WHERE id = @id
        `);
      
      if (result.recordset.length === 0) {
        return null;
      }
      
      const appointment = result.recordset[0];
      
      // Lấy dịch vụ của lịch hẹn
      const servicesResult = await pool.request()
        .input('appointment_id', sql.VarChar(50), id)
        .query(`
          SELECT 
            s.*,
            ss.name as service_name,
            ss.duration
          FROM 
            spa_appointment_services s
            JOIN spa_services ss ON s.service_id = ss.id
          WHERE 
            s.appointment_id = @appointment_id
        `);
      
      appointment.services = servicesResult.recordset;
      
      return appointment;
    } catch (error) {
    //   console.error('Error in spaAppointmentModel.getById:', error);
      throw error;
    }
  },
  
  // Tạo lịch hẹn mới
  create: async (appointmentData, services) => {
    try {
      const pool = await connectDB();
      const transaction = new sql.Transaction(pool);
      
      try {
        await transaction.begin();
        
        // Tạo ID mới theo định dạng "APT-XXXX"
        const idResult = await new sql.Request(transaction).query(`
          SELECT MAX(CAST(SUBSTRING(id, 5, LEN(id)-4) AS INT)) as maxNum
          FROM spa_appointments
          WHERE id LIKE 'APT-%'
        `);
        
        let nextNum = 1;
        if (idResult.recordset[0].maxNum !== null) {
          nextNum = idResult.recordset[0].maxNum + 1;
        }
        
        const appointmentId = `APT-${nextNum.toString().padStart(4, '0')}`;
        
        // Lưu trực tiếp chuỗi thời gian, không chuyển đổi qua Date object
        const timeString = appointmentData.appointment_time;
        // console.log(`Tạo lịch hẹn - Giờ được chọn: ${timeString}`);
        
        // Thêm lịch hẹn
        await new sql.Request(transaction)
          .input('id', appointmentId)
          .input('user_id', sql.VarChar(50), null) // Luôn đặt thành NULL vì không yêu cầu đăng nhập
          .input('pet_name', appointmentData.pet_name)
          .input('pet_type', appointmentData.pet_type)
          .input('pet_breed', appointmentData.pet_breed || null)
          .input('pet_size', appointmentData.pet_size)
          .input('pet_notes', appointmentData.pet_notes || null)
          .input('appointment_date', sql.Date, appointmentData.appointment_date)
          .input('appointment_time', sql.VarChar(8), timeString)
          .input('status', appointmentData.status || 'pending')
          .input('full_name', appointmentData.full_name)
          .input('phone_number', appointmentData.phone_number)
          .input('email', appointmentData.email || null)
          .input('total_amount', sql.Decimal(10, 2), appointmentData.total_amount)
          .input('payment_status', appointmentData.payment_status || 'pending')
          .input('payment_method', sql.VarChar(20), appointmentData.payment_method || null)  // Thêm dòng này
          .query(`
            INSERT INTO spa_appointments (
              id, user_id, pet_name, pet_type, pet_breed, pet_size, pet_notes,
              appointment_date, appointment_time, status, full_name, phone_number,
              email, total_amount, payment_status, payment_method  -- Thêm payment_method vào đây
            )
            VALUES (
              @id, @user_id, @pet_name, @pet_type, @pet_breed, @pet_size, @pet_notes,
              @appointment_date, @appointment_time, @status, @full_name, @phone_number,
              @email, @total_amount, @payment_status, @payment_method  -- Thêm @payment_method vào đây
            );
          `);
        
        // Thêm dịch vụ cho lịch hẹn
        for (let i = 0; i < services.length; i++) {
          const service = services[i];
          
          // Tạo ID mới cho mỗi dịch vụ
          const serviceIdResult = await new sql.Request(transaction).query(`
            SELECT MAX(CAST(SUBSTRING(id, 4, LEN(id)-3) AS INT)) as maxNum
            FROM spa_appointment_services
            WHERE id LIKE 'AS-%'
          `);
          
          let serviceNextNum = 1;
          if (serviceIdResult.recordset[0].maxNum !== null) {
            serviceNextNum = serviceIdResult.recordset[0].maxNum + 1;
          }
          
          const serviceId = `AS-${serviceNextNum.toString().padStart(4, '0')}`;
          
          // Thêm dịch vụ
          await new sql.Request(transaction)
            .input('id', serviceId)
            .input('appointment_id', appointmentId)
            .input('service_id', service.service_id)
            .input('price', sql.Decimal(10, 2), service.price)
            .query(`
              INSERT INTO spa_appointment_services (id, appointment_id, service_id, price)
              VALUES (@id, @appointment_id, @service_id, @price);
            `);
        }
        
        await transaction.commit();
        
        // Lấy thông tin lịch hẹn vừa tạo
        return await spaAppointmentModel.getById(appointmentId);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
    //   console.error('Error in spaAppointmentModel.create:', error);
      throw error;
    }
  },
  
  // Cập nhật trạng thái lịch hẹn
  updateStatus: async (id, status) => {
    try {
      const pool = await connectDB();
      
      // Kiểm tra lịch hẹn tồn tại
      const checkResult = await pool.request()
        .input('id', sql.VarChar(50), id)
        .query(`SELECT * FROM spa_appointments WHERE id = @id`);
      
      if (checkResult.recordset.length === 0) {
        throw new Error('Lịch hẹn không tồn tại');
      }
      
      // Cập nhật trạng thái
      await pool.request()
        .input('id', sql.VarChar(50), id)
        .input('status', sql.VarChar(20), status)
        .query(`
          UPDATE spa_appointments 
          SET status = @status, updated_at = GETDATE()
          WHERE id = @id
        `);
      
      // Lấy thông tin lịch hẹn sau khi cập nhật
      return await spaAppointmentModel.getById(id);
    } catch (error) {
    //   console.error('Error in spaAppointmentModel.updateStatus:', error);
      throw error;
    }
  },
  
  // Cập nhật trạng thái thanh toán
  updatePaymentStatus: async (id, paymentStatus) => {
    try {
      console.log(`Cập nhật trạng thái thanh toán cho lịch hẹn ${id} thành ${paymentStatus}`);
      const pool = await connectDB();
      
      // Kiểm tra lịch hẹn tồn tại
      const checkResult = await pool.request()
        .input('id', sql.VarChar(50), id)
        .query(`SELECT * FROM spa_appointments WHERE id = @id`);
      
      if (checkResult.recordset.length === 0) {
        throw new Error('Lịch hẹn không tồn tại');
      }
      
      // Cập nhật trạng thái thanh toán
      const updateResult = await pool.request()
        .input('id', sql.VarChar(50), id)
        .input('paymentStatus', sql.VarChar(20), paymentStatus)
        .query(`
          UPDATE spa_appointments 
          SET payment_status = @paymentStatus, updated_at = GETDATE()
          WHERE id = @id
        `);
        
      console.log(`Kết quả cập nhật:`, updateResult);
      
      // Lấy thông tin lịch hẹn sau khi cập nhật
      return await spaAppointmentModel.getById(id);
    } catch (error) {
      console.error('Error in spaAppointmentModel.updatePaymentStatus:', error);
      throw error;
    }
  },

  // Cập nhật phương thức thanh toán
  updatePaymentMethod: async (id, paymentMethod) => {
    try {
      console.log(`Cập nhật phương thức thanh toán cho lịch hẹn ${id} thành ${paymentMethod}`);
      const pool = await connectDB();
      
      // Cập nhật phương thức thanh toán
      await pool.request()
        .input('id', sql.VarChar(50), id)
        .input('payment_method', sql.VarChar(20), paymentMethod)
        .query(`
          UPDATE spa_appointments
          SET payment_method = @payment_method,
              updated_at = GETDATE()
          WHERE id = @id
        `);
      
      // Lấy thông tin lịch hẹn sau khi cập nhật
      return await spaAppointmentModel.getById(id);
    } catch (error) {
      console.error('Error in spaAppointmentModel.updatePaymentMethod:', error);
      throw error;
    }
  },

  // Cập nhật thông tin lịch hẹn
  update: async (id, appointmentData, services = null) => {
    try {
      const pool = await connectDB();
      const transaction = new sql.Transaction(pool);

      try {
        await transaction.begin();

        // Kiểm tra lịch hẹn tồn tại
        const checkResult = await new sql.Request(transaction)
          .input('id', sql.VarChar(50), id)
          .query(`SELECT * FROM spa_appointments WHERE id = @id`);

        if (checkResult.recordset.length === 0) {
          throw new Error('Lịch hẹn không tồn tại');
        }

        const currentAppointment = checkResult.recordset[0];

        // Chuẩn bị dữ liệu để cập nhật
        let updateFields = [];
        const updateRequest = new sql.Request(transaction);
        updateRequest.input('id', sql.VarChar(50), id);

        // Cập nhật thông tin khách hàng nếu có
        if (appointmentData.full_name) {
          updateFields.push('full_name = @full_name');
          updateRequest.input('full_name', appointmentData.full_name);
        }

        if (appointmentData.phone_number) {
          updateFields.push('phone_number = @phone_number');
          updateRequest.input('phone_number', appointmentData.phone_number);
        }

        if (appointmentData.email !== undefined) {
          updateFields.push('email = @email');
          updateRequest.input('email', appointmentData.email || null);
        }

        // Cập nhật thông tin thú cưng nếu có
        if (appointmentData.pet_name) {
          updateFields.push('pet_name = @pet_name');
          updateRequest.input('pet_name', appointmentData.pet_name);
        }

        if (appointmentData.pet_type) {
          updateFields.push('pet_type = @pet_type');
          updateRequest.input('pet_type', appointmentData.pet_type);
        }

        if (appointmentData.pet_breed !== undefined) {
          updateFields.push('pet_breed = @pet_breed');
          updateRequest.input('pet_breed', appointmentData.pet_breed || null);
        }

        if (appointmentData.pet_size) {
          updateFields.push('pet_size = @pet_size');
          updateRequest.input('pet_size', appointmentData.pet_size);
        }

        if (appointmentData.pet_notes !== undefined) {
          updateFields.push('pet_notes = @pet_notes');
          updateRequest.input('pet_notes', appointmentData.pet_notes || null);
        }

        // Cập nhật thời gian lịch hẹn nếu có
        if (appointmentData.appointment_date) {
          updateFields.push('appointment_date = @appointment_date');
          updateRequest.input('appointment_date', sql.Date, appointmentData.appointment_date);
        }

        if (appointmentData.appointment_time) {
          // Lưu trực tiếp chuỗi thời gian, không qua đối tượng Date
          updateFields.push('appointment_time = @appointment_time');
          
          // Sử dụng VARCHAR thay vì SQL Time để tránh chuyển đổi múi giờ
          updateRequest.input('appointment_time', sql.VarChar(8), appointmentData.appointment_time);
          
        //   console.log(`Lưu giờ hẹn: ${appointmentData.appointment_time}`);
        }

        // Cập nhật trạng thái nếu có
        if (appointmentData.status) {
          updateFields.push('status = @status');
          updateRequest.input('status', appointmentData.status);
        }

        if (appointmentData.payment_status) {
          updateFields.push('payment_status = @payment_status');
          updateRequest.input('payment_status', appointmentData.payment_status);
        }

        // Cập nhật phương thức thanh toán nếu có
        if (appointmentData.payment_method) {
          updateFields.push('payment_method = @payment_method');
          updateRequest.input('payment_method', sql.VarChar(20), appointmentData.payment_method);
        }

        // Cập nhật tổng tiền nếu có
        if (appointmentData.total_amount) {
          updateFields.push('total_amount = @total_amount');
          updateRequest.input('total_amount', sql.Decimal(10, 2), appointmentData.total_amount);
        }

        // Luôn cập nhật trường updated_at
        updateFields.push('updated_at = GETDATE()');

        // Thực hiện cập nhật nếu có trường cần cập nhật
        if (updateFields.length > 0) {
          await updateRequest.query(`
            UPDATE spa_appointments 
            SET ${updateFields.join(', ')}
            WHERE id = @id
          `);
        }

        // Cập nhật dịch vụ nếu có
        if (services && services.length > 0) {
          // Xóa các dịch vụ cũ
          await new sql.Request(transaction)
            .input('appointment_id', sql.VarChar(50), id)
            .query(`DELETE FROM spa_appointment_services WHERE appointment_id = @appointment_id`);

          // Thêm dịch vụ mới
          for (let i = 0; i < services.length; i++) {
            const service = services[i];

            // Tạo ID mới cho mỗi dịch vụ
            const serviceIdResult = await new sql.Request(transaction).query(`
              SELECT MAX(CAST(SUBSTRING(id, 4, LEN(id)-3) AS INT)) as maxNum
              FROM spa_appointment_services
              WHERE id LIKE 'AS-%'
            `);

            let serviceNextNum = 1;
            if (serviceIdResult.recordset[0].maxNum !== null) {
              serviceNextNum = serviceIdResult.recordset[0].maxNum + 1;
            }

            const serviceId = `AS-${serviceNextNum.toString().padStart(4, '0')}`;

            // Thêm dịch vụ
            await new sql.Request(transaction)
              .input('id', serviceId)
              .input('appointment_id', id)
              .input('service_id', service.service_id)
              .input('price', sql.Decimal(10, 2), service.price)
              .query(`
                INSERT INTO spa_appointment_services (id, appointment_id, service_id, price)
                VALUES (@id, @appointment_id, @service_id, @price);
              `);
          }
        }

        await transaction.commit();

        // Lấy thông tin lịch hẹn sau khi cập nhật
        return await spaAppointmentModel.getById(id);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
    //   console.error('Error in spaAppointmentModel.update:', error);
      throw error;
    }
  },

  // Xóa lịch hẹn theo ID
  delete: async (id) => {
    try {
      const pool = await connectDB();
      const transaction = new sql.Transaction(pool);

      try {
        await transaction.begin();
        
        // Kiểm tra lịch hẹn tồn tại
        const checkResult = await new sql.Request(transaction)
          .input('id', sql.VarChar(50), id)
          .query(`SELECT * FROM spa_appointments WHERE id = @id`);
        
        if (checkResult.recordset.length === 0) {
          throw new Error('Lịch hẹn không tồn tại');
        }

        // Lưu thông tin lịch hẹn trước khi xóa để trả về
        const appointmentToDelete = checkResult.recordset[0];
        
        // Xóa các dịch vụ liên quan trước (để duy trì tính toàn vẹn tham chiếu)
        await new sql.Request(transaction)
          .input('appointment_id', sql.VarChar(50), id)
          .query(`DELETE FROM spa_appointment_services WHERE appointment_id = @appointment_id`);
        
        // Xóa lịch hẹn
        await new sql.Request(transaction)
          .input('id', sql.VarChar(50), id)
          .query(`DELETE FROM spa_appointments WHERE id = @id`);
        
        await transaction.commit();
        
        return {
          success: true,
          message: `Đã xóa lịch hẹn có ID ${id} thành công`,
          data: appointmentToDelete
        };
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error in spaAppointmentModel.delete:', error);
      throw error;
    }
  },

  // Kiểm tra tính khả dụng của khung giờ cụ thể
  checkAvailability: async (date, time) => {
    try {
      const pool = await connectDB();
      const timeCheck = time.includes(':00') ? time : `${time}:00`;
      
      // Truy vấn số chỗ tối đa của khung giờ đó từ bảng spa_time_slots
      const timeSlotResult = await pool.request()
        .input('time', sql.Time, timeCheck)
        .query(`
          SELECT max_capacity
          FROM spa_time_slots
          WHERE time_slot = @time AND is_active = 1
        `);

      // Nếu không tìm thấy khung giờ hoặc không hoạt động
      if (timeSlotResult.recordset.length === 0) {
        return { available: false, message: 'Khung giờ không tồn tại hoặc không hoạt động' };
      }

      const maxCapacity = timeSlotResult.recordset[0].max_capacity;

      // Truy vấn số lượng đặt chỗ hiện tại
      const bookingResult = await pool.request()
        .input('date', sql.Date, date)
        .input('time', sql.Time, timeCheck)
        .query(`
          SELECT COUNT(*) as count
          FROM spa_appointments
          WHERE appointment_date = @date 
          AND appointment_time = @time
          AND status IN ('pending', 'confirmed')
        `);
          
      const currentBookings = bookingResult.recordset[0].count;
      
      // Kiểm tra xem còn chỗ không
      return { 
        available: currentBookings < maxCapacity,
        maxCapacity: maxCapacity,
        currentBookings: currentBookings,
        remainingSlots: maxCapacity - currentBookings
      };
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      throw error;
    }
  },
};

module.exports = spaAppointmentModel;