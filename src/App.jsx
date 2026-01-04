import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Providers (层级：Auth -> Notification -> Modal)
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ModalProvider } from './context/ModalContext'; 

// Layout components
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import BackgroundLayout from '@/components/layout/BackgroundLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Global UI Components
import GlobalModalWrapper from '@/components/layout/GlobalModalWrapper'; 
import Broadcast from '@/components/common/Broadcast';
import ProgressBar from '@/components/common/ProgressBar';
import SplashScreen from '@/components/common/SplashScreen';

// Lazy load pages (所有页面全部包含)
const Home = lazy(() => import('@/pages/Home'));
const PostDetail = lazy(() => import('@/pages/PostDetail'));
const About = lazy(() => import('@/pages/About'));
const Categories = lazy(() => import('@/pages/Categories'));
const Tags = lazy(() => import('@/pages/Tags'));
const Archive = lazy(() => import('@/pages/Archive'));
const MyPosts = lazy(() => import('@/pages/MyPosts'));
const AdminPending = lazy(() => import('@/pages/AdminPending'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ModalProvider> 
          <Router>
            <BackgroundLayout>
              {/* 启动与进度控制 */}
              <SplashScreen />
              <ProgressBar />
              
              {/* 1. 顶层 Flex 容器：垂直方向，撑满全屏 */}
              <div className="flex flex-col min-h-screen">
                
                {/* 2. 中间主体内容区：flex-1 确保它占据除 Broadcast 以外的所有垂直空间 */}
                <div className="flex-1 flex w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 gap-4">
                  
                  {/* 左侧边栏：Sticky 模式，不产生独立滚动条 */}
                  <div className="hidden md:block w-64 flex-shrink-0 relative">
                    <div className="sticky top-20 h-fit pb-10">
                      <LeftSidebar />
                    </div>
                  </div>

                  {/* 3. 主列：核心布局链条。这里必须是 flex-col，以便让 footer 贴底 */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    
                    {/* Header 放在主列顶部 */}
                    <Header />
                    
                    {/* 4. 路由与正文：flex-1 强制撑开高度，把 Footer 挤到最下面 */}
                    <main className="flex-1">
                      <Suspense fallback={<LoadingSpinner />}>
                        <Routes>
                          {/* 核心功能路由 */}
                          <Route path="/" element={<Home />} />
                          <Route path="/post/:id" element={<PostDetail />} />
                          <Route path="/my-posts" element={<MyPosts />} />
                          <Route path="/admin/pending" element={<AdminPending />} />
                          
                          {/* 基础页面路由 */}
                          <Route path="/about" element={<About />} />
                          <Route path="/categories" element={<Categories />} />
                          <Route path="/tags" element={<Tags />} />
                          <Route path="/archive" element={<Archive />} />
                          
                          {/* 404 兜底路由 */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </main>

                    {/* Footer：紧随 main 之后，main 没内容时它也会在最底部 */}
                    <Footer />
                  </div>

                  {/* 右侧边栏：Sticky 模式 */}
                  <div className="hidden xl:block w-64 flex-shrink-0 relative">
                    <div className="sticky top-20 h-fit pb-10">
                      <RightSidebar />
                    </div>
                  </div>

                </div>

                {/* 5. 广播条：始终位于页面 Flex 链条的末尾 */}
                <Broadcast />
              </div>

              {/* 6. 全局弹窗渲染器：包含登录和创作弹窗 */}
              <GlobalModalWrapper /> 

            </BackgroundLayout>
          </Router>
        </ModalProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;