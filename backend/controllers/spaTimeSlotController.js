const SpaTimeSlotModel = require('../models/spaTimeSlotModel');

const SpaTimeSlotController = {
  // Cập nhật phương thức getAllTimeSlots để xử lý các tham số lọc và phân trang
  getAllTimeSlots: async (req, res) => {
    try {
      // Lấy tất cả các tham số từ query string
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        is_active: req.query.is_active,
        time_from: req.query.time_from,
        time_to: req.query.time_to,
        sort_by: req.query.sort_by,
        sort_order: req.query.sort_order
      };
      
      // Gọi model với các tham số lọc
      const result = await SpaTimeSlotModel.getAllTimeSlots(filters);
      
      // Định dạng time_slot trước khi trả về
      const formattedData = result.data.map(slot => {
        return {
          id: slot.id,
          time_slot: slot.time_slot_formatted, // Thay thế trường gốc bằng phiên bản định dạng
          // time_slot_original: slot.time_slot, // Giữ lại dữ liệu gốc trong trường khác nếu cần
          max_capacity: slot.max_capacity,
          is_active: slot.is_active,
          created_at: slot.created_at,
          updated_at: slot.updated_at
        };
      });
      
      res.status(200).json({
        success: true,
        data: formattedData,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in getAllTimeSlots:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách khung giờ',
        error: error.message
      });
    }
  },
  
  // Lấy khung giờ theo ID
  getTimeSlotById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await SpaTimeSlotModel.getTimeSlotById(id);
      
      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khung giờ'
        });
      }
      
      res.status(200).json({
        success: true,
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error in getTimeSlotById:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin khung giờ',
        error: error.message
      });
    }
  },
  
  // Tạo khung giờ mới
  createTimeSlot: async (req, res) => {
    try {
      const timeSlotData = req.body;
      
      // Validate dữ liệu đầu vào
      if (!timeSlotData.time_slot) {
        return res.status(400).json({
          success: false,
          message: 'Thời gian không được để trống'
        });
      }
      
      if (!timeSlotData.max_capacity || timeSlotData.max_capacity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Số chỗ tối đa phải lớn hơn 0'
        });
      }
      
      // Định dạng lại time_slot để đảm bảo đúng định dạng HH:MM:SS
      let formattedTimeSlot = timeSlotData.time_slot;
      
      // Nếu time_slot không có đủ định dạng HH:MM:SS, thêm vào
      if (formattedTimeSlot.split(':').length === 2) {
        formattedTimeSlot = `${formattedTimeSlot}:00`;
      }
      
      // Nếu là 'HH:MM' nhưng không đủ 2 chữ số
      const parts = formattedTimeSlot.split(':');
      if (parts.length >= 2) {
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        const seconds = parts.length > 2 ? parts[2].padStart(2, '0') : '00';
        formattedTimeSlot = `${hours}:${minutes}:${seconds}`;
      }
      
      // Tạo một bản sao của timeSlotData với time_slot đã được định dạng
      const formattedData = {
        ...timeSlotData,
        time_slot: formattedTimeSlot
      };
      
      const result = await SpaTimeSlotModel.createTimeSlot(formattedData);
      
      res.status(201).json({
        success: true,
        message: 'Tạo khung giờ thành công',
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error in createTimeSlot:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo khung giờ',
        error: error.message
      });
    }
  },
  
  // Cập nhật khung giờ
  updateTimeSlot: async (req, res) => {
    try {
      const { id } = req.params;
      const timeSlotData = req.body;
      
      // Kiểm tra khung giờ tồn tại
      const checkResult = await SpaTimeSlotModel.getTimeSlotById(id);
      if (checkResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khung giờ'
        });
      }
      
      // Định dạng lại time_slot để đảm bảo đúng định dạng HH:MM:SS
      let formattedTimeSlot = timeSlotData.time_slot;
      
      // Nếu time_slot không có đủ định dạng HH:MM:SS, thêm vào
      if (formattedTimeSlot.split(':').length === 2) {
        formattedTimeSlot = `${formattedTimeSlot}:00`;
      }
      
      // Nếu là 'HH:MM' nhưng không đủ 2 chữ số
      const parts = formattedTimeSlot.split(':');
      if (parts.length >= 2) {
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        const seconds = parts.length > 2 ? parts[2].padStart(2, '0') : '00';
        formattedTimeSlot = `${hours}:${minutes}:${seconds}`;
      }
      
      // Tạo một bản sao của timeSlotData với time_slot đã được định dạng
      const formattedData = {
        ...timeSlotData,
        time_slot: formattedTimeSlot
      };
      
      const result = await SpaTimeSlotModel.updateTimeSlot(id, formattedData);
      
      res.status(200).json({
        success: true,
        message: 'Cập nhật khung giờ thành công',
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Error in updateTimeSlot:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật khung giờ',
        error: error.message
      });
    }
  },
  
  // Xóa khung giờ
  deleteTimeSlot: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Kiểm tra khung giờ tồn tại
      const checkResult = await SpaTimeSlotModel.getTimeSlotById(id);
      if (checkResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khung giờ'
        });
      }
      
      await SpaTimeSlotModel.deleteTimeSlot(id);
      
      res.status(200).json({
        success: true,
        message: 'Xóa khung giờ thành công'
      });
    } catch (error) {
      console.error('Error in deleteTimeSlot:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa khung giờ',
        error: error.message
      });
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
      
      const result = await SpaTimeSlotModel.checkAvailability(date);
      
      // Định dạng kết quả trả về thành các khung giờ cụ thể
      const formattedData = {};
      
      result.recordset.forEach(slot => {
        // Xử lý đúng định dạng ISO timestamp
        const timeObj = new Date(slot.time_slot);
        // Lấy giờ và phút theo UTC để tránh vấn đề múi giờ
        const hours = timeObj.getUTCHours().toString().padStart(2, '0');
        const minutes = timeObj.getUTCMinutes().toString().padStart(2, '0');
        const formattedTime = `${hours}:${minutes}`;
        
        formattedData[formattedTime] = {
          id: slot.id,
          total: slot.max_capacity,
          booked: slot.booked_slots,
          available: slot.available_slots
        };
      });
      
      res.status(200).json({
        success: true,
        data: formattedData
      });
    } catch (error) {
      console.error('Error in checkAvailability:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi kiểm tra khả dụng',
        error: error.message
      });
    }
  }
};

module.exports = SpaTimeSlotController;