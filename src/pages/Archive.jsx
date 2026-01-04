// src/pages/Archive.jsx
import React, { useState, useEffect, useRef } from 'react';
import { getArchive } from '../utils/postUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PostCard from '../components/common/PostCard'; // <-- 统一复用
import anime from 'animejs';

function Archive() {
  const [archiveData, setArchiveData] = useState({});
  const [loading, setLoading] = useState(true);
  const archiveRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const posts = await getArchive();
        const grouped = posts.reduce((acc, post) => {
          const date = new Date(post.date);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          if (!acc[year]) acc[year] = {};
          if (!acc[year][month]) acc[year][month] = [];
          acc[year][month].push(post);
          return acc;
        }, {});
        setArchiveData(grouped);
      } catch (error) {
        console.error('Error fetching archive:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" ref={archiveRef}>
      <div className="space-y-16">
        {Object.entries(archiveData).sort((a, b) => b[0] - a[0]).map(([year, months]) => (
          <div key={year} className="space-y-10">
            <div className="sticky top-16 z-10 py-4 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md">
              <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 flex items-baseline">
                {year}
                <span className="ml-4 text-lg font-normal text-gray-500 italic">YEAR ARCHIVE</span>
              </h2>
            </div>
            
            <div className="space-y-12 pl-4 border-l-2 border-gray-200 dark:border-gray-800">
              {Object.entries(months).sort((a, b) => b[0] - a[0]).map(([month, posts]) => (
                <div key={month} className="space-y-6">
                  <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center">
                    <span className="w-8 h-[2px] bg-blue-600 mr-3"></span>
                    {month}月
                  </h3>
                  {/* 核心改动：统一卡片展示 */}
                  <div className="flex flex-wrap gap-6">
                    {posts.map((post) => (
                      <div key={post.id} className="w-full max-w-sm">
                        <PostCard post={post} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Archive;