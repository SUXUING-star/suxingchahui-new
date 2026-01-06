import React, { useState, useEffect, ReactNode } from 'react';
import { useLayout } from '../../context/LayoutContext';
import defaultBg from '../../assets/bg.jpg';

interface BackgroundLayoutProps {
  children: ReactNode;
}

const BackgroundLayout: React.FC<BackgroundLayoutProps> = ({ children }) => {
  const { customBg } = useLayout();
  const [activeBg, setActiveBg] = useState<string>(defaultBg);
  const [showCustom, setShowCustom] = useState<boolean>(false);

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
      const timer = setTimeout(() => {
        setActiveBg(defaultBg);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [customBg]);

  const commonImgClass = "fixed inset-0 bg-cover bg-center transition-all duration-700 z-[-2] dark:brightness-[0.85] dark:contrast-110 dark:saturate-75";

  const commonStyle: React.CSSProperties = {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="relative min-h-screen w-full">
      <div
        className={commonImgClass}
        style={{
          ...commonStyle,
          backgroundImage: `url(${defaultBg})`,
          opacity: 1
        }}
        aria-hidden="true"
      />

      <div
        className={`${commonImgClass} ease-in-out`}
        style={{
          ...commonStyle,
          backgroundImage: `url(${activeBg})`,
          opacity: showCustom ? 1 : 0,
          transform: showCustom ? 'scale(1)' : 'scale(1.05)'
        }}
        aria-hidden="true"
      />
      
      <div 
        className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-[2px] dark:backdrop-blur-[2.5px] transition-all duration-300 z-[-1]"
        aria-hidden="true"
      />

      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
};

export default BackgroundLayout;