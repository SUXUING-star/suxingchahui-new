// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import PostCard from '../components/common/PostCard';
import { getPaginatedPosts, getTagsData, getCategories } from '../utils/postUtils'; // 引入分页API和筛选数据API
import anime from 'animejs';

const POSTS_PER_PAGE = 24;

function Home() {
  // --- 状态管理 ---
  const [posts, setPosts] = useState([]);         // 当前页文章
  const [pinnedPosts, setPinnedPosts] = useState([]); // 置顶文章
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // 筛选状态
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // 筛选选项
  const [allTags, setAllTags] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  const filterRef = useRef(null);
  const paginationRef = useRef(null);
  const pinnedSectionRef = useRef(null);
  
  // --- 1. 获取所有筛选选项（标签和分类） ---
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // 假设 getTagsData 和 getCategories 返回的是文章列表，需要前端解析出所有标签/分类名
        const tagsData = await getTagsData(); 
        const categoriesData = await getCategories(); // 假设返回 [{_id: 'CategoryName', count: 10, posts: []}, ...]
        
        // 从 tagsData 中收集所有标签
        const tags = new Set();
        tagsData.forEach(post => {
            (post.tags || []).forEach(tag => tags.add(tag));
        });

        // 从 categoriesData 中收集所有分类
        const categories = categoriesData.map(c => c._id);
        
        setAllTags(Array.from(tags).sort());
        setAllCategories(categories.sort());

      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };
    fetchFilters();
  }, []);

  // --- 2. 核心数据获取逻辑 (分页和筛选) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getPaginatedPosts({ 
          page: currentPage, 
          limit: POSTS_PER_PAGE,
          category: selectedCategory, 
          tag: selectedTag 
        });
        
        setPosts(data.posts);
        // 注意：后端返回的 pinnedPosts 是所有置顶文章，前端需要再次筛选以匹配当前分类/标签
        const filteredPinned = data.pinnedPosts.filter(post => {
            const tagMatch = !selectedTag || (post.tags && post.tags.includes(selectedTag));
            const categoryMatch = !selectedCategory || post.category === selectedCategory;
            return tagMatch && categoryMatch;
        });
        
        setPinnedPosts(filteredPinned);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // 当页码或筛选条件变化时，重新获取数据
  }, [currentPage, selectedCategory, selectedTag]);

  // --- 3. 筛选变化时重置页码 ---
  useEffect(() => {
    // 只有当筛选条件变化，且当前页不是第一页时，才重置
    if (currentPage !== 1) {
        setCurrentPage(1);
    }
  }, [selectedCategory, selectedTag]); 

  // --- 4. 动画效果 ---
  useEffect(() => {
    if (!loading) {
      requestAnimationFrame(() => {
        // 置顶区域动画
        if (pinnedSectionRef.current && pinnedPosts.length > 0) {
          anime({ targets: '.pinned-card-item', translateY: [20, 0], opacity: [0, 1], delay: anime.stagger(100), duration: 800, easing: 'easeOutExpo' });
        }
        // 普通文章区域动画
        if (posts.length > 0) {
          anime({ targets: '.post-card-item', translateY: [20, 0], opacity: [0, 1], delay: anime.stagger(100), duration: 800, easing: 'easeOutExpo' });
        }
        if (filterRef.current) {
          anime({ targets: filterRef.current, translateY: [20, 0], opacity: [0, 1], duration: 800, easing: 'easeOutExpo' });
        }
        if (paginationRef.current) {
          anime({ targets: paginationRef.current, translateY: [20, 0], opacity: [0, 1], duration: 800, easing: 'easeOutExpo' });
        }
      });
    }
  }, [loading, posts, pinnedPosts]);


  // --- 5. 分页组件 ---
  const Pagination = () => {
    if (posts.length === 0 || totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    const handlePageClick = (pageNumber) => {
      if (pageNumber < 1 || pageNumber > totalPages) return;
      setCurrentPage(pageNumber);
      
      anime({
        targets: [document.documentElement, document.body],
        scrollTop: 0,
        duration: 500,
        easing: 'easeInOutQuad'
      });
    };

    return (
      <div className="flex justify-center items-center space-x-2 mt-8" ref={paginationRef}>
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-50"
        >
          上一页
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageClick(1)}
              className="px-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => handlePageClick(number)}
            className={`px-4 py-2 rounded-md ${
              currentPage === number 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600'
            }`}
          >
            {number}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <button
              onClick={() => handlePageClick(totalPages)}
              className="px-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-50"
        >
          下一页
        </button>
      </div>
    );
  };
  
  if (loading && posts.length === 0) {
    // 初始加载时的全屏 Spinner 或骨架屏
    return <div className="py-20 text-center">加载中...</div>;
  }

  return (
    <div className="w-full py-6">
      
      {/* 筛选器 */}
      <div className="mb-6" ref={filterRef}>
        {/* 为了保持筛选器和内容对齐，这里保留了内层筛选器容器的左右 padding */}
        <div className="px-4"> 
            <div className="flex flex-wrap gap-4">
          <select
            value={selectedTag}
            onChange={e => setSelectedTag(e.target.value)}
            className="block py-2 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">所有标签</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
  
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="block py-2 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">所有分类</option>
            {allCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {(selectedTag || selectedCategory) && (
            <button 
              onClick={() => {
                setSelectedTag('');
                setSelectedCategory('');
              }}
              className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white"
            >
              重置筛选
            </button>
          )}
          </div>
        </div>
      </div>

      <div className="px-4">
        
      {/* 置顶文章区域 */}
      {pinnedPosts.length > 0 && (        
        <div className="mb-8" ref={pinnedSectionRef}>
          <div className="mb-6 flex items-center">
            {/* 移除背景、边框和 padding，只保留图标和文字 */}
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11.46 10.88c-.39.33-.92.56-1.46.56-.54 0-1.07-.23-1.46-.56l2.92-2.92-2.92 2.92zM19 9l-7-7-7 7V20h14V9z"/>
              </svg>
              <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">置顶文章</h2>
            </div>
            {/* 移除分割线 */}
          </div>
            
            {/* 置顶文章使用 flex 布局 + max-w-sm 来保证卡片美观 */}
            <div className="flex flex-wrap justify-center gap-6">
              {pinnedPosts.map((post) => (
                <div 
                  key={post.id}
                  className="pinned-card-item relative rounded-lg w-full max-w-sm"
                >
                  <div className="absolute -top-2 -right-2 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-500 text-white shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" /></svg>
                      置顶
                    </span>
                  </div>
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 普通文章区域标题 */}
        {posts.length > 0 && (
          <div className="mb-6 flex items-center">
            {/* 移除背景、边框和 padding，只保留图标和文字 */}
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
              <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                {pinnedPosts.length > 0 ? '最新文章' : '全部文章'}
              </h2>
            </div>
            {/* 移除分割线 */}
          </div>
        )}
                
        {/* 普通文章列表 */}
        <div className="flex flex-wrap justify-center gap-6">
          {posts.map((post) => (
            <div 
              key={post.id}
              className="post-card-item w-full max-w-sm" // 宽度控制
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {posts.length === 0 && pinnedPosts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              没有找到相关文章
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              尝试更换其他筛选条件
            </p>
          </div>
        )}

        {/* 分页导航 */}
        {posts.length > 0 && totalPages > 1 && <Pagination />}
      </div>
    </div>
  );
}

export default Home;