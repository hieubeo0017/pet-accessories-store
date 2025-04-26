const spaAppointmentModel = require('../models/spaAppointmentModel');
const { connectDB, sql } = require('../config/database');
const emailController = require('../controllers/emailController');
const spaServiceModel = require('../models/spaServiceModel');

// Kiểm tra định dạng ngày hợp lệ
function isValidDateFormat(dateString) {
  if (!dateString) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

// Thêm các hàm định dạng
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Thay thế toàn bộ hàm formatTime
const formatTime = (timeString) => {
  if (!timeString) return '';
  
  // Nếu timeString là đối tượng Date
  if (timeString instanceof Date) {
    // Sử dụng getUTCHours thay vì getHours để giữ nguyên giờ UTC
    return `${timeString.getUTCHours().toString().padStart(2, '0')}:${timeString.getUTCMinutes().toString().padStart(2, '0')}`;
  }
  
  // Nếu timeString là đối tượng SQL Server Time
  if (typeof timeString === 'object') {
    try {
      // Chuyển đổi đối tượng SQL Time thành chuỗi
      return timeString.toString().substring(0, 5);
    } catch (error) {
      console.error('Error formatting time object:', error);
      return '';
    }
  }
  
  // Đảm bảo timeString là chuỗi
  const timeStr = String(timeString);
  
  // XỬ LÝ TRƯỜNG HỢP CHUỖI ISO CÓ Z (UTC)
  if (timeStr.includes('Z') && timeStr.includes('T')) {
    // Trích xuất trực tiếp giờ phút từ chuỗi ISO mà không tạo Date object
    const timePart = timeStr.split('T')[1].split('.')[0];
    return timePart.split(':').slice(0, 2).join(':');
  }
  
  // Xử lý định dạng ISO (có T)
  if (timeStr.includes('T')) {
    const timePart = timeStr.split('T')[1].split('.')[0];
    return timePart.split(':').slice(0, 2).join(':');
  }
  
  // Xử lý định dạng HH:MM:SS
  if (timeStr.includes(':')) {
    return timeStr.split(':').slice(0, 2).join(':');
  }
  
  return timeStr;
};

function formatAppointmentTime(timeValue) {
  if (!timeValue) return '';
  
  // Xử lý khi timeValue là đối tượng Date
  try {
    const timeObj = new Date(timeValue);
    if (!isNaN(timeObj.getTime())) {
      // Sử dụng UTC để tránh ảnh hưởng múi giờ - giống như trong spaTimeSlotController
      const hours = timeObj.getUTCHours().toString().padStart(2, '0');
      const minutes = timeObj.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  } catch (err) {
    // Bỏ qua lỗi và tiếp tục các phương pháp khác
  }
  
  // Nếu là SQL Server Time object
  if (typeof timeValue === 'object' && timeValue !== null) {
    try {
      const timeStr = timeValue.toString();
      // Lấy phần HH:MM từ chuỗi thời gian
      if (timeStr.includes(':')) {
        return timeStr.split(':').slice(0, 2).join(':');
      }
      return timeStr.substring(0, 5); // Lấy 5 ký tự đầu nếu không có dấu :
    } catch (err) {
      console.error('Error formatting SQL Time:', err);
    }
  }
  
  // Xử lý chuỗi ISO có T
  if (typeof timeValue === 'string') {
    if (timeValue.includes('T')) {
      return timeValue.split('T')[1].substring(0, 5);
    }
    // Chuỗi có định dạng HH:MM:SS
    if (timeValue.includes(':')) {
      return timeValue.split(':').slice(0, 2).join(':');
    }
  }
  
  // Trường hợp cuối cùng, cố gắng chuyển đổi thành chuỗi
  try {
    const timeStr = String(timeValue);
    if (timeStr.length >= 5) {
      return timeStr.substring(0, 5);
    }
    return timeStr;
  } catch (e) {
    console.error('Final error formatting time:', e);
    return '00:00'; // Giá trị mặc định nếu tất cả phương pháp trên đều thất bại
  }
}

const spaAppointmentController = {
  // Lấy tất cả lịch hẹn
  getAllAppointments: async (req, res) => {
    try {
      const { search, page, limit, status, payment_status, from_date, to_date, sort_by, sort_order } = req.query;
      
      const result = await spaAppointmentModel.getAll({
        search,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
        payment_status,
        from_date,
        to_date,
        sortBy: sort_by || 'appointment_date',
        sortOrder: sort_order || 'desc'
      });
      
      res.json({
        message: 'Lấy danh sách lịch hẹn thành công',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error getting spa appointments:', error);
      res.status(500).json({ message: 'Lỗi khi lấy danh sách lịch hẹn', error: error.message });
    }
  },
  
  // Lấy chi tiết lịch hẹn theo ID
  getAppointmentById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const appointment = await spaAppointmentModel.getById(id);
      
      if (!appointment) {
        return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
      }
      
      res.json({
        message: 'Lấy thông tin lịch hẹn thành công',
        data: appointment
      });
    } catch (error) {
      console.error('Error getting spa appointment by ID:', error);
      res.status(500).json({ message: 'Lỗi khi lấy thông tin lịch hẹn', error: error.message });
    }
  },
  
  // Tạo lịch hẹn mới
  createAppointment: async (req, res) => {
    try {
      const { appointmentData, services } = req.body;
      
      // Validate dữ liệu đầu vào
      if (!appointmentData.pet_name || !appointmentData.pet_type || 
          !appointmentData.appointment_date || !appointmentData.appointment_time ||
          !appointmentData.full_name || !appointmentData.phone_number ||
          !services || services.length === 0) {
        return res.status(400).json({ 
          message: 'Thiếu thông tin bắt buộc',
          required: ['pet_name', 'pet_type', 'appointment_date', 'appointment_time', 
                    'full_name', 'phone_number', 'services']
        });
      }
      
      // Tạo lịch hẹn
      const newAppointment = await spaAppointmentModel.create(appointmentData, services);
      
      // Sau khi tạo lịch hẹn thành công, gửi email xác nhận
      if (appointmentData.email) {
        try {
          // Lấy thông tin chi tiết về dịch vụ đã đặt
          const serviceDetails = await Promise.all(
            services.map(async (service) => {
              try {
                // Truy vấn trực tiếp database thay vì gọi spaServiceModel.getById
                const pool = await connectDB();
                const result = await pool.request()
                  .input('id', sql.VarChar(50), service.service_id)
                  .query(`
                    SELECT name, description, price, duration, pet_type, pet_size 
                    FROM spa_services 
                    WHERE id = @id
                  `);
                  
                if (result.recordset.length > 0) {
                  // Trả về đúng cấu trúc với tên dịch vụ
                  return {
                    name: result.recordset[0].name,
                    price: service.price
                  };
                } else {
                  // Fallback nếu không tìm thấy
                  return {
                    name: `Dịch vụ spa`,
                    price: service.price
                  };
                }
              } catch (e) {
                console.error('Error fetching service details:', e);
                
                // Fallback tốt hơn, không hiển thị ID
                return {
                  name: "Dịch vụ spa",
                  price: service.price
                };
              }
            })
          );

          // Tạo nội dung email
          const emailSubject = `Xác nhận đặt lịch spa thú cưng - ${newAppointment.id}`;
          const emailContent = generateBookingConfirmationEmail(
            newAppointment, 
            serviceDetails, 
            appointmentData.full_name
          );
          
          // Gửi email
          await emailController.sendBookingConfirmationEmail(
            appointmentData.email,
            emailSubject,
            emailContent
          );
          
          console.log('Đã gửi email xác nhận đến:', appointmentData.email);
        } catch (emailError) {
          console.error('Lỗi khi gửi email xác nhận:', emailError);
          // Không trả về lỗi này vì lịch hẹn vẫn đã được tạo thành công
        }
      }
      
      res.status(201).json({
        message: 'Tạo lịch hẹn thành công',
        data: newAppointment
      });
    } catch (error) {
      console.error('Error creating spa appointment:', error);
      res.status(500).json({ message: 'Lỗi khi tạo lịch hẹn', error: error.message });
    }
  },
  
  // Cập nhật trạng thái lịch hẹn
  updateAppointmentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Validate status
      if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ 
          message: 'Trạng thái không hợp lệ',
          validStatuses: ['pending', 'confirmed', 'completed', 'cancelled'] 
        });
      }
      
      const updatedAppointment = await spaAppointmentModel.updateStatus(id, status);
      
      res.json({
        message: 'Cập nhật trạng thái lịch hẹn thành công',
        data: updatedAppointment
      });
    } catch (error) {
      console.error('Error updating spa appointment status:', error);
      res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái lịch hẹn', error: error.message });
    }
  },
  
  // Cập nhật trạng thái thanh toán
  updatePaymentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { payment_status } = req.body;
      
      // Validate payment_status
      if (!payment_status || !['pending', 'paid'].includes(payment_status)) {
        return res.status(400).json({ 
          message: 'Trạng thái thanh toán không hợp lệ',
          validStatuses: ['pending', 'paid'] 
        });
      }
      
      const updatedAppointment = await spaAppointmentModel.updatePaymentStatus(id, payment_status);
      
      res.json({
        message: 'Cập nhật trạng thái thanh toán thành công',
        data: updatedAppointment
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái thanh toán', error: error.message });
    }
  },

  // Thay thế toàn bộ phương thức checkAvailability
  checkAvailability: async (req, res) => {
    try {
      const { date } = req.query;
      if (!date) {
        return res.status(400).json({ 
          success: false,
          message: 'Vui lòng cung cấp ngày cần kiểm tra' 
        });
      }

      const pool = await connectDB();
      
      // Truy vấn lấy tất cả các khung giờ hoạt động từ bảng spa_time_slots
      // và kết hợp với truy vấn đếm số lượng đặt chỗ từ bảng spa_appointments
      const result = await pool.request()
        .input('date', sql.Date, date)
        .query(`
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
        `);

      // Chuyển đổi kết quả truy vấn thành đối tượng JSON với key là định dạng giờ HH:MM
      const availability = {};
      result.recordset.forEach(slot => {
        // Định dạng giờ từ SQL Server Time thành HH:MM
        const timeObj = new Date(slot.time_slot);
        const hours = timeObj.getUTCHours().toString().padStart(2, '0');
        const minutes = timeObj.getUTCMinutes().toString().padStart(2, '0');
        const formattedTime = `${hours}:${minutes}`;
        
        availability[formattedTime] = {
          id: slot.id,
          total: slot.max_capacity,
          booked: slot.booked_slots,
          available: slot.available_slots
        };
      });

      return res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      console.error('Error checking availability:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi kiểm tra khả dụng khung giờ',
        error: error.message 
      });
    }
  },

  // Cập nhật thông tin lịch hẹn
  updateAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const { appointmentData, services } = req.body;
      
      // Validate dữ liệu đầu vào
      if (!appointmentData || Object.keys(appointmentData).length === 0) {
        return res.status(400).json({ 
          message: 'Không có thông tin cần cập nhật'
        });
      }
      
      // Kiểm tra trạng thái lịch hẹn nếu cập nhật trạng thái
      if (appointmentData.status && !['pending', 'confirmed', 'completed', 'cancelled'].includes(appointmentData.status)) {
        return res.status(400).json({ 
          message: 'Trạng thái không hợp lệ',
          validStatuses: ['pending', 'confirmed', 'completed', 'cancelled'] 
        });
      }
      
      // Kiểm tra trạng thái thanh toán nếu cập nhật trạng thái thanh toán
      if (appointmentData.payment_status && !['pending', 'paid'].includes(appointmentData.payment_status)) {
        return res.status(400).json({ 
          message: 'Trạng thái thanh toán không hợp lệ',
          validStatuses: ['pending', 'paid'] 
        });
      }
      
      // Nếu cập nhật thời gian, kiểm tra định dạng
      if (appointmentData.appointment_time) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        if (!timeRegex.test(appointmentData.appointment_time)) {
          return res.status(400).json({
            message: 'Định dạng thời gian không hợp lệ. Vui lòng sử dụng định dạng HH:MM hoặc HH:MM:SS'
          });
        }
      }
      
      // Nếu cập nhật ngày, kiểm tra định dạng
      if (appointmentData.appointment_date && !isValidDateFormat(appointmentData.appointment_date)) {
        return res.status(400).json({
          message: 'Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD'
        });
      }
      
      // Kiểm tra và xử lý dịch vụ nếu có
      if (services) {
        if (!Array.isArray(services) || services.length === 0) {
          return res.status(400).json({
            message: 'Danh sách dịch vụ không hợp lệ'
          });
        }
        
        for (const service of services) {
          if (!service.service_id || !service.price) {
            return res.status(400).json({
              message: 'Thông tin dịch vụ không hợp lệ, cần service_id và price'
            });
          }
        }
      }
      
      // Thực hiện cập nhật
      const updatedAppointment = await spaAppointmentModel.update(id, appointmentData, services);
      
      res.json({
        message: 'Cập nhật lịch hẹn thành công',
        data: updatedAppointment
      });
    } catch (error) {
      console.error('Error updating spa appointment:', error);
      res.status(500).json({ message: 'Lỗi khi cập nhật lịch hẹn', error: error.message });
    }
  },

  // Đổi lịch hẹn
  rescheduleAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const { appointment_date, appointment_time } = req.body;
      
      // Validate dữ liệu đầu vào
      if (!appointment_date || !appointment_time) {
        return res.status(400).json({ 
          message: 'Thiếu thông tin bắt buộc',
          required: ['appointment_date', 'appointment_time']
        });
      }
      
      // Kiểm tra định dạng ngày giờ
      if (!isValidDateFormat(appointment_date)) {
        return res.status(400).json({
          message: 'Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD'
        });
      }
      
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
      
      if (!timeRegex.test(appointment_time)) {
        return res.status(400).json({
          message: 'Định dạng thời gian không hợp lệ. Vui lòng sử dụng định dạng HH:MM hoặc HH:MM:SS'
        });
      }
      
      // Chuẩn hóa định dạng giờ để đảm bảo nhất quán
      const formattedTime = appointment_time.split(':').slice(0, 2).join(':');
      
      // Thực hiện đổi lịch hẹn (chỉ cập nhật ngày và giờ)
      const updatedAppointment = await spaAppointmentModel.update(id, {
        appointment_date,
        appointment_time: formattedTime,
        status: 'confirmed' // Tự động xác nhận lịch khi đổi lịch
      });
      
      // Định dạng dữ liệu trước khi trả về
      const cleanedAppointment = {
        ...updatedAppointment,
        appointment_date: formatAppointmentDate(updatedAppointment.appointment_date),
        appointment_time: formatAppointmentTime(updatedAppointment.appointment_time)
      };

      // Thêm hàm helper vào ngay bên trên res.json
      function formatAppointmentDate(dateValue) {
        if (!dateValue) return '';
        
        // Nếu là chuỗi có chứa T (định dạng ISO)
        if (typeof dateValue === 'string' && dateValue.includes('T')) {
          return dateValue.split('T')[0];
        }
        
        // Nếu là Date object
        if (dateValue instanceof Date) {
          return dateValue.toISOString().split('T')[0];
        }
        
        // Trường hợp khác, chuyển đổi sang chuỗi và thử trích xuất ngày
        try {
          const dateString = String(dateValue);
          // Kiểm tra xem chuỗi có phải là định dạng ISO không
          if (dateString.includes('T')) {
            return dateString.split('T')[0];
          }
          return dateString;
        } catch (err) {
          console.error('Error formatting appointment date:', err);
          return String(dateValue); // Trả về dưới dạng chuỗi để tránh lỗi
        }
      }

      res.json({
        success: true,
        message: 'Đổi lịch hẹn thành công',
        data: cleanedAppointment
      });
    } catch (error) {
      console.error('Error rescheduling spa appointment:', error);
      res.status(500).json({ 
        success: false,
        message: 'Lỗi khi đổi lịch hẹn', 
        error: error.message 
      });
    }
  },

  // Xóa lịch hẹn
  deleteAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: 'Thiếu ID lịch hẹn' });
      }
      
      // Thực hiện xóa lịch hẹn
      const result = await spaAppointmentModel.delete(id);
      
      res.json({
        message: 'Xóa lịch hẹn thành công',
        data: result.data
      });
    } catch (error) {
      console.error('Error deleting spa appointment:', error);
      
      if (error.message === 'Lịch hẹn không tồn tại') {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ 
        message: 'Lỗi khi xóa lịch hẹn', 
        error: error.message 
      });
    }
  },

  // Khôi phục lịch hẹn đã hủy
  restoreAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Kiểm tra lịch hẹn tồn tại và có trạng thái là cancelled
      const appointment = await spaAppointmentModel.getById(id);
      
      if (!appointment) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy lịch hẹn' 
        });
      }
      
      if (appointment.status !== 'cancelled') {
        return res.status(400).json({ 
          success: false, 
          message: 'Chỉ có thể khôi phục lịch hẹn đã hủy' 
        });
      }
      
      // Kiểm tra xem thời gian lịch hẹn đã qua chưa
      const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
      const now = new Date();
      
      if (appointmentDate < now) {
        return res.status(400).json({
          success: false,
          message: 'Không thể khôi phục lịch hẹn đã quá thời gian đặt'
        });
      }
      
      // Kiểm tra slot còn trống không
      const date = appointment.appointment_date.toISOString().split('T')[0];
      let time;

      // Kiểm tra và xử lý appointment_time an toàn
      if (typeof appointment.appointment_time === 'object' && appointment.appointment_time !== null) {
        // Convert object Time từ SQL Server thành chuỗi và lấy phần HH:MM
        time = appointment.appointment_time.toString().substring(0, 5);
      } else if (typeof appointment.appointment_time === 'string') {
        // Nếu đã là chuỗi, lấy 5 ký tự đầu (HH:MM)
        time = appointment.appointment_time.substring(0, 5);
      } else {
        // Trường hợp khác, chuyển đổi thành chuỗi
        time = String(appointment.appointment_time).substring(0, 5);
      }
      
      const availabilityCheck = await spaAppointmentModel.checkAvailability(date, time);
      if (!availabilityCheck.available) {
        return res.status(400).json({
          success: false,
          message: 'Không thể khôi phục do khung giờ này đã đầy'
        });
      }
      
      // Khôi phục về trạng thái pending
      const result = await spaAppointmentModel.updateStatus(id, 'pending');
      
      res.json({
        success: true,
        message: 'Khôi phục lịch hẹn thành công',
        data: result
      });
      
    } catch (error) {
      console.error('Error restoring appointment:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi khôi phục lịch hẹn', 
        error: error.message 
      });
    }
  },

  // Tìm kiếm lịch hẹn dựa trên số điện thoại, email hoặc mã lịch hẹn
  searchAppointments: async (req, res) => {
    try {
      const { type, value } = req.query;
      
      if (!type || !value) {
        return res.status(400).json({ 
          success: false, 
          message: 'Vui lòng cung cấp loại và giá trị tìm kiếm' 
        });
      }

      let searchField;
      switch(type) {
        case 'phone':
          searchField = 'phone_number';
          break;
        case 'email':
          searchField = 'email';
          break;
        case 'bookingId':
          searchField = 'id';
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Loại tìm kiếm không hợp lệ'
          });
      }

      // Tạo options cho model
      const searchOptions = {
        page: 1,
        limit: 20
      };
      
      // Thêm điều kiện tìm kiếm theo trường
      searchOptions[searchField] = value;
      
      const result = await spaAppointmentModel.getAll(searchOptions);
      
      // Kiểm tra kết quả
      if (!result || !result.data || result.data.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }
      
      // Xử lý định dạng ngày và giờ cho mỗi lịch hẹn
      const appointments = result.data.map(appointment => ({
        ...appointment,
        formatted_date: formatDate(appointment.appointment_date),
        formatted_time: formatTime(appointment.appointment_time)
      }));

      return res.json({
        success: true,
        data: appointments
      });
      
    } catch (error) {
      console.error('Error in searchAppointments:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi tìm kiếm lịch hẹn',
        error: error.message
      });
    }
  }
};

