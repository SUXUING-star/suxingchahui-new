// src/pages/PostDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Folder, Tag, Edit3, ChevronLeft } from 'lucide-react';
import anime from 'animejs';

import LoadingSpinner from '../components/common/LoadingSpinner';
import ContentRenderer from '../components/common/ContentRenderer';
import UserBadge from '../components/common/UserBadge';
import LazyImage from '../components/common/LazyImage';
import { getPostById } from '../utils/postUtils';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext'; // <-- 引入新指挥部

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { token, user, isAuthenticated } = useAuth();
  const { openWriteModal, openAuthModal } = useModal(); // 获取全局弹窗方法
  const articleRef = useRef(null);

  const fetchPostData = async () => {
    setLoading(true);
    const data = await getPostById(id, token);
    setPost(data);
    setLoading(false);
  };


  useEffect(() => {
    fetchPostData();
  }, [id, token]); // Token 变化（登录成功后）自动重刷数据

  useEffect(() => {
    if (!loading && post) {
      anime({ targets: articleRef.current, translateY: [20, 0], opacity: [0, 1], duration: 800, easing: 'easeOutCubic' });
    }
  }, [loading, post]);

  if (loading) return <LoadingSpinner />;
  if (!post) return <div className="py-32 text-center font-black uppercase tracking-widest text-red-500">404 · 此文章已坠入深空</div>;

  // 权限判断
  const isOwnerOrAdmin = isAuthenticated && (user?.isAdmin || user?.id === post.author?.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      
      {/* 浮动编辑球 */}
      {isOwnerOrAdmin && (
        <button 
          onClick={() => openWriteModal(post.slug, fetchPostData)} 
          className="fixed bottom-12 right-12 w-16 h-16 bg-blue-600 text-white rounded-full shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:scale-110 hover:bg-blue-700 active:scale-95 transition-all z-[100] flex items-center justify-center group"
        >
          <Edit3 size={28} />
          <span className="absolute right-20 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            进入造物空间
          </span>
        </button>
      )}

      <Link to="/" className="inline-flex items-center text-[10px] font-black text-gray-400 hover:text-blue-600 mb-8 transition-colors group uppercase tracking-[0.3em]">
        <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Nexus
      </Link>

      <article ref={articleRef} className="bg-white dark:bg-gray-800 rounded-[64px] shadow-2xl overflow-hidden opacity-0 border border-gray-100 dark:border-gray-700">
        
        {/* 封面图 */}
        {post.coverImage && (
          <div className="relative h-64 sm:h-[450px] w-full overflow-hidden">
            <LazyImage src={post.coverImage.src} alt={post.title} fullHeight={true} objectFit="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        )}
        
        <div className="p-8 sm:p-20">
          <header className="mb-16">
            <h1 className="text-4xl sm:text-6xl font-black dark:text-white leading-[1] mb-10 tracking-tighter text-balance">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-8">
              <UserBadge user={post.author} size="lg" />
              <div className="flex items-center space-x-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                <span className="flex items-center"><Clock size={16} className="mr-2 text-blue-500" />{post.getFormattedDate()}</span>
                {post.category && (
                  <Link to={`/categories`} className="flex items-center hover:text-blue-500 transition-colors">
                    <Folder size={16} className="mr-2 text-blue-500" />{post.category}
                  </Link>
                )}
              </div>
            </div>
          </header>

          <main>
            <ContentRenderer
              content={post.content}
              contentImages={post.contentImages}
              downloads={post.downloads}
              isAuthenticated={isAuthenticated}
              onAuthRequired={() => openAuthModal()} // 核心：未登录点下载直接弹登录窗
            />
          </main>

          {post.tags?.length > 0 && (
            <footer className="mt-20 pt-12 border-t dark:border-gray-700 flex flex-wrap gap-3">
              {post.tags.map(tag => (
                <Link key={tag} to={`/tags#${tag}`} className="px-5 py-2 bg-gray-50 dark:bg-gray-900 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                  #{tag}
                </Link>
              ))}
            </footer>
          )}
        </div>
      </article>
    </div>
  );
};

export default PostDetail;