// vite.config.js
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
          // 工具函数
          'utils': [
            './src/utils/markdownUtils',
            './src/utils/imageUtils',
            './src/utils/postUtils'
          ],
          // 布局组件
          'layout': [
            './src/components/layout/Header',
            './src/components/layout/Footer',
            './src/components/layout/LeftSidebar',
            './src/components/layout/RightSidebar',
            './src/components/layout/BackgroundLayout'
          ],
          // 通用组件
          'common': [
            './src/components/common/LoadingSpinner',
            './src/components/common/Broadcast',
            './src/components/common/ProgressBar',
            './src/components/common/SplashScreen'
          ]
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