// Hàm tạo nội dung email xác nhận đặt lịch
function generateBookingConfirmationEmail(appointment, services, customerName) {
  // Định dạng ngày tháng
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  // Format giờ - xử lý đúng múi giờ
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // console.log('formatTime input:', timeString, typeof timeString);
    
    // Xử lý trường hợp timeString là đối tượng Date
    if (timeString instanceof Date) {
      // Sử dụng getUTCHours thay vì getHours để giữ nguyên giờ
      return `${timeString.getUTCHours().toString().padStart(2, '0')}:${timeString.getUTCMinutes().toString().padStart(2, '0')}`;
    }
    
    // Xử lý trường hợp timeString là đối tượng SQL Server Time
    if (typeof timeString === 'object' && timeString !== null) {
      try {
        const timeStr = timeString.toString();
        if (timeStr.includes(':')) {
          return timeStr.split(':').slice(0, 2).join(':');
        }
        return timeStr;
      } catch (e) {
        console.error('Error converting time object:', e);
      }
    }
    
    // Đảm bảo timeString là chuỗi
    const timeStr = String(timeString);
    
    // XỬ LÝ TRƯỜNG HỢP CHUỖI ISO CÓ Z (UTC)
    if (timeStr.endsWith('Z') && timeStr.includes('T')) {
      // Trích xuất trực tiếp giờ phút từ chuỗi mà không chuyển đổi múi giờ
      const timePart = timeStr.split('T')[1].replace('Z', '');
      return timePart.split(':').slice(0, 2).join(':');
    }
    
    // Kiểm tra xem giờ có phải là định dạng ISO date đầy đủ không
    if (timeStr.includes('T')) {
      const timePart = timeStr.split('T')[1].split('.')[0];
      const [hour, minute] = timePart.split(':');
      return `${hour}:${minute}`;
    }
    
    // Xử lý định dạng HH:MM:SS (loại bỏ seconds)
    if (timeStr.includes(':')) {
      return timeStr.split(':').slice(0, 2).join(':');
    }
    
    return timeStr;
  };
  
  // Tạo nội dung HTML cho email
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <div style="text-align: center; padding: 20px 0; background-color: #4CAF50; color: white; border-radius: 5px 5px 0 0;">
        <h1 style="margin: 0;">Đặt lịch thành công!</h1>
        <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi</p>
      </div>
      
      <div style="padding: 20px 0;">
        <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Chi tiết đặt lịch</h2>
        
        <p><strong>Mã đặt lịch:</strong> ${appointment.id}</p>
        <p><strong>Khách hàng:</strong> ${customerName}</p>
        <p><strong>Ngày hẹn:</strong> ${formatDate(appointment.appointment_date)}</p>
        <p><strong>Giờ hẹn:</strong> ${formatTime(appointment.appointment_time)}</p>
        <p><strong>Thú cưng:</strong> ${appointment.pet_name} (${appointment.pet_type === 'dog' ? 'Chó' : 'Mèo'})</p>
        
        <h3 style="color: #333; margin-top: 20px;">Dịch vụ đã chọn</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f9f9f9;">
            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Dịch vụ</th>
            <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Giá</th>
          </tr>
          ${services.map(service => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${service.name}</td>
              <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">${parseInt(service.price).toLocaleString('vi-VN')}đ</td>
            </tr>
          `).join('')}
          <tr style="font-weight: bold;">
            <td style="padding: 8px;">Tổng cộng:</td>
            <td style="text-align: right; padding: 8px;">${parseInt(appointment.total_amount).toLocaleString('vi-VN')}đ</td>
          </tr>
        </table>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <h3 style="color: #333; margin-top: 0;">Thông tin quan trọng</h3>
          <ul style="padding-left: 20px; line-height: 1.5;">
            <li>Chúng tôi sẽ gọi điện xác nhận lịch hẹn trong vòng 30 phút.</li>
            <li>Vui lòng đến trước giờ hẹn 10-15 phút để hoàn tất thủ tục đăng ký.</li>
            <li>Bạn có thể hủy hoặc đổi lịch hẹn trước 24 giờ.</li>
            <li>Mọi thắc mắc xin liên hệ: <strong>1900 1234</strong></li>
          </ul>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777;">
        <p>Đây là email tự động, vui lòng không trả lời.</p>
        <p>&copy; ${new Date().getFullYear()} PetLand - Cửa hàng Thú cưng</p>
      </div>
    </div>
  `;
}

module.exports = spaAppointmentController;