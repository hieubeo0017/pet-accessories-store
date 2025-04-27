const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { connectDB } = require('./config/database');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Cấu hình CORS cho phép frontend truy cập API upload
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Phục vụ thư mục uploads như static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Import routes

const categoryRoutes = require('./routes/categoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const brandRoutes = require('./routes/brandRoutes');
const productRoutes = require('./routes/productRoutes');
const petRoutes = require('./routes/petRoutes');
const emailRoutes = require('./routes/emailRoutes'); // Add this line
const authRoutes = require('./routes/authRoutes'); // Add this line
const blogRoutes = require('./routes/blogRoutes'); // Add this line
const userRoutes = require('./routes/userRouters'); // Add this line
const reviewRoutes = require('./routes/reviewRouters'); // Add this line

// Kết nối database
connectDB()
  .then(() => console.log('SQL Server connected'))
  .catch(err => console.error('SQL Server connection error:', err));

// Routes

app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/email', emailRoutes); // Add this line
app.use('/api/auth', authRoutes)
app.use('/api/blogs', blogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.send('API đang chạy');
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query('SELECT 1 as testValue');
    res.json({
      success: true,
      message: 'Kết nối database thành công!',
      data: result.recordset[0]
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Kết nối database thất bại!',
      error: err.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng ${PORT}`);
});

module.exports = app;