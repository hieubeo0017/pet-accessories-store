const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const emailController = require('./emailController');

exports.register = async (req, res) => {
    try {
        const { username, email, password, full_name, phone_number, address } = req.body;
        
        // Kiểm tra username đã tồn tại
        const existingUsername = await userModel.findByUsername(username);
        if (existingUsername) {
            return res.status(400).json({ 
                success: false,
                message: 'Tên người dùng đã tồn tại, vui lòng chọn tên khác' 
            });
        }
        
        // Kiểm tra email đã tồn tại
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'Email đã tồn tại' 
            });
        }
        
        // Chuẩn hóa dữ liệu tiếng Việt
        const normalizedData = {
            username: username ? username.normalize('NFC') : username,
            email,
            password,
            full_name: full_name ? full_name.normalize('NFC') : full_name,
            phone_number,
            address: address ? address.normalize('NFC') : address,
            role: 'user' // Đặt role mặc định là user
        };
        
        // Tạo user với đầy đủ thông tin
        const user = await userModel.create(normalizedData);
        
        // Loại bỏ password trước khi trả về
        const { password: _, ...userWithoutPassword } = user;
        
        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ 
            success: false,
            message: error.message || 'Đã xảy ra lỗi khi đăng ký' 
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Email hoặc mật khẩu không chính xác' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Email hoặc mật khẩu không chính xác' 
            });
        }

        // Chuẩn hóa dữ liệu người dùng
        const normalizedUser = {
            ...user,
            username: user.username ? user.username.normalize('NFC') : user.username,
            full_name: user.full_name ? user.full_name.normalize('NFC') : user.full_name,
            address: user.address ? user.address.normalize('NFC') : user.address
        };

        // Loại bỏ mật khẩu khỏi thông tin trả về
        const { password: _, ...userWithoutPassword } = normalizedUser;

        // Tạo JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your-default-secret-key', { expiresIn: '1h' });

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Đã xảy ra lỗi khi đăng nhập' 
        });
    }
};

// Thêm phương thức xử lý yêu cầu quên mật khẩu
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        console.log(`Received forgot password request for email: ${email}`);
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp địa chỉ email'
            });
        }
        
        // Kiểm tra email có tồn tại trong hệ thống
        const user = await userModel.findByEmail(email);
        
        // Log để debug
        console.log(`User found for email ${email}: ${user ? 'Yes' : 'No'}`);
        
        // Không tiết lộ liệu email có tồn tại hay không (bảo mật)
        if (!user) {
            console.log(`Email ${email} không tồn tại trong hệ thống`);
            return res.status(200).json({
                success: true,
                message: 'Nếu email tồn tại trong hệ thống, mật khẩu mới sẽ được gửi đến email của bạn'
            });
        }
        
        // Tạo mật khẩu mới ngẫu nhiên (8 ký tự)
        const newPassword = Math.random().toString(36).slice(-8);
        
        // Mã hóa mật khẩu mới
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Cập nhật mật khẩu trong database
        await userModel.updatePassword(user.id, hashedPassword);
        
        try {
            // Gửi email chứa mật khẩu mới
            await emailController.sendNewPasswordEmail(email, newPassword);
            console.log(`Email mật khẩu mới đã được gửi thành công đến ${email}`);
        } catch (emailError) {
            console.error('Lỗi khi gửi email:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Đã có lỗi xảy ra khi gửi email, vui lòng thử lại sau'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Nếu email tồn tại trong hệ thống, mật khẩu mới sẽ được gửi đến email của bạn'
        });
        
    } catch (error) {
        console.error('Lỗi khi xử lý quên mật khẩu:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
};

// Thêm phương thức để kiểm tra tính hợp lệ của token
exports.verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token không hợp lệ'
            });
        }
        
        const user = await userModel.findUserByResetToken(token);
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token đã hết hạn hoặc không hợp lệ'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Token hợp lệ',
            email: user.email
        });
        
    } catch (error) {
        console.error('Lỗi khi xác thực token:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
};

// Thêm phương thức để đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        
        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin cần thiết'
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 6 ký tự'
            });
        }
        
        const user = await userModel.findUserByResetToken(token);
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token đã hết hạn hoặc không hợp lệ'
            });
        }
        
        // Mã hóa mật khẩu mới
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Cập nhật mật khẩu và xóa token
        await userModel.updatePasswordAndClearToken(user.id, hashedPassword);
        
        res.status(200).json({
            success: true,
            message: 'Mật khẩu đã được đặt lại thành công, bạn có thể đăng nhập với mật khẩu mới'
        });
        
    } catch (error) {
        console.error('Lỗi khi đặt lại mật khẩu:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
        });
    }
};