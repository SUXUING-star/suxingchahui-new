// src/components/layout/UserMenu.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { LogOut, LayoutDashboard, ShieldCheck, UserCircle, ImagePlus } from 'lucide-react';
import LazyImage from '../common/LazyImage';

const UserMenu = ({ setIsProfileModalOpen }) => {
    const { user, logout } = useAuth();
    // 核心修正：直接调用，别玩什么骚操作逻辑
    const { showNotification } = useNotification(); 
    const [isOpen, setIsOpen] = useState(false);
    
    // 菜单区域的引用，用于点击外部收起
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // 如果点击的不是菜单内部，就关闭
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    if (!user) return null; 

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        showNotification('已安全退出登录', 'success');
    };

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            {/* 头像触发按钮 */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="block w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all shadow-md bg-gray-100 dark:bg-gray-800"
            >
                {user.avatar ? (
                    <LazyImage src={user.avatar} alt={user.nickname} wrapperClassName="w-full h-full" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <UserCircle size={24} className="text-gray-500" />
                    </div>
                )}
            </button>

            {/* 下拉浮层 */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] py-3 z-[100] border border-gray-100 dark:border-white/5 animate-in fade-in zoom-in-95 duration-200">
                    {/* 用户基础信息 */}
                    <div className="px-6 py-4 border-b dark:border-white/5 mb-2">
                        <p className="font-black text-gray-900 dark:text-gray-100 truncate text-base leading-tight">
                            {user.nickname}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate mt-1 lowercase font-medium tracking-tight">
                            {user.email}
                        </p>
                        {user.isAdmin && (
                            <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black bg-red-500 text-white uppercase tracking-widest">
                                Administrator
                            </span>
                        )}
                    </div>
                    
                    {/* 操作项 */}
                    <div className="px-2 space-y-1">
                        <Link 
                            to="/my-posts" 
                            onClick={() => setIsOpen(false)}
                            className="flex items-center px-4 py-3 text-sm font-black text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 rounded-2xl transition-colors"
                        >
                            <LayoutDashboard size={18} className="mr-3 text-blue-500" /> 我的投稿
                        </Link>

                        {user.isAdmin && (
                            <Link 
                                to="/admin/pending" 
                                onClick={() => setIsOpen(false)}
                                className="flex items-center px-4 py-3 text-sm font-black text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-2xl transition-colors"
                            >
                                <ShieldCheck size={18} className="mr-3 text-red-500" /> 审核后台
                            </Link>
                        )}

                        <button 
                            onClick={() => { setIsProfileModalOpen(true); setIsOpen(false); }}
                            className="flex items-center w-full px-4 py-3 text-sm font-black text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 rounded-2xl transition-colors text-left"
                        >
                            <ImagePlus size={18} className="mr-3 text-emerald-500" /> 更换头像
                        </button>
                    </div>

                    {/* 底部退出按钮 */}
                    <div className="mt-2 px-2 border-t dark:border-white/5 pt-2">
                        <button 
                            onClick={handleLogout} 
                            className="flex items-center w-full px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors text-left"
                        >
                            <LogOut size={18} className="mr-3" /> 退出登录
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;