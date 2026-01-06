import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, MessageCircle, Folder, Image as ImageIcon } from 'lucide-react';
import { PostResponse, Comment } from '../../../models/PostResponse';
import { IUser } from '../../../models/User';

import LazyImage from '../../common/LazyImage';
import UserBadge from '../../common/UserBadge';
import ContentRenderer from './ContentRenderer';
import CommentSection from '../comment/CommentSection';
import BackButton from '../../common/BackButton';
import BackToTop from '../../common/BackToTop';
import TableOfContents from './TableOfContents';
import { extractHeadings } from '../../../utils/markdownUtils';

interface PostLayoutProps {
  post: PostResponse;
  isAuthenticated: boolean;
  user: IUser | null;
  openWriteModal: (slug: string, onRefresh: () => void) => void;
  openAuthModal: () => void;
  onRefresh: () => void;
  commentRef: React.RefObject<HTMLDivElement>;
}

const PostLayout: React.FC<PostLayoutProps> = ({
  post,
  isAuthenticated,
  user,
  openWriteModal,
  openAuthModal,
  onRefresh,
  commentRef
}) => {
  const isOwnerOrAdmin = isAuthenticated && user && (user.isAdmin || user.id === post.author?.id);
  const recentComments = (post.comments || []).slice(0, 2);

  const getTotalCommentsCount = (comments: Comment[]): number => {
    return comments.reduce((acc, comment) => {
      return acc + 1 + (comment.replies ? getTotalCommentsCount(comment.replies) : 0);
    }, 0);
  };

  const totalComments = getTotalCommentsCount(post.comments || []);

  const formattedUpdateDate = new Date(post.updateTime).toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  // 1. 在这里直接计算标题，数据流向：Post -> Layout -> TOC。不依赖 Render 组件
  const headings = useMemo(() => extractHeadings(post.content), [post.content]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  // 2. 滚动监听逻辑
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        });
      },
      // 触发区域：视口顶部的 33% 处
      { rootMargin: '-33% 0px -66% 0px' }
    );

    const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
    headingElements.forEach(el => observer.observe(el!));

    return () => {
      headingElements.forEach(el => observer.unobserve(el!));
    };
  }, [headings]); // 依赖于 headings 变化

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 relative">
      <BackButton to="/" />
      <BackToTop />

      {/* 悬浮按钮保持不变 */}
      <button
        onClick={() => commentRef.current?.scrollIntoView({ behavior: 'smooth' })}
        className="fixed bottom-32 left-10 sm:bottom-12 sm:left-auto sm:right-32 w-14 h-14 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col items-center justify-center border border-white/20 z-[90] hover:scale-110 active:scale-95 transition-all group"
      >
        <MessageCircle size={20} className="text-blue-500" />
        <span className="text-[9px] font-black mt-1 text-gray-400">{totalComments}</span>
      </button>

      {/* 整体大容器 */}
      <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">

        {/* 左侧栏：在 lg 屏时缩小宽度从 320 -> 260，xl 恢复 320 */}
        <aside className="w-full lg:w-[260px] xl:w-[320px] flex-shrink-0 lg:sticky lg:top-10 space-y-4">
          <div className="bg-white/80 dark:bg-gray-900/85 backdrop-blur-3xl rounded-[32px] shadow-2xl border border-white/30 dark:border-white/5 overflow-hidden">
            <div className="aspect-[16/10] w-full bg-black/5 flex items-center justify-center">
              {post.coverImage?.src ? (
                <LazyImage src={post.coverImage.src} alt={post.title} fullHeight={true} objectFit="object-cover" />
              ) : (
                <ImageIcon size={48} className="text-gray-300 dark:text-gray-700" />
              )}
            </div>
            <div className="p-4 space-y-3">
              <h1 className="text-lg font-black dark:text-white leading-tight tracking-tighter uppercase line-clamp-3">
                {post.title}
              </h1>
              <div className="flex items-center justify-between py-3 border-y border-gray-100/50 dark:border-white/5">
                <UserBadge user={post.author} size="sm" />
                <div className="flex flex-col items-end space-y-0.5">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">发布 {post.getFormattedDate()}</span>
                  {post.isEdited() && <span className="text-[8px] font-black text-blue-500/80 uppercase tracking-widest">更新 {formattedUpdateDate}</span>}
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">阅读 {post.views}</span>
                </div>
              </div>
              {post.category && (
                <div className="inline-flex items-center text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] bg-blue-50/50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg w-full">
                  <Folder size={12} className="mr-2" /> {post.category}
                </div>
              )}
            </div>
          </div>
          {/* 最新讨论模块 */}
          {recentComments.length > 0 && (
            <div className="hidden lg:block bg-white/70 dark:bg-gray-900/75 backdrop-blur-2xl rounded-[24px] border border-white/20 shadow-xl p-4">
              <div className="flex items-center space-x-2 mb-3 text-gray-400">
                <MessageCircle size={14} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">最新讨论</span>
              </div>
              <div className="space-y-3">
                {recentComments.map(c => (
                  <div key={c._id} className="text-[11px] leading-relaxed dark:text-gray-300">
                    <span className="font-black text-blue-500 mr-2">{c.user.nickname}:</span>
                    <span className="font-medium line-clamp-2">{c.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* 中间 + 右侧目录 容器 */}
        <div className="flex-1 w-full min-w-0 flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">

          {/* 主文章内容 */}
          <div className="flex-1 w-full space-y-8 min-w-0">
            <article className="bg-white/80 dark:bg-gray-900/85 backdrop-blur-3xl rounded-[40px] xl:rounded-[48px] shadow-2xl border border-white/30 dark:border-white/5 p-6 sm:py-12 sm:px-12 xl:py-16 xl:px-20">
              {/* 
                 注意这里的 padding: 
                 sm:px-12 (默认和窄屏)
                 xl:px-20 (宽屏才恢复大间距) 
              */}
              <main>
                <ContentRenderer
                  content={post.content}
                  contentImages={post.contentImages}
                  downloads={post.downloads}
                  isAuthenticated={isAuthenticated}
                  onAuthRequired={openAuthModal}
                />
              </main>
              {post.tags?.length > 0 && (
                <footer className="mt-20 pt-10 border-t border-gray-100/50 dark:border-white/5 flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Link key={tag} to={`/tags#${encodeURIComponent(tag)}`} className="px-4 py-1.5 bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">#{tag}</Link>
                  ))}
                </footer>
              )}
            </article>

            {/* 评论区 */}
            <div ref={commentRef} className="bg-white/80 dark:bg-gray-900/85 backdrop-blur-3xl rounded-[40px] shadow-2xl border border-white/30 dark:border-white/5 p-6 sm:p-8 sm:px-12">
              <CommentSection comments={post.comments} slug={post.slug} onRefresh={onRefresh} />
            </div>
          </div>

          {/* 右侧 TOC：改为 lg:block，即 1024px 就显示 */}
          {headings.length > 0 && (
            <aside className="w-52 xl:w-64 flex-shrink-0 hidden lg:block sticky top-10 xl:top-28">
              <TableOfContents headings={headings} activeId={activeHeadingId} />
            </aside>
          )}

        </div>
      </div>
    </div>
  );
};

export default PostLayout;