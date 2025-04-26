import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Thêm /api vào baseURL
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;