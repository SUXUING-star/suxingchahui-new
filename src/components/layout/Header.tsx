import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import UserMenu from './UserMenu'; 
import ProfileModal from '../auth/ProfileModal';
import Search from '../common/Search';
import { PenTool, ShieldAlert } from 'lucide-react';

const Header: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { openWriteModal, openAuthModal } = useModal();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const location = useLocation();

  const isActive = (path: string): boolean => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md border-b border-white/20 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors tracking-tighter uppercase">
                宿星茶会
              </Link>
            </div>

            <div className="flex-1 flex items-center justify-center min-w-0">
              <nav className="hidden min-[850px]:flex items-center space-x-1 mr-4">
                <Link to="/" className={`px-3 py-2 rounded-xl text-sm font-black transition-all ${isActive('/') ? 'text-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>首页</Link>
                
                <button onClick={() => openWriteModal()} className="flex items-center px-3 py-2 rounded-xl text-sm font-black text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                  <PenTool size={16} className="mr-1.5 text-emerald-500" /> 投稿
                </button>

                {user?.isAdmin && (
                  <Link to="/admin/pending" className={`flex items-center px-3 py-2 rounded-xl text-sm font-black transition-all ${isActive('/admin/pending') ? 'text-red-600 bg-red-50/50 dark:bg-red-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <ShieldAlert size={16} className="mr-1.5 text-red-500" /> 审稿
                  </Link>
                )}

                <Link to="/categories" className={`px-3 py-2 rounded-xl text-sm font-black transition-all ${isActive('/categories') ? 'text-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>分类</Link>
                <Link to="/archive" className={`px-3 py-2 rounded-xl text-sm font-black transition-all ${isActive('/archive') ? 'text-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>归档</Link>
              </nav>

              <div className="flex-1 max-w-md hidden sm:block">
                <Search />
              </div>
            </div>

            <div className="flex-shrink-0 flex items-center space-x-3 border-l dark:border-white/5 pl-4 ml-2">
                <div className="sm:hidden">
                    <Search />
                </div>
                {isAuthenticated ? (
                    <UserMenu setIsProfileModalOpen={setIsProfileModalOpen} />
                ) : (
                    <button onClick={() => openAuthModal()} className="px-5 py-2 text-xs font-black bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 whitespace-nowrap">
                        登录
                    </button>
                )}
            </div>
          </div>
        </div>
      </header>
      
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
};

export default Header;