// src/components/common/Search.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X as CloseIcon, Loader2 } from 'lucide-react';
import _ from 'lodash';
import { apiSearchPosts } from '../../utils/postUtils'; // 使用新封装的搜索 API

function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 核心：调用后端 API 的搜索逻辑（带防抖）
  const performSearch = useCallback(
    _.debounce(async (term) => {
      if (!term.trim()) {
        setSearchResults([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const results = await apiSearchPosts(term);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500), // 500ms 防抖，防止敲一个字请求一次
    []
  );

  useEffect(() => {
    performSearch(searchTerm);
  }, [searchTerm, performSearch]);

  const highlightText = (text, term) => {
    if (!term.trim() || typeof text !== 'string') return text;
    const regex = new RegExp(`(${_.escapeRegExp(term)})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 text-black dark:text-white rounded-sm px-0.5">{part}</mark> : part
    );
  };

  return (
    <div className="relative" ref={searchRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
        <SearchIcon size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:absolute sm:right-0 mt-0 sm:mt-2 w-full sm:w-96 bg-white dark:bg-gray-800 sm:rounded-2xl shadow-2xl z-50 border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* 输入框 */}
          <div className="flex items-center gap-2 p-4 border-b dark:border-gray-700">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="搜索内容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                autoFocus
              />
              {loading && <Loader2 className="absolute right-3 top-2.5 animate-spin text-blue-500" size={18} />}
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600"><CloseIcon size={20}/></button>
          </div>

          {/* 结果列表 */}
          <div className="max-h-[70vh] sm:max-h-96 overflow-y-auto p-2">
            {searchResults.map((post) => (
              <button
                key={post.id}
                onClick={() => {
                  navigate(`/post/${post.id}`);
                  setIsOpen(false);
                }}
                className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors group"
              >
                <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                  {highlightText(post.title, searchTerm)}
                </div>
                {post.category && (
                  <div className="text-xs text-gray-500 mt-1">分类：{post.category}</div>
                )}
                <div className="flex gap-1 mt-2">
                  {post.tags.slice(0,3).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-900 rounded-full text-gray-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}

            {searchTerm && !loading && searchResults.length === 0 && (
              <div className="py-10 text-center text-gray-500 text-sm">
                找不到相关文章 ¯\_(ツ)_/¯
              </div>
            )}
            
            {!searchTerm && (
              <div className="py-10 text-center text-gray-400 text-sm italic">
                输入关键词开始搜索...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;