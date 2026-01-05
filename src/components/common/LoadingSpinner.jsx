// src/components/common/LoadingSpinner.jsx
import React, { useState, useEffect } from 'react';

const SAO_HUA = [
  "正在同步异世界的信号...",
  "正在为纸片人老婆涂色...",
  "正在偷吃茶会上的小饼干...",
  "正在抓捕路过的野外程序员...",
  "正在链接星际贸易中心...",
  "正在尝试联系火星分站...",
  "正在加载 99.9%... 还差亿点点...",
  "正在献祭一枚硬币以加速...",
  "正在调整宇宙常数...",
  "正在躲避降智打击..."
];

const LoadingSpinner = () => {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    setQuote(SAO_HUA[Math.floor(Math.random() * SAO_HUA.length)]);
  }, []);

  return (
    <div className="flex items-center justify-center py-20 w-full animate-in fade-in duration-700">
      {/* 核心修正：纯白色 90% 不透明度背景，不再用毛玻璃 */}
      <div className="flex flex-col items-center p-12 bg-white/90 dark:bg-gray-800/95 border border-gray-100 dark:border-white/5 rounded-[48px] shadow-2xl">
        
        {/* 动画：几个点转圈并在底部抖动 */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 animate-spin-and-jiggle">
            <div className="flex flex-col items-center h-full justify-between py-1">
               {/* 这里的点排布与 index.html 一致 */}
               <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-lg"></div>
               <div className="flex space-x-6">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-lg"></div>
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-lg"></div>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center">
            <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.5em] mb-3">
                载入中
            </span>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 italic uppercase tracking-widest text-center">
              {quote}
            </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-and-jiggle {
          0% { transform: rotate(0deg); }
          70% { transform: rotate(360deg); }
          75% { transform: rotate(360deg) translateY(0); }
          80% { transform: rotate(360deg) translateY(8px); }
          85% { transform: rotate(360deg) translateY(-4px); }
          100% { transform: rotate(360deg) translateY(0); }
        }
        .animate-spin-and-jiggle {
          animation: spin-and-jiggle 1.5s infinite cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;