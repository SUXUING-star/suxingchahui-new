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
        
        {/* 高级流光环容器 */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* 核心光束：拖尾逐渐透明变细 */}
          <div className="absolute inset-0 rounded-full loader-sunlight"></div>
          {/* 模糊光晕：模拟阳光的散射感 */}
          <div className="absolute inset-0 rounded-full loader-sunlight-blur"></div>
        </div>

        <div className="mt-10 flex flex-col items-center">
            <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.5em] mb-3">
                载入中
            </span>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 italic uppercase tracking-widest text-center">
              {quote}
            </p>
        </div>
      </div>

      {/* 纯 CSS 绘制的流光与蒙版 */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* 核心流光层 */
        .loader-sunlight {
          background: conic-gradient(from 180deg at 50% 50%, transparent 0%, transparent 40%, rgba(59, 130, 246, 0.3) 70%, rgba(59, 130, 246, 1) 100%);
          /* 掏空中间，形成线条感 */
          -webkit-mask: radial-gradient(transparent 58%, #000 59%);
          mask: radial-gradient(transparent 58%, #000 59%);
          animation: spin-sunlight 1.2s linear infinite;
        }
        
        /* 头部耀眼的光球 (像彗星头) */
        .loader-sunlight::after {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 12%;
          height: 12%;
          background: #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 12px 3px rgba(59, 130, 246, 0.9);
        }

        /* 外围模糊散射层 (不是刺眼的激光，是柔和的阳光) */
        .loader-sunlight-blur {
          background: conic-gradient(from 180deg at 50% 50%, transparent 0%, transparent 30%, rgba(59, 130, 246, 0.2) 60%, rgba(59, 130, 246, 0.7) 100%);
          -webkit-mask: radial-gradient(transparent 45%, #000 46%);
          mask: radial-gradient(transparent 45%, #000 46%);
          filter: blur(6px);
          animation: spin-sunlight 1.2s linear infinite;
        }

        @keyframes spin-sunlight {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default LoadingSpinner;