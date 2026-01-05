// src/pages/Home.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PostCard from '../components/common/PostCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusPlaceholder from '../components/common/StatusPlaceholder';
import { getPaginatedPosts, getTagCloudData, getCategories } from '../utils/postUtils';
import { useNotification } from '../context/NotificationContext';
import anime from 'animejs';

const POSTS_PER_PAGE = 24;

function Home() {
  const { showNotification } = useNotification();

  // --- 1. 状态定义 ---
  const [posts, setPosts] = useState([]);
  const [pinnedPosts, setPinnedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  // 用于防止初始化逻辑重复执行的锁
  const isInitialized = useRef(false);

  // --- 2. 稳定的数据拉取函数 (useCallback) ---

  // 获取一次性的元数据（标签、分类）
  const fetchMetadata = useCallback(async () => {
    try {
      const [tagsData, catsData] = await Promise.all([
        getTagCloudData(), 
        getCategories()
      ]);
      setAllTags(tagsData.map(t => t.tag).sort());
      setAllCategories(catsData.map(c => c._id).sort());
    } catch (err) {
      console.error("元数据同步失败", err);
    }
  }, []);

  // 获取文章列表逻辑
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getPaginatedPosts({ 
        page: currentPage, 
        limit: POSTS_PER_PAGE,
        category: selectedCategory, 
        tag: selectedTag 
      });
      
      setPosts(data.posts || []);
      setPinnedPosts(data.pinnedPosts || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(true);
      showNotification('无法同步星火列表', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, selectedTag, showNotification]);

  // --- 3. 严格受控的副作用层 ---

  // 副作用 A：仅在组件挂载时运行一次，初始化元数据
  useEffect(() => {
    if (!isInitialized.current) {
      fetchMetadata();
      isInitialized.current = true;
    }
  }, [fetchMetadata]);

  // 副作用 B：当分页或筛选参数变动时，才去请求文章
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 副作用 C：动画逻辑（仅在数据加载完成且有数据时执行）
  useEffect(() => {
    if (!loading && (posts.length > 0 || pinnedPosts.length > 0)) {
      anime({
        targets: '.home-animate',
        translateY: [30, 0],
        opacity: [0, 1],
        delay: anime.stagger(60),
        duration: 800,
        easing: 'easeOutExpo'
      });
    }
  }, [loading, posts, pinnedPosts]);

  // --- 4. 交互处理 ---

  const handlePageChange = (newPage) => {
    if (newPage === currentPage) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSelectedTag('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  // --- 5. 渲染控制 ---

  if (loading && posts.length === 0) return <LoadingSpinner />;
  
  if (error) return (
    <StatusPlaceholder type="error" title="核心链路受损" message="由于星际脉冲干扰，数据无法正常调取" onRetry={fetchPosts} />
  );

  if (!loading && posts.length === 0 && pinnedPosts.length === 0) return (
    <StatusPlaceholder type="empty" title="荒芜星系" message="当前频率下未发现任何星火信号" onRetry={resetFilters} />
  );

  return (
    <div className="w-full space-y-12 pb-20">
      
      {/* 筛选器底座 */}
      <div className="px-4 home-animate">
        <div className="inline-flex flex-wrap gap-4 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[24px] shadow-xl border border-white/20">
          <select 
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-gray-100 dark:bg-gray-800 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest outline-none border-none dark:text-white cursor-pointer"
          >
            <option value="">所有分类</option>
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={selectedTag} 
            onChange={e => setSelectedTag(e.target.value)}
            className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest outline-none border-none dark:text-white cursor-pointer"
          >
            <option value="">所有标签</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {(selectedTag || selectedCategory) && (
            <button onClick={resetFilters} className="px-4 py-2 bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-90 transition-all">重置</button>
          )}
        </div>
      </div>

      {/* 置顶区域 */}
      {pinnedPosts.length > 0 && (
        <section className="px-4 home-animate">
          <div className="inline-flex items-center space-x-4 mb-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-sm">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(37,99,235,1)]"></div>
            <h2 className="text-sm font-black dark:text-white uppercase tracking-[0.4em]">置顶星火</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 justify-items-center">
            {pinnedPosts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        </section>
      )}

      {/* 列表区域 */}
      <section className="px-4 home-animate">
        <div className="inline-flex items-center space-x-4 mb-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-sm">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <h2 className="text-sm font-black dark:text-white uppercase tracking-[0.4em]">最新同步</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 justify-items-center">
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>

        {/* 分页导航 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-3 mt-20 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-4 rounded-[32px] w-fit mx-auto shadow-xl border border-white/10">
             {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
               <button 
                key={p} 
                onClick={() => handlePageChange(p)} 
                className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === p ? 'bg-blue-600 text-white scale-110 shadow-lg' : 'text-gray-400 hover:bg-white dark:hover:bg-gray-800'}`}
               >
                 {p}
               </button>
             ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;