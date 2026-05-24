import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Library, Settings2, X, Download, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLayout } from '@/context/LayoutContext';
import { getBooksFiltered, deleteBooks, getBookStats, Book } from '@/utils/bookApi';

import LoadingSpinner from '@/components/common/LoadingSpinner';
import BookCard from '@/components/book/BookCard';
import BookDetailModal from '@/components/book/BookDetailModal';
import BookStatsSidebar from '@/components/book/BookStatsSidebar';
import CreateBookModal from '@/components/book/CreateBookModal';
import ExportModal from '@/components/book/ExportModal';
import StatusPlaceholder from '@/components/common/StatusPlaceholder';

const MyBooks: React.FC = () => {
  const { token } = useAuth();
  const { setHideSidebars } = useLayout();
  const navigate = useNavigate();

  // --- 状态管理 ---
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); 
  const [fetchingNextPage, setFetchingNextPage] = useState(false); 
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [hasMore, setHasMore] = useState(false); // 是否还有更多

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{ 
    country?: string; 
    bookType?: string; 
    search?: string;
    author?: string;
    year?: string;
  }>({});

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // 💡 用来存当前页码，防止闭包拿不到最新的
  const pageRef = useRef(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  /**
   * 核心拉取逻辑
   */
  const fetchData = useCallback(async (targetPage: number, append = false) => {
    if (!token) return;
    
    if (append) setFetchingNextPage(true);
    else setLoading(true);

    try {
      const params = { ...filters, limit: 20 };
      const [bookRes, statsRes] = await Promise.all([
        getBooksFiltered(targetPage, params, token),
        getBookStats(token)
      ]);

      const newBooks = bookRes.data;
      const { page, pages, total } = bookRes.pagination;

      if (append) {
        setBooks(prev => [...prev, ...newBooks]);
      } else {
        setBooks(newBooks);
      }
      
      setPagination({ page, pages, total });
      setHasMore(page < pages);
      pageRef.current = page;
      setStats(statsRes.data);
    } catch (err) {
      console.error('加载失败:', err);
    } finally {
      setLoading(false);
      setFetchingNextPage(false);
    }
  }, [token, filters]);

  // 初始加载 & 筛选重置
  useEffect(() => {
    fetchData(1, false);
  }, [filters, fetchData]);

  // 💡 滚动监听：更鲁棒的实现
  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      entries => {
        const first = entries[0];
        // 如果正在交叉，且不是初始加载，且不在拉取下一页，且确定还有更多
        if (first.isIntersecting && !loading && !fetchingNextPage && hasMore) {
          fetchData(pageRef.current + 1, true);
        }
      },
      { threshold: 0.1, rootMargin: '200px' } // 提前 200px 触发，体验更爽
    );

    observer.observe(currentTarget);
    return () => observer.disconnect();
  }, [loading, fetchingNextPage, hasMore, fetchData]);

  // 全屏模式处理
  useEffect(() => {
    setHideSidebars(true);
    return () => setHideSidebars(false);
  }, [setHideSidebars]);

  // 筛选后滚动回顶
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters]);

  const execDelete = async () => {
    if (!window.confirm(`确定要删除这 ${selectedIds.length} 条记录吗？`)) return;
    try {
      await deleteBooks(selectedIds, token);
      setSelectedIds([]);
      setIsSelectMode(false);
      fetchData(1, false);
    } catch (err) {
      alert('删除失败');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <StatusPlaceholder type="denied" title="访问受限" message="请登录后查看个人记录" showHome={true} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 text-gray-900 dark:text-white min-h-screen pb-32">
      
      {/* 顶部布局：增加返回按钮 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-3 px-4 py-3 rounded-[24px] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm shrink-0">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline text-xs font-bold">首页</span>
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1"></div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight">个人记录</h1>
          <span className="text-[10px] font-bold text-gray-400 border-l border-gray-200 dark:border-white/10 pl-3">
            共 {pagination.total} 条
          </span>
        </div>

        {/* 检索与操作 */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 px-4 py-3 rounded-[24px] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm">
          {!isSelectMode && (
            <div className="relative group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" placeholder="快速检索..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setFilters(prev => ({ ...prev, search }))}
                className="bg-gray-100/50 dark:bg-white/10 border-none rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none w-28 md:w-48"
              />
            </div>
          )}

          {isSelectMode ? (
            <div className="flex items-center gap-2">
              <button onClick={execDelete} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-[11px]">删除</button>
              <button onClick={() => { setIsSelectMode(false); setSelectedIds([]); }} className="px-3 py-2 text-[11px] font-bold text-gray-500">取消</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => setIsSelectMode(true)} className="flex items-center gap-2 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-xl font-bold text-[11px] border border-gray-100 dark:border-transparent"><Settings2 size={14} /> 批量</button>
              <button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-xl font-bold text-[11px] border border-gray-100 dark:border-transparent"><Download size={14} /> 导出</button>
              <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-[11px] hover:bg-blue-700 shadow-md transition-all active:scale-95"><Plus size={16} /> 记录</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <BookStatsSidebar stats={stats} activeFilters={filters} onFilterChange={setFilters} />
        </aside>

        <main className="flex-1 min-w-0">
          {/* 筛选标签 */}
          {Object.values(filters).some(v => v) && (
            <div className="mb-6 flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-[10px] font-bold w-fit">
              <span>正在筛选: {filters.country || '全部'} {filters.bookType && `· ${filters.bookType}`}</span>
              <button onClick={() => {setFilters({}); setSearch('');}}><X size={12} /></button>
            </div>
          )}

          {loading ? (
            <div className="min-h-[400px] flex items-center justify-center"><LoadingSpinner /></div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
                {books.map(book => (
                  <BookCard
                    key={book._id}
                    book={book}
                    isSelectMode={isSelectMode}
                    isSelected={selectedIds.includes(book._id)}
                    onToggleSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                    onClick={setDetailBook}
                  />
                ))}
              </div>

              {/* 💡 触发点：必须保证这个 div 能被观察到 */}
              <div ref={observerTarget} className="w-full h-32 flex items-center justify-center mt-12">
                {fetchingNextPage ? (
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-bold animate-pulse">
                    <LoadingSpinner /> 
                  </div>
                ) : (
                  !hasMore && books.length > 0 && (
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">已经到底了</p>
                  )
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {isCreateModalOpen && <CreateBookModal onClose={() => setIsCreateModalOpen(false)} onSuccess={() => fetchData(1, false)} />}
      {isExportModalOpen && <ExportModal currentFilters={filters} onClose={() => setIsExportModalOpen(false)} />}
      {detailBook && <BookDetailModal book={detailBook} onClose={() => setDetailBook(null)} onRefresh={() => fetchData(1, false)} />}
    </div>
  );
};

export default MyBooks;