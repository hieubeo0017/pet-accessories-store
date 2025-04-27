const blogModel = require('../models/blogModel');


exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sortBy = 'title', sortOrder = 'asc' } = req.query;

        const blogs = await blogModel.getAll({ page, limit, search, sortBy, sortOrder });
        res.status(200).json(blogs);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bài viết:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
}
exports.create = async (req, res) => {
    try {
        const { title, content, excerpt, is_published } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Tiêu đề và nội dung không được để trống'
            });
        }

        const newBlog = await blogModel.create({
            title,
            content,
            excerpt,
            is_published
        });

        return res.status(201).json({
            success: true,
            message: 'Bài viết đã được tạo thành công',
            data: newBlog
        });
    } catch (error) {
        console.error('Lỗi khi tạo bài viết:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
};
exports.getById = async (req, res) => {
    try {
        const blog = await blogModel.getById(req.params.id);
        res.status(200).json(blog);
    } catch (error) {

    }
}
exports.update = async (req, res) => {
    try {
        const { title, content, excerpt, is_published } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Tiêu đề và nội dung không được để trống'
            });
        }

        const updatedBlog = await blogModel.update(req.params.id, {
            title,
            content,
            excerpt,
            is_published
        });

        return res.status(200).json({
            success: true,
            message: 'Bài viết đã được cập nhật thành công',
            data: updatedBlog
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật bài viết:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
}
exports.delete = async (req, res) => {
    try {
        const deletedBlog = await blogModel.delete(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Bài viết đã được xóa thành công',
            data: deletedBlog
        });
    } catch (error) {
        console.error('Lỗi khi xóa bài viết:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
}
