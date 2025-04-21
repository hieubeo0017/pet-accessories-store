const petModel = require('../models/petModel');
const { sql } = require('../config/database');

exports.getAllPets = async (req, res) => {
  try {
    // Lấy các tham số từ query
    const { 
      search, page, limit, type, breed, gender, min_price, 
      max_price, is_adopted, is_active, category_id, sort_by, sort_order 
    } = req.query;
    
    // Chuyển đổi is_adopted và is_active từ chuỗi sang boolean nếu có
    let adoptedFilter, activeFilter;
    
    if (is_adopted !== undefined) {
      adoptedFilter = is_adopted === 'true' || is_adopted === '1';
    }
    
    // Chỉ khi tham số is_active được gửi lên, mới thiết lập giá trị cho activeFilter
    if (is_active !== undefined) {
      activeFilter = is_active === 'true' || is_active === '1';
    } else {
      // Nếu không có tham số is_active, activeFilter = undefined để lấy tất cả
      activeFilter = undefined;
    }
    
    // Lấy danh sách thú cưng với bộ lọc
    const pets = await petModel.getAll({
      search,
      page,
      limit,
      type,
      breed,
      gender,
      min_price,
      max_price,
      is_adopted: adoptedFilter,
      is_active: activeFilter,
      category_id,
      sortBy: sort_by,
      sortOrder: sort_order
    });
    
    res.json(pets);
  } catch (error) {
    console.error('Error getting all pets:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách thú cưng', error: error.message });
  }
};

exports.getPetById = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await petModel.getById(id);
    
    if (!pet) {
      return res.status(404).json({ message: 'Không tìm thấy thú cưng' });
    }
    
    res.json(pet);
  } catch (error) {
    console.error('Error getting pet by ID:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin thú cưng', error: error.message });
  }
};

exports.createPet = async (req, res) => {
  try {
    // Kiểm tra dữ liệu đầu vào
    const { name, type, breed, age, gender, price, description } = req.body;
    
    if (!name || !type || !breed || !age || !gender || !price || !description) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc' });
    }
    
    // Kiểm tra kiểu thú cưng
    if (type !== 'dog' && type !== 'cat') {
      return res.status(400).json({ message: 'Loại thú cưng không hợp lệ (dog/cat)' });
    }
    
    // Kiểm tra giới tính
    if (gender !== 'male' && gender !== 'female') {
      return res.status(400).json({ message: 'Giới tính không hợp lệ (male/female)' });
    }
    
    // Lấy dữ liệu hình ảnh
    const { images = [] } = req.body;
    
    // Tạo thú cưng mới
    const newPet = await petModel.create(req.body, images);
    
    res.status(201).json({
      message: 'Thêm thú cưng thành công',
      data: newPet
    });
  } catch (error) {
    console.error('Error creating pet:', error);
    res.status(500).json({ message: 'Lỗi khi thêm thú cưng', error: error.message });
  }
};

exports.updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Thêm log debug ở đây để xem dữ liệu được gửi lên
    console.log("Pet data being updated:", req.body);
    
    // Kiểm tra thú cưng tồn tại
    const existingPet = await petModel.getById(id);
    if (!existingPet) {
      return res.status(404).json({ message: 'Không tìm thấy thú cưng' });
    }
    
    // Kiểm tra nếu type được cung cấp
    if (req.body.type && req.body.type !== 'dog' && req.body.type !== 'cat') {
      return res.status(400).json({ message: 'Loại thú cưng không hợp lệ (dog/cat)' });
    }
    
    // Kiểm tra nếu gender được cung cấp
    if (req.body.gender && req.body.gender !== 'male' && req.body.gender !== 'female') {
      return res.status(400).json({ message: 'Giới tính không hợp lệ (male/female)' });
    }
    
    // Lấy dữ liệu hình ảnh
    const { images } = req.body;
    
    // Cập nhật thú cưng
    const updatedPet = await petModel.update(id, req.body, images);
    
    res.json({
      message: 'Cập nhật thú cưng thành công',
      data: updatedPet
    });
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật thú cưng', error: error.message });
  }
};

exports.deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra thú cưng tồn tại
    const existingPet = await petModel.getById(id);
    if (!existingPet) {
      return res.status(404).json({ message: 'Không tìm thấy thú cưng' });
    }
    
    // Kiểm tra thú cưng có đang được sử dụng trong đơn hàng hay không
    const isInUse = await petModel.checkPetInUse(id);
    if (isInUse) {
      return res.status(400).json({ 
        message: 'Không thể xóa thú cưng này vì nó đang được sử dụng trong đơn hàng',
        inUse: true
      });
    }
    
    // Xóa thú cưng
    const deletedPet = await petModel.delete(id);
    
    res.json({
      message: 'Xóa thú cưng thành công',
      data: deletedPet
    });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({ message: 'Lỗi khi xóa thú cưng', error: error.message });
  }
};

// Kiểm tra thú cưng có đang được sử dụng trong đơn hàng không
exports.checkPetInUse = async (req, res) => {
  try {
    const { id } = req.params;
    const isInUse = await petModel.checkPetInUse(id);
    
    res.json({ inUse: isInUse });
  } catch (error) {
    console.error('Error checking if pet is in use:', error);
    res.status(500).json({ message: 'Lỗi khi kiểm tra thú cưng', error: error.message });
  }
};

// Lấy danh sách thú cưng nổi bật
exports.getFeaturedPets = async (req, res) => {
  try {
    const { type, limit = 4 } = req.query;
    
    const featuredPets = await petModel.getFeatured({
      type,
      limit
    });
    
    res.json({
      message: 'Lấy danh sách thú cưng nổi bật thành công',
      data: featuredPets
    });
  } catch (error) {
    console.error('Error getting featured pets:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách thú cưng nổi bật', error: error.message });
  }
};