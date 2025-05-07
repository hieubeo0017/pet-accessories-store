const blogModel = require('../models/blogModel');

exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'desc' } = req.query;

        const blogs = await blogModel.getAll({ 
            page: parseInt(page), 
            limit: parseInt(limit), 
            search, 
            sortBy, 
            sortOrder 
        });
        
        res.status(200).json(blogs);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bài viết:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
};

exports.create = async (req, res) => {
    try {
        const { title, content, excerpt, is_published, is_featured, thumbnail } = req.body;

        // Ánh xạ từ thumbnail sang image khi gửi đến model
        const newBlog = await blogModel.create({
            title,
            content,
            excerpt: excerpt || '',
            is_published: is_published === undefined ? true : Boolean(is_published),
            is_featured: is_featured === undefined ? false : Boolean(is_featured),
            image: thumbnail || null // Ánh xạ thumbnail sang image
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
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau',
            error: error.message
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const blog = await blogModel.getById(req.params.id);
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết'
            });
        }
        
        res.status(200).json({
            success: true,
            data: blog
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin bài viết:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau',
            error: error.message
        });
    }
};

exports.update = async (req, res) => {
    try {
        const { title, content, excerpt, is_published, is_featured, thumbnail } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Tiêu đề và nội dung không được để trống'
            });
        }

        // Kiểm tra blog có tồn tại không
        const existingBlog = await blogModel.getById(req.params.id);
        if (!existingBlog) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết'
            });
        }

        const updatedBlog = await blogModel.update(req.params.id, {
            title,
            content,
            excerpt: excerpt || '',
            is_published: is_published === undefined ? existingBlog.is_published : Boolean(is_published),
            is_featured: is_featured === undefined ? existingBlog.is_featured : Boolean(is_featured),
            thumbnail: thumbnail // Thêm trường thumbnail
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
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau',
            error: error.message
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const deletedBlog = await blogModel.delete(req.params.id);
        
        if (!deletedBlog) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Bài viết đã được xóa thành công',
            data: deletedBlog
        });
    } catch (error) {
        console.error('Lỗi khi xóa bài viết:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau',
            error: error.message
        });
    }
};

// Thêm phương thức mới
exports.getFeaturedBlogs = async (req, res) => {
    try {
        const { limit = 3 } = req.query;
        const page = 1;
        
        // Sử dụng lại phương thức getAll nhưng với điều kiện is_published = true và sắp xếp theo created_at
        const blogs = await blogModel.getAll({
            page,
            limit: parseInt(limit),
            sortBy: 'created_at',
            sortOrder: 'desc'
        });
        
        res.status(200).json({
            success: true,
            data: blogs.data
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bài viết nổi bật:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
};

// Thêm phương thức setFeatured

exports.setFeatured = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_featured } = req.body;
        
        if (typeof is_featured !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái nổi bật phải là boolean'
            });
        }
        
        // Kiểm tra blog có tồn tại không
        const blog = await blogModel.getById(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết'
            });
        }
        
        const updatedBlog = await blogModel.setFeatured(id, is_featured);
        
        return res.status(200).json({
            success: true,
            message: `Bài viết đã được ${is_featured ? 'đặt' : 'bỏ'} làm nổi bật`,
            data: updatedBlog
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái nổi bật:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau',
            error: error.message
        });
    }
};
