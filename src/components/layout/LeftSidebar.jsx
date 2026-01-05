// src/components/layout/LeftSidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { getRecentPosts } from '../../utils/postUtils';
import anime from 'animejs';
import UserBadge from '../common/UserBadge';
import LazyImage from '../common/LazyImage';

function LeftSidebar() {
  const [recentPosts, setRecentPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const sidebarRef = useRef(null);
  
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
      <aside className="w-full p-4">
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
    <aside className="w-full p-4 opacity-0" ref={sidebarRef}>
      {/* 核心修正：加入高不透明度磨砂底座 */}
      <div className="bg-white/85 dark:bg-gray-900/90 backdrop-blur-2xl rounded-[32px] p-6 shadow-xl border border-white/40 dark:border-white/5">
          <section>
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center mb-6 tracking-tighter">
              <Zap size={20} className="text-amber-500 mr-2" />
              最新同步
            </h2>
            
            {!isLoading && recentPosts.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[24px]">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">无信号</p>
              </div>
            ) : (
              <div className="space-y-6">
                {recentPosts.map(post => (
                  <article key={post.id} className="group flex gap-4 transition-all active:scale-95">
                    {post.coverImage && (
                      <Link to={`/post/${post.id}`} className="flex-shrink-0">
                        <LazyImage 
                          src={post.coverImage.src} 
                          alt={post.title} 
                          wrapperClassName="w-16 h-16 rounded-2xl shadow-sm group-hover:shadow-lg transition-all overflow-hidden" 
                        />
                      </Link>
                    )}
                    <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                      <Link to={`/post/${post.id}`}>
                        <h3 className="text-[13px] font-black text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                          {post.title}
                        </h3>
                      </Link>
                        <div className="flex items-center justify-between mt-auto">
                          <UserBadge user={post.author} size="sm" className="scale-75 origin-left opacity-80" />
                          <time className="text-[8px] font-black text-gray-400 uppercase italic">
                              {post.getFormattedDate()} {/* 使用 createTime */}
                          </time>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
      </div>
    </aside>
  );
}

export default LeftSidebar;