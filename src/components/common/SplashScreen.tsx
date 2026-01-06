import React, { useState, useEffect } from 'react';

const SplashScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  // 琴弦数量
  const stringCount = 8;
  const strings = Array.from({ length: stringCount });

  useEffect(() => {
    // 移除初始加载动画
    const initialLoader = document.getElementById('initial-loader');
    if (initialLoader) {
      initialLoader.classList.add('hide');
      setTimeout(() => {
        initialLoader.remove();
      }, 500);
    }

    const hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      setIsLoading(false);
      return;
    }

    // 模拟资源加载进度
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
              setIsLoading(false);
              sessionStorage.setItem('hasVisited', 'true');
            }, 500);
          }, 300);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  if (!isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#e0f7fa' }}
    >
      {/* 背景琴弦动画 */}
      <div className="absolute inset-0 flex justify-around opacity-30">
        {strings.map((_, index) => (
          <div
            key={index}
            className="relative h-full"
            style={{
              animation: `stringWave ${2 + index * 0.5}s ease-in-out infinite`,
              animationDelay: `${index * 0.2}s`
            }}
          >
            <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-teal-400 to-transparent" />
          </div>
        ))}
      </div>

      {/* Logo动画 */}
      <div className="mb-8 relative z-10">
        <div className="w-24 h-24 relative">
          <div className="absolute inset-0 border-4 border-teal-400 rounded-full animate-spin" />
          <div className="absolute inset-2 border-4 border-teal-500 rounded-full animate-spin-reverse" />
          <div className="absolute inset-4 border-4 border-teal-600 rounded-full animate-pulse" />
          
          {/* 旋转的科技感粒子 */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="absolute w-2 h-2 bg-teal-400 rounded-full transform"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${index * 120}deg) translateY(-36px)`,
                  filter: 'blur(1px)',
                  opacity: 0.6,
                }}
              />
            ))}
          </div>

          {/* 反向旋转的粒子组 */}
          <div className="absolute inset-0 animate-spin-reverse" style={{ animationDuration: '4s' }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="absolute w-1.5 h-1.5 bg-teal-300 rounded-full transform"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${index * 90}deg) translateY(-40px)`,
                  filter: 'blur(1px)',
                  opacity: 0.4,
                }}
              />
            ))}
          </div>

          {/* 脉冲效果 */}
          <div className="absolute inset-8 animate-ping opacity-20">
            <div className="w-full h-full bg-teal-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* 加载进度文本 */}
      <div className="text-2xl font-bold text-gray-800 mb-4 animate-pulse relative z-10">
        Loading...
      </div>

      {/* 进度条 */}
      <div className="w-64 h-2 bg-gray-300 rounded-full overflow-hidden relative z-10">
        <div
          className="h-full bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* 加载百分比 */}
      <div className="mt-2 text-gray-600 relative z-10">
        {Math.min(Math.round(progress), 100)}%
      </div>
    </div>
  );
};

// 添加自定义动画
const style = document.createElement('style');
style.textContent = `
  @keyframes spin-reverse {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }
  .animate-spin-reverse {
    animation: spin-reverse 3s linear infinite;
  }

  @keyframes stringWave {
    0%, 100% {
      transform: translateX(0) scaleY(0.95);
    }
    50% {
      transform: translateX(8px) scaleY(1.05);
    }
  }
`;
document.head.appendChild(style);

export default SplashScreen;