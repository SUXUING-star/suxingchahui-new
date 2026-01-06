import React, { useState, useEffect } from 'react';

const SAO_HUA: readonly string[] = [
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

const LoadingSpinner: React.FC = () => {
  const [quote, setQuote] = useState<string>("");

  useEffect(() => {
    setQuote(SAO_HUA[Math.floor(Math.random() * SAO_HUA.length)]);
  }, []);

  return (
    <div className="flex items-center justify-center py-20 w-full animate-in fade-in duration-700">
      <div className="flex flex-col items-center p-12 bg-white/90 dark:bg-gray-800/95 border border-gray-100 dark:border-white/5 rounded-[48px] shadow-2xl">
        <div className="relative w-16 h-16 animate-spin-and-jiggle">
          <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full shadow-lg top-0 left-1/2 -translate-x-1/2"></div>
          <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full shadow-lg bottom-0 left-[20%]"></div>
          <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full shadow-lg bottom-0 right-[20%]"></div>
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

      {/* 关键：行内定义动画，不污染全局 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-and-jiggle {
          0% { transform: rotate(0deg); }
          70% { transform: rotate(360deg); }
          75% { transform: rotate(360deg) translateY(0); }
          80% { transform: rotate(360deg) translateY(10px); }
          85% { transform: rotate(360deg) translateY(-5px); }
          90% { transform: rotate(360deg) translateY(2px); }
          100% { transform: rotate(360deg) translateY(0); }
        }
        .animate-spin-and-jiggle {
          animation: spin-and-jiggle 1.5s infinite cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}} />
    </div>
  );
};

export default LoadingSpinner;