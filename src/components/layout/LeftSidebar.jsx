import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { getRecentPosts } from '../../utils/postUtils';
import anime from 'animejs';
import UserBadge from '../common/UserBadge'; // 引入新组件


function LeftSidebar() {
  const [recentPosts, setRecentPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const sidebarRef = useRef(null);
  
  useEffect(() => {
    const fetchRecentPosts = async () => {
      setIsLoading(true);
      try {
        const posts = await getRecentPosts(); // 调用高性能 API
        setRecentPosts(posts);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecentPosts();
  }, []);
    
  useEffect(() => {
    if (!isLoading && sidebarRef.current) {
      anime({
        targets: sidebarRef.current,
        translateX: [-200, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutExpo'
      });
    }
  }, [isLoading]);
  

  if (isLoading) {
    return (
      <aside className="w-full">
        <div className="sticky top-20 p-4 space-y-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full opacity-0" ref={sidebarRef}>
        <div className="sticky top-20 p-4 space-y-8">
            {/* 最新文章 */}
            <section>
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
                最新文章
              </h2>
              <div className="space-y-4">
                {recentPosts.map(post => (
                  <article key={post.id} className="group flex gap-4 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                    {/* 核心修正 1: post.coverImage 是对象，要用 .src */}
                    {post.coverImage && (
                      <Link to={`/post/${post.id}`} className="flex-shrink-0">
                        <img
                          src={post.coverImage.src}
                          alt={post.title}
                          className="w-24 h-24 object-cover rounded-md"
                        />
                      </Link>
                    )}
                   <div className="flex flex-col justify-center flex-1 min-w-0">
                      <Link to={`/post/${post.id}`}>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                              {post.title}
                          </h3>
                      </Link>
                      <div className="flex items-center justify-between mt-2">
                          {/* 超小作者标识 */}
                          <UserBadge user={post.author} size="sm" className="scale-90 origin-left" />
                          <time className="text-[10px] text-gray-400">
                              {new Date(post.date).toLocaleDateString()}
                          </time>
                      </div>
                  </div>
                  </article>
                ))}
              </div>
            </section>
        </div>
    </aside>
  );
}

export default LeftSidebar;