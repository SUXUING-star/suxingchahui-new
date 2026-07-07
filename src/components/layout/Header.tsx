import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useModal } from "../../context/ModalContext";
import UserMenu from "./UserMenu";
import ProfileModal from "../auth/ProfileModal";
import Search from "../common/Search";
import {
  PenTool,
  ShieldAlert,
  Home,
  LayoutGrid,
  Archive as ArchiveIcon,
  Book,
  User,
} from "lucide-react";

const Header: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { openWriteModal, openAuthModal } = useModal();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const location = useLocation();

  const isActive = (path: string): boolean => location.pathname === path;

  const navLinks = [
    { name: "首页", path: "/", icon: <Home size={20} /> },
    { name: "分类", path: "/categories", icon: <LayoutGrid size={20} /> },
    { name: "归档", path: "/archive", icon: <ArchiveIcon size={20} /> },
    { name: "关于", path: "/about", icon: <User size={20} /> },
  ];

  return (
    <>
      {/* 1. 顶部 Header：外层容器居中，配合 pointer-events-none 仅用于定位 */}
      <div className="sticky top-0 z-40 w-full py-3 pointer-events-none flex justify-center">
        {/* 💡 关键改动：宽度设为响应式 w-[95%] lg:w-[80%] xl:w-[70%] 且最大宽度限制为 6xl */}
        <header className="pointer-events-auto w-[95%] md:w-[90%] lg:w-[80%] max-w-6xl bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg shadow-black/5 border border-white/20 dark:border-white/5 rounded-[24px] transition-all duration-300">
          <div className="px-4 sm:px-6">
            <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
              <div className="flex-shrink-0">
                <Link
                  to="/"
                  className="text-lg sm:text-2xl font-black text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors tracking-tighter uppercase"
                >
                  宿星茶会
                </Link>
              </div>

              {/* 导航区域 */}
              <div className="flex-1 flex items-center justify-center min-w-0">
                <nav className="hidden min-[950px]:flex items-center space-x-1 mr-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3 py-2 rounded-xl text-sm font-black transition-all ${isActive(link.path) ? "text-blue-600 bg-blue-50/50 dark:bg-blue-900/20" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      {link.name}
                    </Link>
                  ))}

                  {user?.nickname == "suxing" && (
                    <Link
                      to="/books"
                      className={`px-3 py-2 rounded-xl text-sm font-black transition-all ${isActive("/books") ? "text-blue-600 bg-blue-50/50 dark:bg-blue-900/20" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      书单
                    </Link>
                  )}

                  <button
                    onClick={() => openWriteModal()}
                    className="flex items-center px-3 py-2 rounded-xl text-sm font-black text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <PenTool size={16} className="mr-1.5 text-emerald-500" />{" "}
                    投稿
                  </button>

                  {user?.isAdmin && (
                    <Link
                      to="/admin/pending"
                      className={`flex items-center px-3 py-2 rounded-xl text-sm font-black transition-all ${isActive("/admin/pending") ? "text-red-600 bg-red-50/50 dark:bg-red-900/20" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <ShieldAlert size={16} className="mr-1.5 text-red-500" />{" "}
                      审稿
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
                  <button
                    onClick={() => openAuthModal()}
                    className="px-4 py-1.5 sm:px-5 sm:py-2 text-[11px] sm:text-xs font-black bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap"
                  >
                    登录
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* 2. 移动端底部导航栏 */}
      <nav className="min-[950px]:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[420px]">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-white dark:border-white/10 p-1.5 flex items-center justify-around">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 ${
                isActive(link.path)
                  ? "text-blue-600 bg-blue-50/50 dark:bg-blue-500/10"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600"
              }`}
            >
              {link.icon}
              <span className="text-[10px] font-bold mt-1 scale-90">
                {link.name}
              </span>
            </Link>
          ))}

          {user?.nickname == "suxing" && (
            <Link
              to="/books"
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 ${
                isActive("/books")
                  ? "text-blue-600 bg-blue-50/50 dark:bg-blue-500/10"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600"
              }`}
            >
              <Book />
              <span className="text-[10px] font-bold mt-1 scale-90">书单</span>
            </Link>
          )}

          <button
            onClick={() => openWriteModal()}
            className="group relative flex flex-col items-center px-3"
          >
            <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-500/30 -translate-y-5 border-[4px] border-white dark:border-gray-900 group-active:scale-90 transition-transform">
              <PenTool size={22} />
            </div>
            <span className="text-[10px] font-bold -mt-4 text-emerald-600 dark:text-emerald-500">
              投稿
            </span>
          </button>

          {user?.isAdmin && (
            <Link
              to="/admin/pending"
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all ${
                isActive("/admin/pending")
                  ? "text-red-600 bg-red-50/50 dark:bg-red-500/10"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <ShieldAlert size={20} />
              <span className="text-[10px] font-bold mt-1 scale-90">审稿</span>
            </Link>
          )}
        </div>
      </nav>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <div className="h-20 min-[950px]:hidden" />
    </>
  );
};

export default Header;
