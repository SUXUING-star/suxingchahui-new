// src/components/layout/UserMenu.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // 必须引入 Link
import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, ShieldCheck, UserCircle, ImagePlus } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import LazyImage from '../common/LazyImage';

const UserMenu = ({ setIsProfileModalOpen }) => {
    const { user, logout } = useAuth();
    const { showNotification } = useNotification();
    const [isOpen, setIsOpen] = useState(false);
    
    if (!user) return null; 

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        showNotification('已成功退出登录', 'success');
    };

    return (
        <div className="relative">
            {/* 头像按钮 */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all shadow-md"
            >
                {user.avatar ? (
                    <LazyImage src={user.avatar} alt={user.nickname} wrapperClassName="w-full h-full" />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <UserCircle className="text-gray-500" />
                    </div>
                )}
            </button>

            {/* 下拉菜单 */}
            {isOpen && (
                <>
                    {/* 点击遮罩关闭 */}
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    
                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl py-3 z-20 border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
                        {/* 用户信息卡片 */}
                        <div className="px-5 py-3 border-b dark:border-gray-700 mb-2">
                            <p className="font-black text-gray-900 dark:text-gray-100 truncate">{user.nickname}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            {user.isAdmin && (
                                <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 uppercase tracking-tighter">
                                    Administrator
                                </span>
                            )}
                        </div>
                        
                        {/* 功能链接 */}
                        <div className="px-2 space-y-1">
                            <Link 
                                to="/my-posts" 
                                onClick={() => setIsOpen(false)}
                                className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            >
                                <LayoutDashboard size={18} className="mr-3 text-blue-500" /> 我的投稿
                            </Link>

                            {/* 管理员专属：审核后台入口 */}
                            {user.isAdmin && (
                                <Link 
                                    to="/admin/pending" 
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                >
                                    <ShieldCheck size={18} className="mr-3 text-red-500" /> 审核后台
                                </Link>
                            )}

                            <button 
                                onClick={() => { setIsProfileModalOpen(true); setIsOpen(false); }}
                                className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-left"
                            >
                                <ImagePlus size={18} className="mr-3 text-emerald-500" /> 更换头像
                            </button>
                        </div>

                        {/* 退出登录 */}
                        <div className="mt-2 px-2 border-t dark:border-gray-700 pt-2">
                            <button 
                                onClick={handleLogout} 
                                className="flex items-center w-full px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-left"
                            >
                                <LogOut size={18} className="mr-3" /> 退出登录
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserMenu;