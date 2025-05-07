const { connectDB, sql } = require('../config/database');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');

const blogModel = {
    async getAll({ page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'desc' }) {
        try {
            const pool = await connectDB();

            let query = `
                SELECT
                    *
                FROM blogs
                WHERE 1=1
            `;
            const params = [];

            if (search) {
                query += ` AND (title LIKE @search OR content LIKE @search OR excerpt LIKE @search)`;
                params.push({ name: 'search', value: `%${search}%` });
            }

            // Đảm bảo sortBy là cột hợp lệ để tránh SQL injection
            const validColumns = ['id', 'title', 'slug', 'created_at', 'updated_at', 'is_published'];
            if (!validColumns.includes(sortBy)) {
                sortBy = 'created_at';
            }

            query += ` ORDER BY ${sortBy} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;

            const offset = (page - 1) * limit;
            query += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

            const request = pool.request();
            params.forEach(param => {
                request.input(param.name, param.value);
            });

            const result = await request.query(query);

            const blogs = result.recordset;

            const countQuery = `SELECT COUNT(*) AS total_count FROM blogs WHERE 1=1`;
            const countResult = await pool.request().query(countQuery);
            const totalCount = countResult.recordset[0].total_count;

            const totalPages = Math.ceil(totalCount / limit);

            return {
                data: blogs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalItems: totalCount,
                    totalPages
                }
            };
        } catch (error) {
            console.error('Error in BlogModel.getAll:', error);
            throw error;
        }
    },
    create: async (blogData) => {
        try {
            const pool = await connectDB();
            
            // Sửa cách tạo ID để tránh vấn đề overflow
            const result = await pool.request().query(`
                SELECT TOP 1 id
                FROM blogs
                WHERE id LIKE 'BLOG-%'
                ORDER BY CAST(SUBSTRING(id, 6, 10) AS BIGINT) DESC
            `);
            
            let nextNum = 1;
            if (result.recordset.length > 0) {
                // Xử lý an toàn hơn để lấy số từ ID
                const lastId = result.recordset[0].id;
                const matches = lastId.match(/BLOG-(\d+)/);
                if (matches && matches[1]) {
                    nextNum = parseInt(matches[1], 10) + 1;
                }
            }
            
            const blogId = `BLOG-${nextNum.toString().padStart(4, '0')}`;
            const slug = slugify(blogData.title, { lower: true });

            // Điều chỉnh tên cột từ 'image' sang 'thumbnail' hoặc ngược lại
            const insertResult = await pool.request()
                .input('id', sql.VarChar(50), blogId)
                .input('title', sql.NVarChar(255), blogData.title)
                .input('content', sql.NText, blogData.content)
                .input('slug', sql.VarChar(255), slug)
                .input('excerpt', sql.NVarChar(500), blogData.excerpt || '')
                .input('is_published', sql.Bit, blogData.is_published === undefined ? true : blogData.is_published)
                .input('is_featured', sql.Bit, blogData.is_featured === undefined ? false : blogData.is_featured)
                .input('image', sql.NVarChar(500), blogData.thumbnail || null) // Đổi tên tham số để khớp với tên cột
                .query(`
                    INSERT INTO blogs (id, title, content, slug, excerpt, is_published, is_featured, image, created_at, updated_at)
                    OUTPUT INSERTED.*
                    VALUES (@id, @title, @content, @slug, @excerpt, @is_published, @is_featured, @image, GETDATE(), GETDATE())
                `);

            return insertResult.recordset[0];
        } catch (error) {
            console.error('Error creating blog:', error);
            throw error;
        }
    },
    getById: async (id) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.VarChar(50), id)
                .query('SELECT * FROM blogs WHERE id = @id');

            if (result.recordset.length === 0) {
                return null; // Trả về null nếu không tìm thấy
            }

            return result.recordset[0];
        } catch (error) {
            console.error('Error getting blog by id:', error);
            throw error;
        }
    },
    update: async (id, blogData) => {
        try {
            const pool = await connectDB();
            const slug = slugify(blogData.title, { lower: true });

            // Điều chỉnh tên tham số để khớp với tên cột
            await pool.request()
                .input('id', sql.VarChar(50), id)
                .input('title', sql.NVarChar(255), blogData.title)
                .input('content', sql.NText, blogData.content)
                .input('slug', sql.VarChar(255), slug)
                .input('excerpt', sql.NVarChar(500), blogData.excerpt || '')
                .input('is_published', sql.Bit, blogData.is_published)
                .input('is_featured', sql.Bit, blogData.is_featured === undefined ? false : blogData.is_featured)
                .input('image', sql.NVarChar(500), blogData.thumbnail || null) // Đổi tên tham số để khớp với tên cột
                .query(`
                    UPDATE blogs
                    SET title = @title, 
                        content = @content, 
                        slug = @slug, 
                        excerpt = @excerpt, 
                        is_published = @is_published,
                        is_featured = @is_featured,
                        image = @image,
                        updated_at = GETDATE()
                    WHERE id = @id
                `);

            // Trả về dữ liệu blog đã cập nhật
            const updatedBlog = await pool.request()
                .input('id', sql.VarChar(50), id)
                .query('SELECT * FROM blogs WHERE id = @id');

            return updatedBlog.recordset[0];
        } catch (error) {
            console.error('Error updating blog:', error);
            throw error;
        }
    },
    delete: async (id) => {
        try {
            const pool = await connectDB();
            
            // Lấy thông tin blog trước khi xóa
            const blogResult = await pool.request()
                .input('id', sql.VarChar(50), id)
                .query('SELECT * FROM blogs WHERE id = @id');
                
            const blog = blogResult.recordset[0];
            
            if (!blog) {
                return null;
            }
            
            // Tiến hành xóa blog
            const result = await pool.request()
                .input('id', sql.VarChar(50), id)
                .query('DELETE FROM blogs WHERE id = @id');

            return blog; // Trả về thông tin blog đã bị xóa
        } catch (error) {
            console.error('Error deleting blog:', error);
            throw error;
        }
    },
    setFeatured: async (id, isFeatured) => {
        try {
            const pool = await connectDB();
            
            // Cập nhật trạng thái nổi bật
            await pool.request()
                .input('id', sql.VarChar(50), id)
                .input('is_featured', sql.Bit, isFeatured)
                .query(`
                    UPDATE blogs
                    SET is_featured = @is_featured
                    WHERE id = @id
                `);
            
            // Trả về thông tin blog sau khi cập nhật
            const updatedBlog = await pool.request()
                .input('id', sql.VarChar(50), id)
                .query('SELECT * FROM blogs WHERE id = @id');
                
            return updatedBlog.recordset[0];
        } catch (error) {
            console.error('Error setting blog featured status:', error);
            throw error;
        }
    }
}

module.exports = blogModel;
