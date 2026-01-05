import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * BackToTop - 回到顶部组件
 */
const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // 滚动监听函数
    const toggleVisibility = () => {
      // 现代浏览器建议使用 window.scrollY
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    
    // 清理函数，防止内存泄漏
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // 平滑滚动
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="回到顶部"
      className="fixed bottom-32 right-8 sm:right-12 w-12 h-12 
                 bg-white/40 dark:bg-black/40 backdrop-blur-md 
                 border border-white/20 dark:border-white/5 
                 rounded-2xl shadow-xl flex items-center justify-center 
                 text-gray-600 dark:text-gray-300 hover:text-blue-500 
                 hover:scale-110 active:scale-90 transition-all z-[90]"
    >
      <ArrowUp size={24} />
    </button>
  );
};

export default BackToTop;