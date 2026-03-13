import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import UserMenu from './UserMenu'; 
import ProfileModal from '../auth/ProfileModal';
import Search from '../common/Search';
import { PenTool, ShieldAlert, Home, LayoutGrid, Archive as ArchiveIcon } from 'lucide-react';

const Header: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { openWriteModal, openAuthModal } = useModal();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const location = useLocation();

  const isActive = (path: string): boolean => location.pathname === path;

  // 导航项配置，方便复用
  const navLinks = [
    { name: '首页', path: '/', icon: <Home size={20} /> },
    { name: '分类', path: '/categories', icon: <LayoutGrid size={20} /> },
    { name: '归档', path: '/archive', icon: <ArchiveIcon size={20} /> },
  ];

  return (
    <>
      {/* 1. 顶部 Header：增加外边距和圆角，做成悬浮感 */}
      <div className="sticky top-0 z-40 px-3 py-3 pointer-events-none">
        <header className="pointer-events-auto max-w-7xl mx-auto bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg shadow-black/5 border border-white/20 dark:border-white/5 rounded-[24px]">
          <div className="px-4 sm:px-6">
            <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
              
              <div className="flex-shrink-0">
                <Link to="/" className="text-lg sm:text-2xl font-black text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors tracking-tighter uppercase">
                  宿星茶会
                </Link>
              </div>

              {/* 桌面端菜单：维持原样但优化间距 */}
              <div className="flex-1 flex items-center justify-center min-w-0">
                <nav className="hidden min-[950px]:flex items-center space-x-1 mr-4">
                  {navLinks.map(link => (
                    <Link 
                      key={link.path}
                      to={link.path} 
                      className={`px-3 py-2 rounded-xl text-sm font-black transition-all ${isActive(link.path) ? 'text-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      {link.name}
                    </Link>
                  ))}
                  
                  <button onClick={() => openWriteModal()} className="flex items-center px-3 py-2 rounded-xl text-sm font-black text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                    <PenTool size={16} className="mr-1.5 text-emerald-500" /> 投稿
                  </button>

                  {user?.isAdmin && (
                    <Link to="/admin/pending" className={`flex items-center px-3 py-2 rounded-xl text-sm font-black transition-all ${isActive('/admin/pending') ? 'text-red-600 bg-red-50/50 dark:bg-red-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                      <ShieldAlert size={16} className="mr-1.5 text-red-500" /> 审稿
                    </Link>
                  )}
                </nav>

                <div className="flex-1 max-w-md hidden sm:block">
                  <Search />
                </div>
              </div>

              {/* 右侧用户区 */}
              <div className="flex-shrink-0 flex items-center space-x-2 sm:space-x-3">
                  <div className="sm:hidden w-10">
                      <Search />
                  </div>
                  {isAuthenticated ? (
                      <UserMenu setIsProfileModalOpen={setIsProfileModalOpen} />
                  ) : (
                      <button onClick={() => openAuthModal()} className="px-4 py-1.5 sm:px-5 sm:py-2 text-[11px] sm:text-xs font-black bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap">
                          登录
                      </button>
                  )}
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* 2. 移动端底部导航栏：纯白胶囊风格 */}
      <nav className="min-[950px]:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[420px]">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-white dark:border-white/10 p-1.5 flex items-center justify-around">
          
          {/* 首页、分类、归档 */}
          {navLinks.map(link => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 ${
                isActive(link.path) 
                ? 'text-blue-600 bg-blue-50/50 dark:bg-blue-500/10' 
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
              }`}
            >
              {link.icon}
              <span className="text-[10px] font-bold mt-1 scale-90">{link.name}</span>
            </Link>
          ))}
          
          {/* 特别突出投稿按钮 - 绿色图标配白色描边 */}
          <button 
            onClick={() => openWriteModal()}
            className="group relative flex flex-col items-center px-3"
          >
            <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-500/30 -translate-y-5 border-[4px] border-white dark:border-gray-900 group-active:scale-90 transition-transform">
              <PenTool size={22} />
            </div>
            <span className="text-[10px] font-bold -mt-4 text-emerald-600 dark:text-emerald-500">投稿</span>
          </button>

          {user?.isAdmin && (
            <Link 
              to="/admin/pending" 
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all ${
                isActive('/admin/pending') 
                ? 'text-red-600 bg-red-50/50 dark:bg-red-500/10' 
                : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <ShieldAlert size={20} />
              <span className="text-[10px] font-bold mt-1 scale-90">审稿</span>
            </Link>
          )}
        </div>
      </nav>
      
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      
      {/* 占位符，防止底部内容被导航栏遮挡（仅移动端） */}
      <div className="h-20 min-[950px]:hidden" />
    </>
  );
};

export default Header;