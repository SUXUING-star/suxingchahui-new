// NotFound.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import anime from 'animejs';

const NotFound = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    anime({
      targets: '.not-found-content',
      translateY: [50, 0],
      opacity: [0, 1],
      duration: 1000,
      easing: 'spring(1, 80, 10, 0)'
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative">
      {/* 添加背景和模糊效果 */}
      <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm z-0" />
      
      <div className="not-found-content text-center relative z-10 w-full max-w-2xl">
        {/* 内容背景 */}
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-xl z-[-1]" />
        
        <div className="p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-200 mt-4">
              页面不见了
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              抱歉，您访问的页面似乎去冒险了
            </p>
          </div>

          <div className="space-x-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-6 py-2 text-sm font-medium rounded-md text-white
                       bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                       transform hover:-translate-y-0.5 transition-all duration-200"
            >
              返回首页
            </button>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-6 py-2 text-sm font-medium rounded-md
                       text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700
                       hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                       transform hover:-translate-y-0.5 transition-all duration-200"
            >
              返回上一页
            </button>
          </div>

          {/* 装饰性图案 - 改进视觉效果 */}
          <div className="mt-12 text-gray-200 dark:text-gray-700 text-9xl font-mono 
                        absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10 
                        opacity-20 select-none pointer-events-none blur-sm">
            {'</>'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;