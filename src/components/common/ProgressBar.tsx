import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ProgressBar: React.FC = () => {
  const [progress, setProgress] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (!hasVisited) return;

    setIsVisible(true);
    setProgress(0);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(timer);
          return 90;
        }
        return prev + 10;
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

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[110]">
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