const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

// Lấy danh sách người dùng
exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sortBy = 'username', sortOrder = 'asc' } = req.query;

        const users = await userModel.getAll({ page, limit, search, sortBy, sortOrder });
        res.status(200).json(users);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
}

// Tạo người dùng mới
exports.create = async (req, res) => {
    try {
        const { username, email, password, full_name, phone_number, address, role } = req.body;

        // Chuẩn hóa dữ liệu tiếng Việt
        const normalizedData = {
            username: username ? username.normalize('NFC') : username,
            email,
            password,
            full_name: full_name ? full_name.normalize('NFC') : full_name,
            phone_number,
            address: address ? address.normalize('NFC') : address,
            role: role || 'user'
        };

        // Kiểm tra thông tin bắt buộc
        if (!normalizedData.username || !normalizedData.email || !normalizedData.password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email và password là bắt buộc'
            });
        }
        
        // Kiểm tra email đã tồn tại chưa
        const existingUser = await userModel.findByEmail(normalizedData.email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng'
            });
        }

        // Kiểm tra role hợp lệ
        if (normalizedData.role && !['user', 'admin'].includes(normalizedData.role)) {
            return res.status(400).json({
                success: false,
                message: 'Role không hợp lệ (user/admin)'
            });
        }

        const newUser = await userModel.create(normalizedData);
        
        // Chuẩn hóa lại trước khi trả về
        const normalizedResponse = {
            ...newUser,
            username: newUser.username ? newUser.username.normalize('NFC') : newUser.username,
            full_name: newUser.full_name ? newUser.full_name.normalize('NFC') : newUser.full_name,
            address: newUser.address ? newUser.address.normalize('NFC') : newUser.address,
        };
        
        // Loại bỏ password trước khi trả về response
        const { password: _, ...userWithoutPassword } = normalizedResponse;
        
        return res.status(201).json({
            success: true,
            message: 'Người dùng đã được tạo thành công',
            data: userWithoutPassword
        });
    } catch (error) {
        console.error('Lỗi khi tạo người dùng:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
};

// Lấy thông tin người dùng theo ID
exports.getById = async (req, res) => {
    try {
        const user = await userModel.getById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
}

// Cập nhật thông tin người dùng
exports.update = async (req, res) => {
    try {
        const { username, email, full_name, phone_number, address, role, password } = req.body;

        // Kiểm tra người dùng có tồn tại
        const existingUser = await userModel.getById(req.params.id);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Tạo đối tượng dữ liệu cập nhật, lấy giá trị hiện tại nếu không có trong request
        let updateData = {
            username: username || existingUser.username,
            email: email || existingUser.email,
            full_name: full_name !== undefined ? full_name : existingUser.full_name,
            phone_number: phone_number !== undefined ? phone_number : existingUser.phone_number,
            address: address !== undefined ? address : existingUser.address,
            role: role || existingUser.role
        };

        // Kiểm tra các trường bắt buộc sau khi đã kết hợp với dữ liệu hiện tại
        if (!updateData.username || !updateData.email) {
            return res.status(400).json({
                success: false,
                message: 'Tên người dùng và email không được để trống'
            });
        }

        // Kiểm tra role hợp lệ
        if (updateData.role && !['user', 'admin'].includes(updateData.role)) {
            return res.status(400).json({
                success: false,
                message: 'Role không hợp lệ (user/admin)'
            });
        }

        // Mã hóa mật khẩu nếu được cập nhật
        if (password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updateData.password = hashedPassword;
        }

        const updatedUser = await userModel.update(req.params.id, updateData);

        return res.status(200).json({
            success: true,
            message: 'Thông tin người dùng đã được cập nhật thành công',
            data: updatedUser
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật người dùng:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
}

// Xóa người dùng
exports.delete = async (req, res) => {
    try {
        // Kiểm tra người dùng có tồn tại
        const existingUser = await userModel.getById(req.params.id);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }
        
        const deleted = await userModel.delete(req.params.id);
        if (!deleted) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa người dùng'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Người dùng đã được xóa thành công'
        });
    } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
}

// Lấy danh sách đánh giá
exports.getReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'desc' } = req.query;

        const reviews = await userModel.getReviews({ page, limit, search, sortBy, sortOrder });
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đánh giá:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
};

// Xóa đánh giá
exports.deleteReview = async (req, res) => {
    try {
        const deleted = await userModel.deleteReview(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Đánh giá đã được xóa thành công'
        });
    } catch (error) {
        console.error('Lỗi khi xóa đánh giá:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
}

// Thêm phương thức đổi mật khẩu
exports.changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ mật khẩu hiện tại và mật khẩu mới'
            });
        }
        
        // Kiểm tra độ dài mật khẩu mới
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
            });
        }
        
        // Lấy thông tin người dùng
        const user = await userModel.getById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }
        
        // Xác thực mật khẩu hiện tại
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không chính xác'
            });
        }
        
        // Mã hóa mật khẩu mới
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Cập nhật mật khẩu mới
        await userModel.updatePassword(id, hashedPassword);
        
        res.status(200).json({
            success: true,
            message: 'Mật khẩu đã được thay đổi thành công'
        });
    } catch (error) {
        console.error('Lỗi khi đổi mật khẩu:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
};

// Thêm phương thức để cập nhật trạng thái duyệt của đánh giá

// Cập nhật trạng thái đánh giá
exports.toggleReviewApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_approved } = req.body;

        if (is_approved === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Cần cung cấp trạng thái is_approved'
            });
        }

        const updated = await userModel.updateReviewApproval(id, is_approved);
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá'
            });
        }
        
        res.status(200).json({
            success: true,
            message: `Đánh giá đã được ${is_approved ? 'duyệt' : 'hủy duyệt'} thành công`
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đánh giá:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
};
