// src/components/layout/BackgroundLayout.jsx
import React, { useState, useEffect } from 'react';
import { useLayout } from '../../context/LayoutContext';
import defaultBg from '../../assets/bg.jpg';

const BackgroundLayout = ({ children }) => {
  const { customBg } = useLayout();
  const [activeBg, setActiveBg] = useState(defaultBg);
  const [showCustom, setShowCustom] = useState(false);

  // 监听全局背景变化
  useEffect(() => {
    if (customBg) {
      const img = new Image();
      img.src = customBg;
      img.onload = () => {
        setActiveBg(customBg);
        setShowCustom(true);
      };
    } else {
      setShowCustom(false);
      // 延迟重置背景图，等待淡出动画（300ms 对应下面的 duration-300）完成
      const timer = setTimeout(() => {
        setActiveBg(defaultBg);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [customBg]);

  const commonImgClass = "fixed inset-0 background-size-cover background-position-center transition-all duration-700 z-[-2] dark:brightness-[0.85] dark:contrast-110 dark:saturate-75";

  const commonStyle = {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* 1. 基础底层：始终是默认背景 */}
      <div
        className={commonImgClass}
        style={{
          ...commonStyle,
          backgroundImage: `url(${defaultBg})`,
          opacity: 1 // 底层始终 100% 不透明
        }}
        aria-hidden="true"
      />

      {/* 2. 动态顶层：自定义封面背景 (仅在 PostDetail 时浮现) */}
      <div
        className={`${commonImgClass} ease-in-out`}
        style={{
          ...commonStyle,
          backgroundImage: `url(${activeBg})`,
          // 核心衔接：根据状态控制透明度，并加入你喜欢的 scale 动态感
          opacity: showCustom ? 1 : 0,
          transform: showCustom ? 'scale(1)' : 'scale(1.05)'
        }}
        aria-hidden="true"
      />
      
      {/* 3. 核心修正：完全还原你原本的背景蒙层参数 */}
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