const sql = require('mssql');
require('dotenv').config();

// Cấu hình kết nối
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: 'pet_store', // Cập nhật thành tên database mới
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

// Tạo và xuất connection pool
let pool = null;

const connectDB = async () => {
  try {
    if (pool) {
      return pool;
    }
    pool = await new sql.ConnectionPool(config).connect();
    return pool;
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
};

module.exports = { sql, connectDB };