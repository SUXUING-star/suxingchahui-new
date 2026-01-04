// components/layout/Navbar.jsx
import React, { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Tag, Archive, User } from 'lucide-react';
import anime from 'animejs';

function Navbar() {
  const location = useLocation();
  // 使用 useRef 来引用导航栏的 DOM 元素
  const navRef = useRef(null);
  
  const navItems = [
    { path: '/', label: '主页', icon: Home },
    { path: '/categories', label: '分类', icon: FolderOpen },
    { path: '/tags', label: '标签', icon: Tag },
    { path: '/archive', label: '归档', icon: Archive },
    { path: '/about', label: '关于', icon: User },
  ];
    
    useEffect(() => {
      if (navRef.current) {
          anime({
              targets: navRef.current,
              translateY: [-20, 0],
              opacity: [0, 1],
              duration: 800,
              easing: 'easeOutExpo'
            });
      }
  }, []);

  return (
    <nav className="hidden md:flex space-x-2" ref={navRef}>
      {navItems.map(({ path, label, icon: Icon }) => (
        <Link
          key={path}
          to={path}
          className={`
            flex items-center px-3 py-2 rounded-md text-sm font-medium
            ${location.pathname === path
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }
          `}
        >
          <Icon size={16} className="mr-1" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export default Navbar;