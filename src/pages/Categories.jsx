// src/pages/Categories.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { getCategories } from '../utils/postUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PostCard from '../components/common/PostCard'; // <-- 统一复用
import anime from 'animejs';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const categoriesRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && categoriesRef.current) {
        anime({ targets: '.category-item', translateY: [20, 0], opacity: [0, 1], delay: anime.stagger(100), duration: 800, easing: 'easeOutExpo' });
    }
  }, [loading]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" ref={categoriesRef}>
      <div className="space-y-6">
        {categories.map((catData) => (
          <div key={catData._id} className="category-item bg-white/50 dark:bg-gray-800/30 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
            <button
              onClick={() => setExpandedCategory(expandedCategory === catData._id ? null : catData._id)}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-white dark:hover:bg-gray-800 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <FolderOpen className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div className="text-left">
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100 block">{catData._id}</span>
                  <span className="text-sm text-gray-500">{catData.count} 篇文章</span>
                </div>
              </div>
              {expandedCategory === catData._id ? <ChevronDown size={24} className="text-gray-400" /> : <ChevronRight size={24} className="text-gray-400" />}
            </button>

            {expandedCategory === catData._id && (
              <div className="px-6 pb-8">
                <div className="border-t dark:border-gray-700 pt-8">
                  {/* 核心改动：使用与 Home 相同的 Flex 布局和 PostCard */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-6">
                    {catData.posts.map(post => (
                      <div key={post.id} className="w-full max-w-sm">
                        <PostCard post={post} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;