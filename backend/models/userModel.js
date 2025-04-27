const { connectDB, sql } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const userModel = {
    findByEmail: async (email) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('email', sql.VarChar, email)
                .query('SELECT * FROM users WHERE email = @email');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    },
    create: async (userData) => {
        try {
            const pool = await connectDB();

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

            const result = await pool.request()
                .input('id', sql.VarChar(50), uuidv4())
                .input('username', sql.VarChar(50), userData.username)
                .input('email', sql.VarChar(100), userData.email)
                .input('password', sql.VarChar(255), hashedPassword)
                .input('full_name', sql.NVarChar(100), userData.full_name || '')
                .input('phone_number', sql.VarChar(20), userData.phone_number || '')
                .input('address', sql.NVarChar(sql.MAX), userData.address || '')
                .input('role', sql.VarChar(20), userData.role || 'user')
                .query(`
                    INSERT INTO users (id, username, email, password, full_name, phone_number, address, role)
                        OUTPUT INSERTED.*
                    VALUES (@id, @username, @email, @password, @full_name, @phone_number, @address, @role)
                `);

            return result.recordset[0];
        } catch (error) {
            console.error('Lỗi khi tạo người dùng:', error);
            throw error;
        }
    },
    async getAll({ page = 1, limit = 10, search = '', sortBy = 'title', sortOrder = 'asc' }) {
        try {
            const pool = await connectDB();

            let query = `
                SELECT
                    id,
                    username,
                    email,
                    full_name,
                    phone_number,
                    address,
                    role,
                    created_at,
                    updated_at
                FROM users
                WHERE 1=1
            `;
            const params = [];

            if (search) {
                query += ` AND (username LIKE @search OR email LIKE @search)`;
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

            const users = result.recordset;

            const countQuery = `SELECT COUNT(*) AS total_count FROM users WHERE 1=1`;
            const countResult = await pool.request().query(countQuery);
            const totalCount = countResult.recordset[0].total_count;

            const totalPages = Math.ceil(totalCount / limit);

            return {
                data: users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalItems: totalCount,
                    totalPages
                }
            };
        } catch (error) {
            console.error('Error in UserModel.getAll:', error);
            throw error;
        }
    },
    getById: async (id) => {
        try {
            const pool = await connectDB();
            let result = await pool.request()
                .input('id', sql.VarChar(50), id)
                .query('SELECT * FROM users WHERE id = @id');
            result.recordset[0].password = undefined;
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    },
    update: async (userId, updateData) => {
        try {
            const pool = await connectDB();

            let query = `
                UPDATE users
                SET 
                    username = @username,
                    email = @email,
                    full_name = @full_name,
                    phone_number = @phone_number,
                    address = @address,
                    role = @role,
                    updated_at = GETDATE()
            `;

            if (updateData.password) {
                query += `, password = @password`;
            }

            query += ` WHERE id = @id;`;

            const result = await pool.request()
                .input('id', sql.VarChar(50), userId)
                .input('username', sql.VarChar(50), updateData.username)
                .input('email', sql.VarChar(100), updateData.email)
                .input('full_name', sql.NVarChar(100), updateData.full_name || null)
                .input('phone_number', sql.VarChar(20), updateData.phone_number || null)
                .input('address', sql.NVarChar(sql.MAX), updateData.address || null)
                .input('role', sql.VarChar(20), updateData.role || null)
                .input('password', sql.VarChar(255), updateData.password || null)
                .query(query);

            return result.rowsAffected[0] > 0 ? { id: userId, ...updateData } : null;
        } catch (error) {
            console.error('Lỗi khi cập nhật người dùng:', error);
            throw error;
        }
    },
    delete: async (id) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.VarChar(50), id)
                .query('DELETE FROM users WHERE id = @id');

            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    },
    async getReviews({ page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'desc' }) {
        try {
            const pool = await connectDB();

            let query = `
                SELECT
                    r.id AS review_id,
                    r.user_id,
                    u.username,
                    u.email,
                    r.item_type,
                    r.product_id,
                    p.name AS product_name,
                    r.pet_id,
                    pt.name AS pet_name,
                    r.rating,
                    r.comment,
                    r.is_approved,
                    r.created_at
                FROM reviews r
                         LEFT JOIN users u ON r.user_id = u.id
                         LEFT JOIN products p ON r.product_id = p.id
                         LEFT JOIN pets pt ON r.pet_id = pt.id
                WHERE 1=1
            `;

            const params = [];

            if (search) {
                query += ` AND (u.username LIKE @search OR u.email LIKE @search)`;
                params.push({ name: 'search', value: `%${search}%` });
            }

            query += ` GROUP BY 
                    r.id, r.user_id, u.username, u.email, r.item_type, 
                    r.product_id, p.name, r.pet_id, pt.name, r.rating, 
                    r.comment, r.is_approved, r.created_at`;

            query += ` ORDER BY r.${sortBy} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;

            const offset = (page - 1) * limit;
            query += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

            const request = pool.request();
            params.forEach(param => {
                request.input(param.name, param.value);
            });

            const result = await request.query(query);
            const reviews = result.recordset;

            const countQuery = `SELECT COUNT(DISTINCT r.id) AS total_count FROM reviews r`;
            const countResult = await pool.request().query(countQuery);
            const totalCount = countResult.recordset[0].total_count;

            const totalPages = Math.ceil(totalCount / limit);

            return {
                data: reviews,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalItems: totalCount,
                    totalPages
                }
            };
        } catch (error) {
            console.error('Error in ReviewModel.getReviews:', error);
            throw error;
        }
    },
    deleteReview: async (id) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.VarChar(50), id)
                .query('DELETE FROM reviews WHERE id = @id');

            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = userModel;