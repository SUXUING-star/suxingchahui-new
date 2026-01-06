import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { getCategories } from '../utils/postUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusPlaceholder from '../components/common/StatusPlaceholder';
import PostCard from '../components/common/PostCard';
import anime from 'animejs';
import { PostResponse } from '../models/PostResponse';

interface CategoryData {
  _id: string;
  count: number;
  posts: PostResponse[];
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const isInitialized = useRef<boolean>(false);

  const fetchCats = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data: CategoryData[] = await getCategories();
      setCategories(data || []);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized.current) {
      fetchCats();
      isInitialized.current = true;
    }
  }, [fetchCats]);

  useEffect(() => {
    if (!loading && categories.length > 0) {
        anime({ 
          targets: '.cat-card-animate', 
          translateY: [20, 0], 
          opacity: [0, 1], 
          delay: anime.stagger(100), 
          duration: 800, 
          easing: 'easeOutExpo' 
        });
    }
  }, [loading, categories]);

  if (loading) return <LoadingSpinner />;
  if (error) return <StatusPlaceholder type="error" title="分类索引损坏" onRetry={fetchCats} />;
  if (categories.length === 0) return <StatusPlaceholder type="empty" title="暂无分类" message="目前还没有任何星火被归类" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-6">
        {categories.map((catData) => (
          <div key={catData._id} className="cat-card-animate bg-white/85 dark:bg-gray-900/90 backdrop-blur-2xl rounded-[40px] overflow-hidden border border-white/20 shadow-xl">
            <button
              onClick={() => setExpandedCategory(expandedCategory === catData._id ? null : catData._id)}
              className="w-full px-10 py-8 flex items-center justify-between hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all"
            >
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-blue-600 text-white rounded-3xl shadow-lg">
                  <FolderOpen size={32} />
                </div>
                <div className="text-left">
                  <span className="text-2xl font-black text-gray-900 dark:text-gray-100 block tracking-tighter uppercase">{catData._id}</span>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{catData.count} 篇文章</span>
                </div>
              </div>
              {expandedCategory === catData._id ? <ChevronDown size={28} className="text-blue-500" /> : <ChevronRight size={28} className="text-gray-300" />}
            </button>

            {expandedCategory === catData._id && (
              <div className="px-10 pb-12 animate-in fade-in zoom-in-95 duration-500">
                <div className="border-t dark:border-white/5 pt-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 justify-items-center">
                    {catData.posts.map(post => <PostCard key={post.id} post={post} />)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;