import React from 'react';
import { Link } from 'react-router-dom';
import { Edit3, MessageCircle, Folder, Image as ImageIcon } from 'lucide-react';
import { PostResponse, Comment } from '../../models/PostResponse';
import { IUser } from '../../models/User';

import LazyImage from '../common/LazyImage';
import UserBadge from '../common/UserBadge';
import ContentRenderer from '../common/ContentRenderer';
import CommentSection from './comment/CommentSection';
import BackButton from '../common/BackButton';
import BackToTop from '../common/BackToTop';

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

  // 把 getFormattedUpdateDate() 的逻辑提取出来，因为 postUtils 里的 class 没这个方法
  const formattedUpdateDate = new Date(post.updateTime).toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-4 relative">
      <BackButton to="/" />
      <BackToTop />

      <button 
        onClick={() => commentRef.current?.scrollIntoView({ behavior: 'smooth' })}
        className="fixed bottom-32 left-10 sm:bottom-12 sm:left-auto sm:right-32 w-14 h-14 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col items-center justify-center border border-white/20 z-[90] hover:scale-110 active:scale-95 transition-all group"
      >
        <MessageCircle size={20} className="text-blue-500" />
        <span className="text-[9px] font-black mt-1 text-gray-400">{totalComments}</span>
      </button>

      {isOwnerOrAdmin && (
        <button 
          onClick={() => openWriteModal(post.slug, onRefresh)} 
          className="fixed bottom-12 right-12 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-[100] flex items-center justify-center"
        >
          <Edit3 size={28} />
        </button>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <aside className="w-full lg:w-[320px] flex-shrink-0 lg:sticky lg:top-10 space-y-4">
          <div className="bg-white/80 dark:bg-gray-900/85 backdrop-blur-3xl rounded-[32px] shadow-2xl border border-white/30 dark:border-white/5 overflow-hidden">
            
            {/* 核心修正：判断封面图是否存在 */}
            <div className="aspect-[16/10] w-full bg-black/5 flex items-center justify-center">
              {post.coverImage?.src ? (
                <LazyImage src={post.coverImage.src} alt={post.title} fullHeight={true} objectFit="object-cover" />
              ) : (
                <ImageIcon size={48} className="text-gray-300 dark:text-gray-700" />
              )}
            </div>

            <div className="p-5 space-y-4">
                <h1 className="text-xl font-black dark:text-white leading-tight tracking-tighter uppercase line-clamp-3">
                    {post.title}
                </h1>
                <div className="flex items-center justify-between py-3 border-y border-gray-100/50 dark:border-white/5">
                    <UserBadge user={post.author} size="sm" />
                    <div className="flex flex-col items-end space-y-0.5">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                            发布 {post.getFormattedDate()}
                        </span>
                        {post.isEdited() && (
                            <span className="text-[8px] font-black text-blue-500/80 uppercase tracking-widest">
                                更新 {formattedUpdateDate}
                            </span>
                        )}
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                            阅读 {post.views} 次
                        </span>
                    </div>
                </div>
                {post.category && (
                    <div className="inline-flex items-center text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] bg-blue-50/50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg w-full">
                        <Folder size={12} className="mr-2" /> {post.category}
                    </div>
                )}
            </div>
          </div>
          {recentComments.length > 0 && (
            <div className="hidden lg:block bg-white/70 dark:bg-gray-900/75 backdrop-blur-2xl rounded-[24px] border border-white/20 shadow-xl p-5">
               <div className="flex items-center space-x-2 mb-4 text-gray-400">
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

        <div className="flex-1 w-full space-y-8 min-w-0">
          <article className="bg-white/80 dark:bg-gray-900/85 backdrop-blur-3xl rounded-[48px] shadow-2xl border border-white/30 dark:border-white/5 p-6 sm:p-16">
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
                  <Link key={tag} to={`/tags#${encodeURIComponent(tag)}`} className="px-4 py-1.5 bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                    #{tag}
                  </Link>
                ))}
              </footer>
            )}
          </article>

          <div ref={commentRef} className="bg-white/80 dark:bg-gray-900/85 backdrop-blur-3xl rounded-[48px] shadow-2xl border border-white/30 dark:border-white/5 p-6 sm:p-16">
            <CommentSection 
              comments={post.comments} 
              slug={post.slug} 
              onRefresh={onRefresh} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostLayout;