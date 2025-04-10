import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    // port không cần chỉ định, Vite sẽ dùng 5173 làm mặc định
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});