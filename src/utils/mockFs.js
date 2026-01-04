// src/utils/mockFs.js
const postsFiles = import.meta.glob('/src/posts/**/index.md', { eager: true, as: 'raw' });
const imageFiles = import.meta.glob('/src/posts/**/*.{png,jpg,jpeg,gif,svg,webp}', { eager: true });

window.fs = {
  async readdir(dirPath) {
    try {
      dirPath = dirPath.replace(/^\//, '');
      const directories = new Set();
      
      Object.keys(postsFiles).forEach(file => {
        // 修改匹配方式，支持所有类型的文件夹名
        const match = file.match(/\/src\/posts\/([^/]+)\/index\.md$/);
        if (match) {
          directories.add(match[1]);
        }
      });
      
      return Array.from(directories);
    } catch (error) {
      console.error('Error reading directory:', error);
      throw new Error('Directory not found');
    }
  },

  // readFile 函数保持不变
  async readFile(filePath, options = {}) {
    try {
      filePath = filePath.replace(/^\//, '');
      
      // 处理 Markdown 文件
      const mdKey = Object.keys(postsFiles).find(key => key.endsWith(filePath));
      if (mdKey && postsFiles[mdKey]) {
        return postsFiles[mdKey];
      }
      
      // 处理图片文件
      const imgKey = Object.keys(imageFiles).find(key => key.endsWith(filePath));
      if (imgKey && imageFiles[imgKey]) {
        return imageFiles[imgKey];
      }

      throw new Error('File not found');
    } catch (error) {
      console.error('Error reading file:', error, filePath);
      throw new Error('File not found');
    }
  }
};

export default window.fs;