import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { LayoutProvider, useLayout } from "./context/LayoutContext";
import { ModalProvider } from "./context/ModalContext";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import BackgroundLayout from "@/components/layout/BackgroundLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import GlobalModalWrapper from "@/components/layout/GlobalModalWrapper";
import Broadcast from "@/components/common/Broadcast";

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

const AppLayout = () => {
  const { hideSidebars } = useLayout();

  return (
    <BackgroundLayout>
      <div className="flex flex-col min-h-screen">
        {/* 💡 移到这里：Header 独占最顶部，宽度不受侧边栏挤压 */}
        {!hideSidebars && <Header />}

        {/* 下方放置侧边栏和主内容区 */}
        <div className="flex-1 flex w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 gap-4">
          {!hideSidebars && (
            <div className="hidden min-[850px]:block flex-shrink-0 relative transition-all duration-500 z-30">
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

            {!hideSidebars && <Footer />}
          </div>

          {!hideSidebars && (
            <div className="hidden min-[850px]:block flex-shrink-0 relative transition-all duration-500 z-30">
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
