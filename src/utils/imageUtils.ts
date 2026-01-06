// src/utils/imageUtils.ts

const MAX_WIDTH = 1920; // 限制图片最大宽度
const QUALITY = 0.8;    // WebP 压缩质量

/**
 * 将 File 对象转换为 WebP 格式的 File 对象
 * 如果转换失败或浏览器不支持，则返回原始 File 对象
 * @param file 原始图片文件
 * @returns {Promise<{file: File, previewUrl: string}>} 返回包含新文件和预览 URL 的对象
 */
export const convertToWebP = (file: File): Promise<{ file: File, previewUrl:string }> => {
  return new Promise((resolve) => {
    // 检查文件类型，非图片直接返回
    if (!file.type.startsWith('image/')) {
      resolve({ file, previewUrl: URL.createObjectURL(file) });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // 计算缩放尺寸
        let { width, height } = img;
        if (width > MAX_WIDTH) {
          height = (MAX_WIDTH / width) * height;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // 如果无法获取 canvas context，直接返回原始文件
          resolve({ file, previewUrl: URL.createObjectURL(file) });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // 尝试转换为 WebP
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const webpFile = new File([blob], `${file.name.split('.')[0]}.webp`, {
                type: 'image/webp',
              });
              const previewUrl = URL.createObjectURL(webpFile);
              resolve({ file: webpFile, previewUrl });
            } else {
              // 如果 toBlob 失败（例如浏览器不支持），返回原始文件
              resolve({ file, previewUrl: URL.createObjectURL(file) });
            }
          },
          'image/webp',
          QUALITY
        );
      };

      img.onerror = () => {
        // 图片加载失败，返回原始文件
        resolve({ file, previewUrl: URL.createObjectURL(file) });
      };
    };

    reader.onerror = () => {
        // 文件读取失败，返回原始文件
        resolve({ file, previewUrl: URL.createObjectURL(file) });
    };
  });
};