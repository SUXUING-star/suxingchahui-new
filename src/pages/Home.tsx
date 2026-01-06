import React, { useState, useEffect, useCallback, useRef, ChangeEvent } from 'react';
import PostCard from '../components/common/PostCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusPlaceholder from '../components/common/StatusPlaceholder';
import { getPaginatedPosts, getTagCloudData, getCategories } from '../utils/postUtils';
import { useNotification } from '../context/NotificationContext';
import { PostResponse } from '../models/PostResponse';
import anime from 'animejs';

const POSTS_PER_PAGE = 24;

interface TagCloudItem {
  tag: string;
  count: number;
}
interface CategoryItem {
  _id: string;
  count: number;
}

const Home: React.FC = () => {
  const { showNotification } = useNotification();

  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [pinnedPosts, setPinnedPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);

  const isInitialized = useRef<boolean>(false);

  const fetchMetadata = useCallback(async () => {
    try {
      const [tagsData, catsData] = await Promise.all([
        getTagCloudData(), 
        getCategories()
      ]);
      setAllTags((tagsData as TagCloudItem[]).map(t => t.tag).sort());
      setAllCategories((catsData as CategoryItem[]).map(c => c._id).sort());
    } catch (err) {
      console.error("元数据同步失败", err);
    }
  }, []);

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
    } catch (err: any) {
      setError(true);
      showNotification(err.message || '无法同步星火列表', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, selectedTag, showNotification]);

  useEffect(() => {
    if (!isInitialized.current) {
      fetchMetadata();
      isInitialized.current = true;
    }
  }, [fetchMetadata]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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

  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setCurrentPage(1); // Reset page when filter changes
  };

  const resetFilters = () => {
    setSelectedTag('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  if (loading && posts.length === 0 && pinnedPosts.length === 0) return <LoadingSpinner />;
  if (error) return <StatusPlaceholder type="error" title="核心链路受损" message="由于星际脉冲干扰，数据无法正常调取" onRetry={fetchPosts} />;
  if (!loading && posts.length === 0 && pinnedPosts.length === 0) return <StatusPlaceholder type="empty" title="荒芜星系" message="当前频率下未发现任何星火信号" onRetry={resetFilters} />;

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="px-4 home-animate">
        <div className="inline-flex flex-wrap gap-4 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[24px] shadow-xl border border-white/20">
          <select value={selectedCategory} onChange={handleFilterChange(setSelectedCategory)} className="bg-gray-100 dark:bg-gray-800 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest outline-none border-none dark:text-white cursor-pointer">
            <option value="">所有分类</option>
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={selectedTag} onChange={handleFilterChange(setSelectedTag)} className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest outline-none border-none dark:text-white cursor-pointer">
            <option value="">所有标签</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {(selectedTag || selectedCategory) && (
            <button onClick={resetFilters} className="px-4 py-2 bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-90 transition-all">重置</button>
          )}
        </div>
      </div>

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

      <section className="px-4 home-animate">
        <div className="inline-flex items-center space-x-4 mb-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-sm">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <h2 className="text-sm font-black dark:text-white uppercase tracking-[0.4em]">最新同步</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 justify-items-center">
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-3 mt-20 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-4 rounded-[32px] w-fit mx-auto shadow-xl border border-white/10">
             {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
               <button key={p} onClick={() => handlePageChange(p)} className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === p ? 'bg-blue-600 text-white scale-110 shadow-lg' : 'text-gray-400 hover:bg-white dark:hover:bg-gray-800'}`}>
                 {p}
               </button>
             ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;