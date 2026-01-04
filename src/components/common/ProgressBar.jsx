import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // 检查是否正在显示 SplashScreen
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (!hasVisited) return;

    // 当路由变化时显示进度条
    setIsVisible(true);
    setProgress(0);

    const timer = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 90) {
          clearInterval(timer);
          return 90;
        }
        return prevProgress + 10;
      });
    }, 100);

    const completeTimer = setTimeout(() => {
      setProgress(100);
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(hideTimer);
    }, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(completeTimer);
    };
  }, [location]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div 
        className="h-1 transition-all duration-300 ease-out"
        style={{ 
          width: `${progress}%`,
          backgroundImage: 'linear-gradient(to right, #60a5fa, #3b82f6, #6366f1)'
        }}
      />
    </div>
  );
};

export default ProgressBar;