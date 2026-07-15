import { lazy, Suspense, useEffect, useState } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";

import { AuthProvider } from "@/context/AuthContext";
import { LayoutProvider, useLayout } from "./context/LayoutContext";
import { ModalProvider } from "./context/ModalContext";
import { NotificationProvider } from "./context/NotificationContext";

import Broadcast from "@/components/common/Broadcast";
import BackgroundLayout from "@/components/layout/BackgroundLayout";
import Footer from "@/components/layout/Footer";
import GlobalModalWrapper from "@/components/layout/GlobalModalWrapper";
import Header from "@/components/layout/Header";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const Home = lazy(() => import("@/pages/Home"));
const PostDetail = lazy(() => import("@/pages/PostDetail"));
const About = lazy(() => import("@/pages/About"));
const Categories = lazy(() => import("@/pages/Categories"));
const Tags = lazy(() => import("@/pages/Tags"));
const Archive = lazy(() => import("@/pages/Archive"));
const MyPosts = lazy(() => import("@/pages/MyPosts"));
const MyBooks = lazy(() => import("@/pages/MyBooks"));
const AdminPending = lazy(() => import("@/pages/AdminPending"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// 简单的自定义 Hook，用于获取当前窗口宽度是否支持显示侧边栏
const useIsLargeScreen = (breakpoint = 850) => {
  const [isLarge, setIsLarge] = useState(
    typeof window !== "undefined" ? window.innerWidth >= breakpoint : true,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsLarge(window.innerWidth >= breakpoint);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isLarge;
};

const AppLayout = () => {
  const { hideSidebars } = useLayout();
  const isLargeScreen = useIsLargeScreen(850);
  const location = useLocation();

  // 1. 定义哪些路由绝对不需要显示侧边栏，避免状态更新滞后导致的瞬间挂载
  const noSidebarPaths = ["/admin/pending", "/login", "/register"];
  const isNoSidebarRoute = noSidebarPaths.some((path) =>
    location.pathname.startsWith(path),
  );

  // 2. 只有在非隐藏状态、非静默路由、且屏幕足够大时，才渲染侧边栏
  const shouldRenderSidebars =
    !hideSidebars && !isNoSidebarRoute && isLargeScreen;

  return (
    <BackgroundLayout>
      <div className="flex flex-col min-h-screen">
        {/* Header 只有在非隐藏模式下展示 */}
        {!hideSidebars && !isNoSidebarRoute && <Header />}

        {/* 下方放置侧边栏和主内容区 */}
        <div className="flex-1 flex w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 gap-4">
          {shouldRenderSidebars && (
            <div className="flex-shrink-0 relative transition-all duration-500 z-30">
              <div className="sticky top-24 h-fit pb-10">
                <LeftSidebar />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col">
            <main className="flex-1">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/post/:slug" element={<PostDetail />} />
                  <Route path="/my-posts" element={<MyPosts />} />
                  <Route path="/admin/pending" element={<AdminPending />} />
                  <Route path="/books" element={<MyBooks />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/tags" element={<Tags />} />
                  <Route path="/archive" element={<Archive />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>

            {!hideSidebars && !isNoSidebarRoute && <Footer />}
          </div>

          {shouldRenderSidebars && (
            <div className="flex-shrink-0 relative transition-all duration-500 z-30">
              <div className="sticky top-24 h-fit pb-10">
                <RightSidebar />
              </div>
            </div>
          )}
        </div>
        <Broadcast />
      </div>
      <GlobalModalWrapper />
    </BackgroundLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <LayoutProvider>
          <ModalProvider>
            <Router>
              <AppLayout />
            </Router>
          </ModalProvider>
        </LayoutProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
