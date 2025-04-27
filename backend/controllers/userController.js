const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');


exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sortBy = 'title', sortOrder = 'asc' } = req.query;

        const blogs = await userModel.getAll({ page, limit, search, sortBy, sortOrder });
        res.status(200).json(blogs);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
}
exports.create = async (req, res) => {
    try {
        const { username, email, password, full_name, phone_number, address, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email và password là bắt buộc'
            });
        }

        const newUser = await userModel.create({
            username,
            email,
            password,
            full_name,
            phone_number,
            address,
            role
        });

        return res.status(201).json({
            success: true,
            message: 'Người dùng đã được tạo thành công',
            data: newUser
        });
    } catch (error) {
        console.error('Lỗi khi tạo người dùng:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
};
exports.getById = async (req, res) => {
    try {
        const blog = await userModel.getById(req.params.id);
        res.status(200).json(blog);
    } catch (error) {

    }
}
exports.update = async (req, res) => {
    try {
        const { username, email, full_name, phone_number, address, role, password } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!username || !email) {
            return res.status(400).json({
                success: false,
                message: 'Tên người dùng và email không được để trống'
            });
        }

        let updateData = { username, email, full_name, phone_number, address, role };

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
exports.delete = async (req, res) => {
    try {
        const deletedBlog = await userModel.delete(req.params.id);
        res.status(200).json({
            success: true,
            message: 'người dùng đã được xóa thành công',
            data: deletedBlog
        });
    } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
}
exports.getReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sortBy = 'title', sortOrder = 'asc' } = req.query;

        const reviews = await userModel.getReviews({ page, limit, search, sortBy, sortOrder });
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đánh giá:', error);
        return res.status(500).json({
            success: false,
            message: error
        });
    }
};
exports.deleteReview = async (req, res) => {
    try {
        const deletedReview = await userModel.deleteReview(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Đánh giá đã được xóa thành công',
            data: deletedReview
        });
    } catch (error) {
        console.error('Lỗi khi xóa đánh giá:', error);
        return res.status(500).json({
            success: false,
            message: error
        });
    }
}
