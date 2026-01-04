// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext'; // 引入新指挥部
import UserMenu from './UserMenu'; 
import ProfileModal from '../auth/ProfileModal'; // 这个暂时保留，因为它跟用户中心耦合
import Search from '../common/Search';
import { PenTool, ShieldAlert } from 'lucide-react';

function Header() {
  const { isAuthenticated, user } = useAuth();
  const { openWriteModal, openAuthModal } = useModal(); // 获取全局方法
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <Link to="/" className="flex-shrink-0 text-2xl font-black text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors">
            宿星茶会
          </Link>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <nav className="hidden lg:flex items-center space-x-1">
              <Link to="/" className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${isActive('/') ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>首页</Link>
              
              {/* 投稿：调用全局方法 */}
              <button 
                onClick={() => openWriteModal()} 
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-bold transition-colors ${isActive('/write') ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <PenTool size={16} className="mr-1.5 text-emerald-500" /> 投稿
              </button>

              {user?.isAdmin && (
                <Link to="/admin/pending" className={`flex items-center px-3 py-2 rounded-lg text-sm font-bold transition-colors ${isActive('/admin/pending') ? 'text-red-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  <ShieldAlert size={16} className="mr-1.5 text-red-500" /> 审稿
                </Link>
              )}

              <Link to="/categories" className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${isActive('/categories') ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>分类</Link>
              <Link to="/archive" className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${isActive('/archive') ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>归档</Link>
              <Link to="/tags" className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${isActive('/tags') ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>标签</Link>
            </nav>

            <Search />

            <div className="flex items-center pl-2">
              {isAuthenticated ? (
                <UserMenu setIsProfileModalOpen={setIsProfileModalOpen} />
              ) : (
                // 登录：调用全局方法
                <button 
                  onClick={() => openAuthModal()} 
                  className="px-5 py-2 text-sm font-black bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                  登录
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* 资料弹窗暂时保留，后续也可以收进指挥部 */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
}

export default Header;