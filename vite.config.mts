import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  root: 'client',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@client': path.resolve(__dirname, 'client'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  server: {
    port: 8080,
    proxy: {
      // 开发时将 API 请求代理到本地 NestJS 服务
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // NestJS 生产模式从 dist/client 读取前端产物
    outDir: '../dist/client',
    emptyOutDir: true,
  },
});
