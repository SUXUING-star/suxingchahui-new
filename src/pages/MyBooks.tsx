import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Library, Settings2, X, Download, Search } from 'lucide-react';
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

  // 数据状态
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // 初始加载
  const [fetchingNextPage, setFetchingNextPage] = useState(false); // 滚动加载中
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // 筛选状态
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{ country?: string; bookType?: string; search?: string }>({});

  // 交互状态
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // 滚动监听引用
  const observerTarget = useRef<HTMLDivElement>(null);

  /**
   * 核心拉取逻辑
   * @param targetPage 目标页码
   * @param append 是否是追加模式（滚动加载）
   */
  const fetchData = useCallback(async (targetPage: number, append = false) => {
    if (!token) return;
    
    if (append) {
      setFetchingNextPage(true);
    } else {
      setLoading(true);
    }

    try {
      // 强制 limit 为 20
      const params = { ...filters, limit: 20 };
      const [bookRes, statsRes] = await Promise.all([
        getBooksFiltered(targetPage, params, token),
        getBookStats(token)
      ]);

      if (append) {
        setBooks(prev => [...prev, ...bookRes.data]);
      } else {
        setBooks(bookRes.data);
      }
      
      setPagination(bookRes.pagination);
      setStats(statsRes.data);
    } catch (err) {
      console.error('加载失败:', err);
    } finally {
      setLoading(false);
      setFetchingNextPage(false);
    }
  }, [token, filters]);

  // 筛选条件变化时，重置列表回到第一页
  useEffect(() => {
    fetchData(1, false);
  }, [filters, fetchData]);

  // 监听滚动到底部
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && !fetchingNextPage && pagination.page < pagination.pages) {
          fetchData(pagination.page + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loading, fetchingNextPage, pagination, fetchData]);

  // 侧边栏处理
  useEffect(() => {
    setHideSidebars(true);
    return () => setHideSidebars(false);
  }, [setHideSidebars]);

   // --- 新增：回顶逻辑 ---
  useEffect(() => {
    // 只要筛选条件（国家、类型、搜索词）发生变化，就滚动回顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters]);

  const execDelete = async () => {
    if (!window.confirm(`确定要删除这 ${selectedIds.length} 条记录吗？`)) return;
    try {
      await deleteBooks(selectedIds, token);
      setSelectedIds([]);
      setIsSelectMode(false);
      fetchData(1, false); // 删除后重置到第一页比较保险
    } catch (err) {
      alert('删除失败');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <StatusPlaceholder type="denied" title="访问受限" message="请登录后查看您的个人书单" showHome={true} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 text-gray-900 dark:text-white min-h-screen pb-32">
      
      {/* 顶部布局 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4 px-6 py-3 rounded-[24px] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm">
          <div className="p-2 bg-blue-600 rounded-xl"><Library size={20} className="text-white" /></div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl md:text-2xl font-black tracking-tight">个人<span className="text-blue-600">阅读记录</span></h1>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-l border-gray-200 dark:border-white/10 pl-3">
              已读共计 {pagination.total} 本
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3 px-4 py-3 rounded-[24px] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm">
          {!isSelectMode && (
            <div className="relative group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"
                placeholder="快速检索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setFilters(prev => ({ ...prev, search }))}
                className="bg-gray-100/50 dark:bg-white/10 border-none focus:ring-2 focus:ring-blue-500/20 rounded-xl py-2 pl-9 pr-4 text-xs font-bold outline-none w-32 md:w-48 transition-all"
              />
            </div>
          )}

          {isSelectMode ? (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
              <button onClick={execDelete} disabled={selectedIds.length === 0} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-[11px] hover:bg-red-600">删除 ({selectedIds.length})</button>
              <button onClick={() => { setIsSelectMode(false); setSelectedIds([]); }} className="px-3 py-2 text-[11px] font-bold text-gray-500">取消</button>
            </div>
          ) : (
            <>
              <button onClick={() => setIsSelectMode(true)} className="flex items-center gap-2 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-xl font-bold text-[11px] border border-gray-100 dark:border-transparent"><Settings2 size={14} /> 批量</button>
              <button onClick={() => setIsExportModalOpen(true)} className="hidden sm:flex items-center gap-2 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-xl font-bold text-[11px] border border-gray-100 dark:border-transparent"><Download size={14} /> 导出</button>
              <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1"></div>
              <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-[11px] hover:bg-blue-700 shadow-md transition-all active:scale-95"><Plus size={16} /> 记录新书</button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-4">
        <aside className="w-full md:w-64 shrink-0">
          <BookStatsSidebar stats={stats} activeFilters={filters} onFilterChange={setFilters} />
        </aside>

        <main className="flex-1 min-w-0">
          {(filters.country || filters.bookType || filters.search) && (
            <div className="mb-6 flex flex-wrap gap-2">
              <div className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                <span>筛选: {filters.country || '全部'} · {filters.bookType || '全部'}</span>
                <button onClick={() => {setFilters({}); setSearch('');}}><X size={12} /></button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="min-h-[300px] flex items-center justify-center"><LoadingSpinner /></div>
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

              {/* 底部触发点和加载状态 */}
              <div ref={observerTarget} className="w-full h-20 flex items-center justify-center mt-10">
                {fetchingNextPage && (
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                    <LoadingSpinner /> 正在加载更多作品...
                  </div>
                )}
                {!fetchingNextPage && pagination.page >= pagination.pages && books.length > 0 && (
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest opacity-50">已经到底了 · 没更多了</p>
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