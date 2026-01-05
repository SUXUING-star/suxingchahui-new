// 定义 Vite glob 导入的类型
interface ViteGlobRaw {
  [key: string]: string;
}

const postsFiles = import.meta.glob('/src/posts/**/index.md', { eager: true, as: 'raw' }) as ViteGlobRaw;
const imageFiles = import.meta.glob('/src/posts/**/*.{png,jpg,jpeg,gif,svg,webp}', { eager: true });

// 扩展全局对象
declare global {
  interface Window {
    fs: any;
  }
}

const fs = {
  async readdir(dirPath: string) {
    dirPath = dirPath.replace(/^\//, '');
    const directories = new Set<string>();
    Object.keys(postsFiles).forEach(file => {
      const match = file.match(/\/src\/posts\/([^/]+)\/index\.md$/);
      if (match) directories.add(match[1]);
    });
    return Array.from(directories);
  },

  async readFile(filePath: string) {
    filePath = filePath.replace(/^\//, '');
    const mdKey = Object.keys(postsFiles).find(key => key.endsWith(filePath));
    if (mdKey) return postsFiles[mdKey];
    throw new Error('File not found');
  }
};

window.fs = fs;
export default fs;