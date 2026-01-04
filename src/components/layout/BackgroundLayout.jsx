// /src/components/layout/BackgroundLayout.jsx
import React, { useState, useEffect } from 'react';
import bgImage from '../../assets/bg.jpg';

const BackgroundLayout = ({ children }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [bgImgStyle, setBgImgStyle] = useState({
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    opacity: 0
  });
  
  useEffect(() => {
    const img = new Image();
    img.src = bgImage;
    img.onload = () => {
      setBgImgStyle(prev => ({
        ...prev,
        backgroundImage: `url(${bgImage})`,
        opacity: 1,
      }));
      setIsImageLoaded(true);
    };

    const handleResize = () => {
      setBgImgStyle(prev => ({
        ...prev,
        backgroundSize: 'cover'
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative min-h-screen w-full">
      {/* 优化背景图片层 - 添加暗色模式滤镜效果 */}
      <div
        className="fixed inset-0 transition-all duration-700 z-[-2] 
                   dark:brightness-[0.85] dark:contrast-110 dark:saturate-75"
        style={bgImgStyle}
        aria-hidden="true"
      />
      
      {/* 优化背景蒙层 - 调整暗色模式下的透明度 */}
      <div 
        className="fixed inset-0 bg-black/20 dark:bg-black/50 
                   backdrop-blur-[2px] dark:backdrop-blur-[2.5px] 
                   transition-all duration-300 z-[-1]"
        aria-hidden="true"
      />

      {/* 内容区域 */}
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
};

export default BackgroundLayout;