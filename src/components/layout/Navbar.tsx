import React, { useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, FolderOpen, Tag, Archive, User, LucideIcon } from "lucide-react";
// 1. 改为具名引入
import { animate } from "animejs";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const Navbar: React.FC = () => {
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  const navItems: NavItem[] = [
    { path: "/", label: "主页", icon: Home },
    { path: "/categories", label: "分类", icon: FolderOpen },
    { path: "/tags", label: "标签", icon: Tag },
    { path: "/archive", label: "归档", icon: Archive },
    { path: "/about", label: "关于", icon: User },
  ];

  useEffect(() => {
    // 2. 引入 TypeScript 非空验证，并使用 v4 API 与缩写的 ease 属性名
    if (navRef.current) {
      animate(navRef.current, {
        translateY: [-20, 0],
        opacity: [0, 1],
        duration: 800,
        ease: "outExpo",
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
            ${
              location.pathname === path
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            }
          `}
        >
          <Icon size={16} className="mr-1" />
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default Navbar;
