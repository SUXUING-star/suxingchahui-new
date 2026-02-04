// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 相关
          'vendor-react': [
            'react',
            'react-dom',
            'react/jsx-runtime',
            'react-router-dom',
            'react-router'
          ],
          // Markdown 相关
          'vendor-markdown': ['marked'],
          // 动画相关
          'vendor-anime': ['animejs'],
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    chunkSizeWarningLimit: 800
  }
});