// components/common/LoadingSpinner.jsx
import React from 'react';

// 简化版加载组件，保持与 SplashScreen 视觉一致性
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 relative">
        <div className="absolute inset-0 border-4 border-teal-400 rounded-full animate-spin" />
        <div className="absolute inset-2 border-4 border-teal-500 rounded-full animate-spin-reverse" />
        <div className="absolute inset-4 border-4 border-teal-600 rounded-full animate-pulse" />
        
        {/* 脉冲效果 */}
        <div className="absolute inset-6 animate-ping opacity-20">
          <div className="w-full h-full bg-teal-400 rounded-full" />
        </div>
      </div>
      
      {/* 加载文本 */}
      <div className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">
        加载中...
      </div>
    </div>
  </div>
);

export default LoadingSpinner;