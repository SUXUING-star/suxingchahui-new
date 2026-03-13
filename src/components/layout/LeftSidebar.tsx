// --- START OF FILE LeftSidebar.tsx ---

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Zap, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { getRecentPosts } from '../../utils/postApi';
import anime from 'animejs';
import UserBadge from '../common/UserBadge';
import LazyImage from '../common/LazyImage';
import { PostResponse } from '../../models/PostResponse';

const LeftSidebar: React.FC = () => {
  const [recentPosts, setRecentPosts] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(true); // 控制展开/收缩状态
  const sidebarRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const fetchRecentPosts = async () => {
      setIsLoading(true);
      try {
        const posts = await getRecentPosts();
        setRecentPosts(posts || []);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecentPosts();
  }, []);
    
  useEffect(() => {
    if (!isLoading && recentPosts.length > 0 && sidebarRef.current) {
      anime({
        targets: sidebarRef.current,
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutExpo'
      });
    }
  }, [isLoading, recentPosts]);

  if (isLoading) {
    return (
      <aside className="p-4 w-64 xl:w-80 transition-all duration-300">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[32px] p-6 space-y-6 animate-pulse">
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl flex-shrink-0"></div>
              <div className="flex-1 space-y-3 py-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside 
      className={`p-4 transition-all duration-500 ease-in-out opacity-0 ${
        isExpanded ? 'w-64 xl:w-80' : 'w-24'
      }`} 
      ref={sidebarRef}
    >
      <div className={`bg-white/85 dark:bg-gray-900/90 backdrop-blur-2xl shadow-xl border border-white/40 dark:border-white/5 transition-all duration-500 overflow-hidden flex flex-col ${
        isExpanded ? 'rounded-[32px] p-6' : 'rounded-[28px] p-4 items-center'
      }`}>
          
          {/* 顶部控制区 & 标题 */}
          <div className={`flex items-center ${isExpanded ? 'justify-between mb-6' : 'justify-center flex-col space-y-4'}`}>
            {isExpanded && (
              <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center tracking-tighter whitespace-nowrap overflow-hidden">
                <Zap size={20} className="text-amber-500 mr-2 flex-shrink-0" />
                最新同步
              </h2>
            )}

            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2.5 bg-gray-50/80 dark:bg-gray-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-gray-500 hover:text-amber-500 rounded-2xl transition-all active:scale-95 shadow-sm border border-gray-100 dark:border-white/5"
              title={isExpanded ? "收起面板" : "展开最新同步"}
            >
              {isExpanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>

            {/* 收缩时的竖排文字提示 */}
            {!isExpanded && (
              <div 
                className="flex flex-col items-center justify-center pt-4 opacity-100 transition-opacity duration-300 delay-200 cursor-pointer"
                onClick={() => setIsExpanded(true)}
              >
                <Zap size={14} className="text-amber-500/60 mb-3" />
                <span 
                  className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-amber-500 transition-colors" 
                  style={{ writingMode: 'vertical-rl' }}
                >
                  最新同步
                </span>
              </div>
            )}
          </div>
            
          {/* 隐藏/显示的主内容列表 */}
          <div className={`transition-all duration-500 ease-in-out origin-top ${
            isExpanded ? 'opacity-100 max-h-[1000px] scale-y-100' : 'opacity-0 max-h-0 scale-y-95 pointer-events-none'
          }`}>
            {!isLoading && recentPosts.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[24px]">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">无信号</p>
              </div>
            ) : (
              <div className="space-y-6">
                {recentPosts.map(post => (
                  <article key={post.id} className="group flex gap-4 transition-all active:scale-95">
                    {post.coverImage?.src && (
                      <Link to={`/post/${post.id}`} className="flex-shrink-0">
                        <LazyImage src={post.coverImage.src} alt={post.title} wrapperClassName="w-16 h-16 rounded-2xl shadow-sm group-hover:shadow-lg transition-all overflow-hidden" />
                      </Link>
                    )}
                    <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                      <Link to={`/post/${post.id}`}>
                        <h3 className="text-[13px] font-black text-gray-800 dark:text-gray-200 group-hover:text-amber-500 transition-colors line-clamp-2 leading-tight">
                          {post.title}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between mt-auto">
                        <UserBadge user={post.author} size="sm" className="scale-75 origin-left opacity-80" />
                        <time className="text-[8px] font-black text-gray-400 uppercase italic">
                            {post.getFormattedDate()}
                        </time>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

      </div>
    </aside>
  );
};

export default LeftSidebar;