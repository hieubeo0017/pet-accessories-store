const brandModel = require('../models/brandModel');
const { validationResult } = require('express-validator');

exports.getAllBrands = async (req, res) => {
  try {
    // Lấy các tham số từ query string
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      sortBy = 'name',
      sortOrder = 'asc',
      is_active
    } = req.query;
    
    const isActive = is_active === undefined ? null : 
                    is_active === 'true' || is_active === '1' ? true : false;
    
    // Lấy danh sách thương hiệu với phân trang và lọc
    const result = await brandModel.getAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy,
      sortOrder,
      isActive
    });
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getAllBrands controller:', error);
    res.status(500).json({ 
      message: 'Lỗi khi lấy danh sách thương hiệu',
      error: error.message 
    });
  }
};

exports.getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await brandModel.getById(id);
    
    if (!brand) {
      return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });
    }
    
    res.status(200).json(brand);
  } catch (error) {
    console.error('Error in getBrandById controller:', error);
    res.status(500).json({ 
      message: 'Lỗi khi lấy thông tin thương hiệu',
      error: error.message 
    });
  }
};

exports.createBrand = async (req, res) => {
  try {
    // Kiểm tra lỗi validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, logo, description, website, is_active, is_featured } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!name || !logo) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin bắt buộc',
        required: ['name', 'logo']
      });
    }
    
    // Validation website nếu có
    if (website && !isValidUrl(website)) {
      return res.status(400).json({
        message: 'Website không hợp lệ'
      });
    }
    
    // Tạo thương hiệu mới
    const newBrand = await brandModel.create({
      name,
      logo,
      description,
      website,
      is_active: is_active === undefined ? true : Boolean(is_active),
      is_featured: is_featured === undefined ? false : Boolean(is_featured)
    });
    
    res.status(201).json(newBrand);
  } catch (error) {
    console.error('Error in createBrand controller:', error);
    
    // Xử lý lỗi unique constraint
    if (error.message.includes('unique')) {
      return res.status(400).json({ 
        message: 'Tên thương hiệu đã tồn tại',
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      message: 'Lỗi khi tạo thương hiệu mới',
      error: error.message 
    });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    // Kiểm tra lỗi validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { name, logo, description, website, is_active, is_featured } = req.body;
    
    // Kiểm tra thương hiệu tồn tại
    const existingBrand = await brandModel.getById(id);
    if (!existingBrand) {
      return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });
    }
    
    // Validation website nếu có
    if (website && !isValidUrl(website)) {
      return res.status(400).json({
        message: 'Website không hợp lệ'
      });
    }
    
    // Cập nhật thương hiệu
    const updatedBrand = await brandModel.update(id, {
      name,
      logo,
      description,
      website,
      is_active: is_active === undefined ? existingBrand.is_active : Boolean(is_active),
      is_featured: is_featured === undefined ? existingBrand.is_featured : Boolean(is_featured)
    });
    
    res.status(200).json(updatedBrand);
  } catch (error) {
    console.error('Error in updateBrand controller:', error);
    
    // Xử lý lỗi unique constraint
    if (error.message.includes('unique')) {
      return res.status(400).json({ 
        message: 'Tên thương hiệu đã tồn tại',
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      message: 'Lỗi khi cập nhật thương hiệu',
      error: error.message 
    });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra thương hiệu tồn tại
    const existingBrand = await brandModel.getById(id);
    if (!existingBrand) {
      return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });
    }
    
    // Xóa thương hiệu
    await brandModel.delete(id);
    
    res.status(200).json({ message: 'Đã xóa thương hiệu thành công' });
  } catch (error) {
    console.error('Error in deleteBrand controller:', error);
    
    // Nếu thương hiệu đang được sử dụng, không cho xóa
    if (error.message.includes('associated with products')) {
      return res.status(400).json({ 
        message: 'Không thể xóa thương hiệu vì đang được sử dụng bởi sản phẩm',
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      message: 'Lỗi khi xóa thương hiệu',
      error: error.message 
    });
  }
};

// Hàm hỗ trợ kiểm tra URL hợp lệ
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
};

exports.getFeaturedBrands = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const featuredBrands = await brandModel.getFeatured({
      limit: parseInt(limit)
    });
    
    res.json({
      message: 'Lấy danh sách thương hiệu nổi bật thành công',
      data: featuredBrands
    });
  } catch (error) {
    console.error('Error getting featured brands:', error);
    res.status(500).json({ 
      message: 'Lỗi khi lấy danh sách thương hiệu nổi bật', 
      error: error.message 
    });
  }
};