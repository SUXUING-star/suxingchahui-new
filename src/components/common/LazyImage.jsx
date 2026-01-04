// src/components/common/LazyImage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';

// 内存缓存：记录本页面生命周期内已加载成功的 URL
const imageCache = new Set();

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  wrapperClassName = '', 
  objectFit = 'object-cover',
  fullHeight = true 
}) => {
  const [isLoaded, setIsLoaded] = useState(imageCache.has(src));
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  const handleLoad = () => {
    if (src) imageCache.add(src);
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  useEffect(() => {
    // 每次 src 变化，先重置状态
    if (imageCache.has(src)) {
      setIsLoaded(true);
      setHasError(false);
      return;
    }

    setIsLoaded(false);
    setHasError(false);

    // 核心探测逻辑：处理浏览器缓存或刷新时的“瞬时加载”情况
    if (imgRef.current && imgRef.current.complete) {
      handleLoad();
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-gray-50 dark:bg-gray-800/50 ${wrapperClassName} ${fullHeight ? 'h-full' : ''}`}>
      
      {/* 1. 加载中状态：骨架屏 + 居中转圈圈 */}
      {!isLoaded && !hasError && (
        <div className={`absolute inset-0 z-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 transition-opacity duration-300 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex flex-col items-center space-y-2">
            {/* 这里的 Spinner 是点睛之笔 */}
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin opacity-50" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">载入中</span>
          </div>
        </div>
      )}

      {/* 2. 错误状态 */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 bg-gray-50 dark:bg-gray-800">
          <ImageIcon size={32} />
          <span className="text-[10px] font-black mt-2 uppercase">加载失败</span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          className={`
            transition-all duration-700 ease-out
            ${objectFit} 
            ${fullHeight ? 'w-full h-full' : 'w-full h-auto block'} 
            ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-lg'}
            ${className}
          `}
        />
      )}
    </div>
  );
};

export default LazyImage;