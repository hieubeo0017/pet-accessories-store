const { connectDB, sql } = require('../config/database');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');


const blogModel = {
    async getAll({ page = 1, limit = 10, search = '', sortBy = 'title', sortOrder = 'asc' }) {
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
                query += ` AND (title LIKE @search OR content LIKE @search)`;
                params.push({ name: 'search', value: `%${search}%` });
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
            const slug = slugify(blogData.title, { lower: true });

            const result = await pool.request()
                .input('id', sql.VarChar(50), uuidv4())
                .input('title', sql.VarChar(255), blogData.title)
                .input('content', sql.Text, blogData.content)
                .input('slug', sql.VarChar(255), slug)
                .input('excerpt', sql.Text, blogData.excerpt)
                .query(`
                    INSERT INTO blogs (id, title, content, slug, excerpt)
                        OUTPUT INSERTED.*
                    VALUES (@id, @title, @content, @slug, @excerpt)
                `);

            return result.recordset[0];  // Trả về bài viết vừa tạo
        } catch (error) {
            throw error;
        }
    },
    getById: async (id) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.VarChar(50), id)
                .query('SELECT * FROM blogs WHERE id = @id');

            return result.recordset[0];
        }catch (error) {
            throw error;
        }
    },
    update: async (id, blogData) => {
        try {
            const pool = await connectDB();
            const slug = slugify(blogData.title, { lower: true });

            const result = await pool.request()
                .input('id', sql.VarChar(50), id)
                .input('title', sql.VarChar(255), blogData.title)
                .input('content', sql.Text, blogData.content)
                .input('slug', sql.VarChar(255), slug)
                .input('excerpt', sql.Text, blogData.excerpt)
                .input('is_published', sql.Bit, blogData.is_published)
                .query(`
                    UPDATE blogs
                    SET title = @title, content = @content, slug = @slug, excerpt = @excerpt, is_published = @is_published
                    WHERE id = @id
                `);

            return true;
        }catch (error) {
            throw error;
        }
    },
    delete: async (id) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.VarChar(50), id)
                .query('DELETE FROM blogs WHERE id = @id');

            return result.rowsAffected[0] > 0;
        }catch (error) {
            throw error;
        }
    }
}

module.exports = blogModel;
