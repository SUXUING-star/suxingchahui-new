// Footer.jsx
import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto relative">
      {/* 优化背景蒙版 - 调整暗色模式透明度和颜色 */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/95 
                      rounded-t-xl shadow-md transition-colors duration-300 z-[-1]">
      </div>
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
              © {currentYear} 宿星茶会. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;