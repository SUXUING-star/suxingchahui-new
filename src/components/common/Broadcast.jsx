// /src/components/common/Broadcast.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import anime from 'animejs';

const Broadcast = () => {
  const [isVisible, setIsVisible] = useState(false); // 初始设为 false
  const containerRef = useRef(null);
  const isFirstVisit = useRef(true); // 使用 useRef 来追踪是否是首次访问

  useEffect(() => {
    // 检查是否是首次访问
    const hasVisited = localStorage.getItem('hasVisited');
    
    if (!hasVisited && isFirstVisit.current) {
      isFirstVisit.current = false; // 标记已经不是首次访问
      
      // 显示组件并执行入场动画
      setIsVisible(true);
      if (containerRef.current) {
        anime({
          targets: containerRef.current,
          translateY: [50, 0],
          opacity: [0, 1],
          duration: 800,
          easing: 'spring(1, 80, 10, 0)',
          begin: () => {
            containerRef.current.style.display = 'block';
          }
        });
      }

      // 10秒后自动关闭
      const timer = setTimeout(() => {
        handleClose();
      }, 10000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    if (containerRef.current) {
      // 执行退场动画
      anime({
        targets: containerRef.current,
        translateY: [0, 50],
        opacity: [1, 0],
        duration: 800,
        easing: 'spring(1, 80, 10, 0)',
        complete: () => {
          setIsVisible(false);
          localStorage.setItem('hasVisited', 'true');
        }
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-24 left-0 right-0 mx-auto px-4 sm:px-6 z-50"
      style={{ 
        opacity: 0, // 初始透明度为0
        transform: 'translateY(50px)' // 初始位置在下方
      }}
    >
      <div className="max-w-lg mx-auto sm:max-w-xl md:max-w-2xl w-full">
        <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg shadow-lg p-4">
          <div className="flex items-start">
            {/* 图标 */}
            <div className="flex-shrink-0 hidden sm:block">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>

            {/* 内容 */}
            <div className="flex-1 sm:ml-3">
              <p className="text-sm sm:text-base text-blue-800 dark:text-blue-200">
                欢迎来到宿星茶会！游戏的下载链接已被自动加密.
                <br/>
                需要通过密码进行解密得到真实的链接，这个密码你懂的.我会在其他平台发布出来。
                <br/>
                在每篇文章的底部会有解密链接的按钮，点击后输入密码即可解密链接.
              </p>
            </div>

            {/* 关闭按钮 */}
            <button
              onClick={handleClose}
              className="ml-2 sm:ml-4 flex-shrink-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 进度条 */}
          <div className="mt-2 w-full bg-blue-200 dark:bg-blue-700 rounded-full h-1">
            <div
              className="bg-blue-600 dark:bg-blue-400 h-1 rounded-full transition-all duration-[10000ms] ease-linear"
              style={{ width: '100%', animation: 'shrink 10s linear forwards' }}
            />
          </div>
        </div>
      </div>

      {/* 添加动画样式 */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Broadcast;