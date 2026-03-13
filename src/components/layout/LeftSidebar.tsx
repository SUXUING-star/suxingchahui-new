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
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
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
      <aside className="py-4 w-[clamp(180px,20vw,250px)] transition-all duration-300">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[24px] p-4 space-y-4 animate-pulse">
          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside 
      // 核心改动：最大宽度锁定 250px
      className={`py-4 transition-all duration-500 ease-in-out opacity-0 ${
        isExpanded ? 'w-[clamp(180px,20vw,250px)]' : 'w-16'
      }`} 
      ref={sidebarRef}
    >
      {/* Padding 调小到 p-4，为内容留出更多空间 */}
      <div className={`bg-white/85 dark:bg-gray-900/90 backdrop-blur-2xl shadow-xl border border-white/40 dark:border-white/5 transition-all duration-500 overflow-hidden flex flex-col ${
        isExpanded ? 'rounded-[24px] p-4' : 'rounded-[20px] p-3 items-center'
      }`}>
          
          <div className={`flex items-center ${isExpanded ? 'justify-between mb-4' : 'justify-center flex-col space-y-4'}`}>
            {isExpanded && (
              <h2 className="text-base xl:text-lg font-black text-gray-900 dark:text-gray-100 flex items-center tracking-tighter whitespace-nowrap overflow-hidden">
                <Zap size={18} className="text-amber-500 mr-1.5 flex-shrink-0" />
                最新同步
              </h2>
            )}

            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-gray-50/80 dark:bg-gray-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-gray-400 hover:text-amber-500 rounded-xl transition-all active:scale-95 border border-gray-100 dark:border-white/5"
            >
              {isExpanded ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
          </div>
            
          <div className={`transition-all duration-500 ease-in-out origin-top ${
            isExpanded ? 'opacity-100 max-h-[1000px] scale-y-100' : 'opacity-0 max-h-0 scale-y-95 pointer-events-none'
          }`}>
            <div className="space-y-4">
              {recentPosts.map(post => (
                <article key={post.id} className="group flex gap-3 transition-all active:scale-95">
                  {post.coverImage?.src && (
                    <Link to={`/post/${post.id}`} className="flex-shrink-0">
                      <LazyImage src={post.coverImage.src} alt={post.title} wrapperClassName="w-12 h-12 rounded-xl shadow-sm group-hover:shadow-md transition-all overflow-hidden" />
                    </Link>
                  )}
                  <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                    <Link to={`/post/${post.id}`}>
                      <h3 className="text-[12px] font-bold text-gray-800 dark:text-gray-200 group-hover:text-amber-500 transition-colors line-clamp-2 leading-tight tracking-tight">
                        {post.title}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between mt-1">
                      <div className="scale-[0.7] origin-left opacity-80">
                         <UserBadge user={post.author} size="sm" />
                      </div>
                      <time className="text-[7px] font-black text-gray-400 uppercase italic">
                          {post.getFormattedDate()}
                      </time>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;