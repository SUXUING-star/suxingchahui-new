import React, { useState, useEffect, useRef } from 'react';
import { ImageIcon, Loader2, RefreshCw } from 'lucide-react';

// 图片缓存，防止同一张图在不同组件重复触发动画
const imageCache = new Set<string>();

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  objectFit?: 'object-cover' | 'object-contain' | 'object-fill';
  fullHeight?: boolean;
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  wrapperClassName = '', 
  objectFit = 'object-cover',
  fullHeight = true 
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(imageCache.has(src));
  const [hasError, setHasError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const optimizedSrc = retryCount > 0 
    ? `${src}${src.includes('?') ? '&' : '?'}retry=${retryCount}` 
    : src;

  const handleLoad = () => {
    if (src) imageCache.add(src);
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasError(false);
    setIsLoaded(false);
    setRetryCount(prev => prev + 1);
  };

  useEffect(() => {
    if (imageCache.has(src)) {
      setIsLoaded(true);
      setHasError(false);
      return;
    }
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-gray-50 dark:bg-gray-800/50 ${wrapperClassName} ${fullHeight ? 'h-full' : ''}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin opacity-50" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">载入中...</span>
          </div>
        </div>
      )}

      {hasError ? (
        <button 
          onClick={handleRetry}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 bg-gray-50 dark:bg-gray-800 transition-colors group"
        >
          <div className="relative">
             <ImageIcon size={32} className="group-hover:opacity-20 transition-opacity" />
             <RefreshCw size={24} className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity animate-spin" />
          </div>
          <span className="text-[10px] font-black mt-2 uppercase tracking-tighter">加载失败，点击重试</span>
        </button>
      ) : (
        <img
          ref={imgRef}
          src={optimizedSrc}
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