import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LayoutProvider, useLayout } from './context/LayoutContext';
import { ModalProvider } from './context/ModalContext'; 

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import BackgroundLayout from '@/components/layout/BackgroundLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import GlobalModalWrapper from '@/components/layout/GlobalModalWrapper'; 
import Broadcast from '@/components/common/Broadcast';

const Home = lazy(() => import('@/pages/Home'));
const PostDetail = lazy(() => import('@/pages/PostDetail'));
const About = lazy(() => import('@/pages/About'));
const Categories = lazy(() => import('@/pages/Categories'));
const Tags = lazy(() => import('@/pages/Tags'));
const Archive = lazy(() => import('@/pages/Archive'));
const MyPosts = lazy(() => import('@/pages/MyPosts'));
const AdminPending = lazy(() => import('@/pages/AdminPending'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const AppLayout = () => {
  const { hideSidebars } = useLayout();

  return (
    <BackgroundLayout>
      
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 gap-4">
          
          {!hideSidebars && (
            <div className="hidden min-[850px]:block w-64 xl:w-80 flex-shrink-0 relative">
              <div className="sticky top-20 h-fit pb-10">
                <LeftSidebar />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col">
            <Header />
            <main className="flex-1">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/post/:id" element={<PostDetail />} />
                  <Route path="/my-posts" element={<MyPosts />} />
                  <Route path="/admin/pending" element={<AdminPending />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/tags" element={<Tags />} />
                  <Route path="/archive" element={<Archive />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>

          {!hideSidebars && (
            <div className="hidden min-[850px]:block w-64 xl:w-80 flex-shrink-0 relative">
              <div className="sticky top-20 h-fit pb-10">
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