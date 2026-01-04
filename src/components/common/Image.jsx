// src/components/common/Image.jsx
import React, { useState } from 'react';
import { toAbsoluteUrl } from '../../utils/imageUtils'; // 引入 toAbsoluteUrl 工具函数

/**
 * 通用图片显示组件，处理 R2 相对路径到绝对 URL 的转换。
 * 具备加载失败时的占位符显示。
 * @param {object} props - 组件属性
 * @param {string} props.src - 图片的相对路径（如 'posts/slug/image.webp'）或绝对 URL
 * @param {string} [props.alt=''] - 图片的替代文本
 * @param {string} [props.className=''] - 应用于 img 标签的 CSS 类名
 * @param {object} [props...] - 其他传递给 img 标签的标准属性
 */
const Image = ({ src, alt = '', className = '', ...props }) => {
  const [hasError, setHasError] = useState(false);

  // 将传入的 src 转换为完整的绝对 URL
  const finalSrc = toAbsoluteUrl(src);

  const handleError = () => {
    console.error('Image failed to load:', src); // 记录原始 src
    setHasError(true);
  };

  if (hasError || !finalSrc) {
    // 图片加载失败或 src 为空时显示占位符
    return (
      <div className={`w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-xs">Image Load Error</span>
      </div>
    );
  }

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default Image;