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
          // 工具函数 (假设你以后会把它们改成 .ts)
          'utils': [
            './src/utils/markdownUtils.ts',
            './src/utils/imageUtils.ts',
            './src/utils/postUtils.ts'
          ],
          // 布局组件 (假设你以后会把它们改成 .tsx)
          'layout': [
            './src/components/layout/Header.tsx',
            './src/components/layout/Footer.tsx',
            './src/components/layout/LeftSidebar.tsx',
            './src/components/layout/RightSidebar.tsx',
            './src/components/layout/BackgroundLayout.tsx'
          ],
          // 通用组件 (假设你以后会把它们改成 .tsx)
          'common': [
            './src/components/common/LoadingSpinner.tsx',
            './src/components/common/Broadcast.tsx',
            './src/components/common/ProgressBar.tsx',
            './src/components/common/SplashScreen.tsx'
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