import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Không cần biến app nữa vì chỉ còn frontend
const config = {
  root: './frontend',
  port: 3000,
  outDir: './frontend/dist',
  alias: { '@': resolve(__dirname, 'frontend/src') }
};

export default defineConfig({
  plugins: [react()],
  root: config.root,
  server: {
    port: config.port,
    open: true,
    // Thêm cấu hình proxy để kết nối với backend
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: config.outDir,
  },
  resolve: {
    alias: config.alias
  },
});