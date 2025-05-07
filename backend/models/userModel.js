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
    // Thêm hàm này vào userModel
    findByUsername: async (username) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('username', sql.NVarChar, username)
                .query('SELECT * FROM users WHERE username = @username');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    },
    create: async (userData) => {
        try {
            const pool = await connectDB();

            // Tạo ID mới theo định dạng "USR-XXXX"
            const result = await pool.request().query(`
                SELECT MAX(CAST(SUBSTRING(id, 5, LEN(id)-4) AS INT)) as maxNum
                FROM users
                WHERE id LIKE 'USR-%'
            `);
            
            let nextNum = 1;
            if (result.recordset[0].maxNum !== null) {
                nextNum = result.recordset[0].maxNum + 1;
            }
            
            const userId = `USR-${nextNum.toString().padStart(4, '0')}`;

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

            const insertResult = await pool.request()
                .input('id', sql.VarChar(50), userId)
                .input('username', sql.NVarChar(50), userData.username) // Thay đổi từ VarChar sang NVarChar
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

            return insertResult.recordset[0];
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
                params.push({ name: 'search', value: `%${search}%`, type: sql.NVarChar }); // Thêm kiểu dữ liệu
            }

            // Đảm bảo sortBy là cột hợp lệ để tránh SQL injection
            const validColumns = ['id', 'username', 'email', 'full_name', 'role', 'created_at', 'updated_at'];
            if (!validColumns.includes(sortBy)) {
                sortBy = 'created_at';
            }

            query += ` ORDER BY ${sortBy} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;

            const offset = (page - 1) * limit;
            query += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

            const request = pool.request();
            params.forEach(param => {
                if (param.type) {
                    request.input(param.name, param.type, param.value);
                } else {
                    request.input(param.name, param.value);
                }
            });

            const result = await request.query(query);

            // Chuẩn hóa Unicode cho kết quả
            const normalizedUsers = result.recordset.map(user => ({
                ...user,
                username: user.username ? user.username.normalize('NFC') : user.username,
                full_name: user.full_name ? user.full_name.normalize('NFC') : user.full_name,
                address: user.address ? user.address.normalize('NFC') : user.address
            }));

            const countQuery = `SELECT COUNT(*) AS total_count FROM users WHERE 1=1`;
            const countResult = await pool.request().query(countQuery);
            const totalCount = countResult.recordset[0].total_count;

            const totalPages = Math.ceil(totalCount / limit);

            return {
                data: normalizedUsers,
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
            const result = await pool.request()
                .input('id', sql.VarChar(50), id)
                .query('SELECT id, username, email, password, full_name, phone_number, address, role, created_at, updated_at FROM users WHERE id = @id');
            
            // Nếu tìm thấy user, chuẩn hóa các trường tiếng Việt
            if (result.recordset[0]) {
                const user = result.recordset[0];
                return {
                    ...user,
                    username: user.username ? user.username.normalize('NFC') : user.username,
                    full_name: user.full_name ? user.full_name.normalize('NFC') : user.full_name,
                    address: user.address ? user.address.normalize('NFC') : user.address
                };
            }
            return null;
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
                .input('username', sql.NVarChar(50), updateData.username) // Thay đổi từ VarChar sang NVarChar
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
    },
    // Thêm các phương thức mới

    // Lưu token đặt lại mật khẩu
    saveResetToken: async (userId, token, expiryDate) => {
        try {
            const pool = await connectDB();
            await pool.request()
                .input('userId', sql.VarChar(50), userId)
                .input('resetToken', sql.VarChar(255), token)
                .input('resetTokenExpiry', sql.DateTime, expiryDate)
                .query(`
                    UPDATE users
                    SET reset_token = @resetToken, reset_token_expiry = @resetTokenExpiry
                    WHERE id = @userId
                `);
            return true;
        } catch (error) {
            console.error('Lỗi khi lưu token đặt lại mật khẩu:', error);
            throw error;
        }
    },

    // Kiểm tra token đặt lại mật khẩu
    findUserByResetToken: async (token) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('token', sql.VarChar(255), token)
                .input('now', sql.DateTime, new Date())
                .query(`
                    SELECT id, username, email 
                    FROM users 
                    WHERE reset_token = @token 
                    AND reset_token_expiry > @now
                `);
            
            return result.recordset[0];
        } catch (error) {
            console.error('Lỗi khi kiểm tra token đặt lại mật khẩu:', error);
            throw error;
        }
    },

    // Cập nhật mật khẩu và xóa token
    updatePasswordAndClearToken: async (userId, hashedPassword) => {
        try {
            const pool = await connectDB();
            await pool.request()
                .input('userId', sql.VarChar(50), userId)
                .input('password', sql.VarChar(255), hashedPassword)
                .query(`
                    UPDATE users
                    SET password = @password, reset_token = NULL, reset_token_expiry = NULL
                    WHERE id = @userId
                `);
            return true;
        } catch (error) {
            console.error('Lỗi khi cập nhật mật khẩu:', error);
            throw error;
        }
    },

    // Thêm phương thức này vào userModel

    updatePassword: async (userId, hashedPassword) => {
        try {
            const pool = await connectDB();
            await pool.request()
                .input('userId', sql.VarChar(50), userId)
                .input('password', sql.VarChar(255), hashedPassword)
                .query(`
                    UPDATE users
                    SET password = @password
                    WHERE id = @userId
                `);
            return true;
        } catch (error) {
            console.error('Lỗi khi cập nhật mật khẩu:', error);
            throw error;
        }
    },

    // Thêm phương thức để cập nhật trạng thái duyệt của đánh giá

    // Cập nhật trạng thái đánh giá
    updateReviewApproval: async (id, isApproved) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('id', sql.VarChar(50), id)
                .input('is_approved', sql.Bit, isApproved)
                .query(`
                    UPDATE reviews
                    SET is_approved = @is_approved
                    WHERE id = @id
                `);

            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đánh giá:', error);
            throw error;
        }
    }
}

module.exports = userModel;