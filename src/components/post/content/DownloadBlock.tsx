import React, { useRef } from 'react';
import { Download, Lock, ChevronRight, ExternalLink } from 'lucide-react';
import anime from 'animejs';

interface DownloadBlockProps {
  description: string;
  url: string;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

const DownloadBlock: React.FC<DownloadBlockProps> = ({ 
  description, 
  url, 
  isAuthenticated, 
  onAuthRequired 
}) => {
  const actionBoxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    // 右侧小方块变宽/变色
    anime({
      targets: actionBoxRef.current,
      backgroundColor: isAuthenticated ? 'rgba(37, 99, 235, 1)' : 'rgba(220, 38, 38, 1)', // 蓝 or 红
      width: ['100px', '160px'],
      duration: 400,
      easing: 'easeOutQuart'
    });

    // 文字滑入
    anime({
      targets: textRef.current,
      opacity: [0, 1],
      translateX: [20, 0],
      duration: 400,
      delay: 100,
      easing: 'easeOutQuart'
    });

    // 图标微动
    anime({
      targets: iconRef.current,
      rotate: isAuthenticated ? [0, 15, 0] : 0,
      scale: [1, 1.1, 1],
      duration: 600,
      easing: 'easeInOutSine'
    });
  };

  const handleMouseLeave = () => {
    anime({
      targets: actionBoxRef.current,
      backgroundColor: 'rgba(59, 130, 246, 0.1)', // 回到极淡的蓝色
      width: '100px',
      duration: 300,
      easing: 'easeInQuad'
    });

    anime({
      targets: textRef.current,
      opacity: 0,
      translateX: 20,
      duration: 200,
      easing: 'easeInQuad'
    });
  };

  const handleClick = () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="group relative my-6 flex items-center justify-between p-2 pl-6 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[24px] hover:bg-white dark:hover:bg-white/10 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* 左侧：静态描述 */}
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="flex-shrink-0 p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
          <Download size={22} />
        </div>
        <div className="truncate">
          <h4 className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight truncate">
            {description}
          </h4>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">
            Resource Ready to Fetch
          </p>
        </div>
      </div>

      {/* 右侧：交互槽位 */}
      <div 
        ref={actionBoxRef}
        className="h-14 w-[100px] flex items-center justify-center rounded-[18px] bg-blue-500/10 transition-colors duration-300 relative"
      >
        <div className="flex items-center justify-center space-x-2 px-4">
          {/* 隐藏的文字，Hover出现 */}
          <div ref={textRef} className="opacity-0 whitespace-nowrap overflow-hidden pointer-events-none">
             <span className="text-[11px] font-black text-white uppercase tracking-wider">
               {isAuthenticated ? '立即前往' : '登录可见'}
             </span>
          </div>
          
          {/* 图标 */}
          <div ref={iconRef} className="text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors">
            {isAuthenticated ? <ExternalLink size={18} /> : <Lock size={18} />}
          </div>
        </div>
      </div>

      {/* 极简装饰线 */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-500 group-hover:w-full transition-all duration-700 ease-out" />
    </div>
  );
};

export default DownloadBlock;