// About.jsx
import React, { useRef, useEffect } from 'react';
import anime from 'animejs';
import qq from '../assets/qq.jpg';

function About() {
  const aboutRef = useRef(null);
  
  useEffect(() => {
    if (aboutRef.current) {
      anime({
        targets: aboutRef.current,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutExpo'
      });
    }
  }, []);
    
  return (
    <div className="w-full min-h-[80vh] px-4 py-8 flex items-center justify-center">
      <div 
        ref={aboutRef}
        className="w-full max-w-2xl text-center relative rounded-xl overflow-hidden"
      >
        {/* 背景层 */}
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-0" />
        
        {/* 内容区域 */}
        <div className="relative z-10 p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            关于我
          </h1>
          
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            欢迎来到我的小窝
          </p>
          
          <div className="mb-8">
            <div className="relative w-48 h-48 mx-auto">
              <img
                src={qq}
                alt="Profile"
                className="w-full h-full object-cover rounded-xl shadow-lg
                         ring-4 ring-white dark:ring-gray-700 transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          
          <div className="space-y-6 max-w-md mx-auto">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              本网站纯免费制作
              <br/>
              BY 一名小小制作者
            </p>
            
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Twitter(X): 
              <a 
                href="https://twitter.com/kannagi_nagisome" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 
                         hover:underline transition-colors duration-200 ml-2"
              >
                神埜なぎそめ
              </a>
            </p>
            
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              QQ群：
              <a 
                href="https://qm.qq.com/cgi-bin/qm/qr?k=j32tE8v4tMh1l8d_7n7x4n_44g3Qo2n7&jump_from=webapi" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 
                         hover:underline transition-colors duration-200 ml-2"
              >
                829701655
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;