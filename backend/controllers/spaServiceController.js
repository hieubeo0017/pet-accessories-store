const spaServiceModel = require('../models/spaServiceModel');

/**
 * Lấy danh sách dịch vụ spa với phân trang và lọc
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
const getAllSpaServices = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      pet_type = '',
      pet_size = '',
      is_active,
      is_featured,
      sort_by = 'id',
      sort_order = 'DESC'
    } = req.query;
    
    // Kiểm tra nếu request đến từ client
    const isClientRequest = req.headers['x-client-view'] === 'true';
    
    // Nếu là client, luôn đặt is_active = true
    // Nếu không, sử dụng giá trị từ query param nếu có
    let activeFilter = isClientRequest ? true : 
                      (is_active === undefined ? null : 
                      (is_active === 'true' || is_active === '1'));
                      
    let featuredFilter = is_featured === undefined ? null : 
                        (is_featured === 'true' || is_featured === '1');
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      pet_type,
      pet_size,
      is_active: activeFilter,
      is_featured: featuredFilter,
      sort_by: ['id', 'name', 'price', 'duration'].includes(sort_by) ? sort_by : 'id',
      sort_order: ['ASC', 'DESC'].includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC'
    };
    
    const result = await spaServiceModel.getAllSpaServices(options);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getAllSpaServices controller:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách dịch vụ spa', error: error.message });
  }
};

/**
 * Lấy chi tiết dịch vụ spa theo ID
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
const getSpaServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await spaServiceModel.getSpaServiceById(id);
    
    if (!service) {
      return res.status(404).json({ message: `Không tìm thấy dịch vụ spa với ID ${id}` });
    }
    
    // Kiểm tra nếu là request từ client và dịch vụ không active
    const isClientRequest = req.headers['x-client-view'] === 'true';
    if (isClientRequest && !service.is_active) {
      return res.status(404).json({ message: 'Dịch vụ này hiện không khả dụng' });
    }
    
    res.status(200).json(service);
  } catch (error) {
    console.error(`Error in getSpaServiceById controller:`, error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết dịch vụ spa', error: error.message });
  }
};

/**
 * Tạo dịch vụ spa mới
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
const createSpaService = async (req, res) => {
  try {
    const serviceData = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!serviceData.name || !serviceData.description || !serviceData.price || !serviceData.duration) {
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp đầy đủ thông tin dịch vụ: tên, mô tả, giá và thời gian thực hiện' 
      });
    }
    
    const newService = await spaServiceModel.createSpaService(serviceData);
    
    res.status(201).json({ 
      message: 'Tạo dịch vụ spa thành công',
      data: newService
    });
  } catch (error) {
    console.error('Error in createSpaService controller:', error);
    res.status(500).json({ message: 'Lỗi khi tạo dịch vụ spa', error: error.message });
  }
};

/**
 * Cập nhật dịch vụ spa
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
const updateSpaService = async (req, res) => {
  try {
    const { id } = req.params;
    const serviceData = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!serviceData.name || !serviceData.description || !serviceData.price || !serviceData.duration) {
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp đầy đủ thông tin dịch vụ: tên, mô tả, giá và thời gian thực hiện' 
      });
    }
    
    const updatedService = await spaServiceModel.updateSpaService(id, serviceData);
    
    res.status(200).json({ 
      message: `Cập nhật dịch vụ spa ID ${id} thành công`,
      data: updatedService
    });
  } catch (error) {
    console.error(`Error in updateSpaService controller:`, error);
    
    if (error.message && error.message.includes('Không tìm thấy')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Lỗi khi cập nhật dịch vụ spa', error: error.message });
  }
};

/**
 * Xóa dịch vụ spa
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
const deleteSpaService = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await spaServiceModel.deleteSpaService(id);
    
    res.status(200).json({ 
      message: `Xóa dịch vụ spa ID ${id} thành công`
    });
  } catch (error) {
    console.error(`Error in deleteSpaService controller:`, error);
    
    if (error.message && error.message.includes('Không tìm thấy')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Lỗi khi xóa dịch vụ spa', error: error.message });
  }
};

/**
 * Lấy danh sách dịch vụ spa nổi bật
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
const getFeaturedSpaServices = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    // Đảm bảo chỉ lấy dịch vụ active
    const services = await spaServiceModel.getFeaturedSpaServices(limit);
    
    res.status(200).json({
      data: services
    });
  } catch (error) {
    console.error('Error in getFeaturedSpaServices controller:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách dịch vụ spa nổi bật', error: error.message });
  }
};

/**
 * Lấy danh sách dịch vụ liên quan
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
const getRelatedServices = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;
    
    // Lấy thông tin dịch vụ hiện tại
    const currentService = await spaServiceModel.getSpaServiceById(id);
    
    if (!currentService) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy dịch vụ' 
      });
    }
    
    // Lấy các dịch vụ liên quan (cùng loại thú cưng hoặc kích thước)
    const relatedServices = await spaServiceModel.getRelatedServices({
      currentId: id,
      petType: currentService.pet_type,
      petSize: currentService.pet_size,
      limit: parseInt(limit)
    });
    
    res.status(200).json({
      success: true,
      data: relatedServices
    });
  } catch (error) {
    console.error('Error getting related spa services:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách dịch vụ liên quan',
      error: error.message
    });
  }
};

module.exports = {
  getAllSpaServices,
  getSpaServiceById,
  createSpaService,
  updateSpaService,
  deleteSpaService,
  getFeaturedSpaServices,
  getRelatedServices
};