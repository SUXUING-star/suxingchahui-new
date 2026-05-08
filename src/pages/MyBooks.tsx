import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Library, Settings2, X, Filter, Download, Inbox, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLayout } from '@/context/LayoutContext';
import { getBooksFiltered, deleteBooks, getBookStats, Book } from '@/utils/bookApi';

import LoadingSpinner from '@/components/common/LoadingSpinner';
import BookCard from '@/components/book/BookCard';
import BookDetailModal from '@/components/book/BookDetailModal';
import BookStatsSidebar from '@/components/book/BookStatsSidebar';
import CreateBookModal from '@/components/book/CreateBookModal';
import ExportModal from '@/components/book/ExportModal';

const MyBooks: React.FC = () => {
  const { token } = useAuth();
  const { setHideSidebars } = useLayout();

  // --- 核心状态 ---
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // --- 筛选与弹窗状态 ---
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{ country?: string; bookType?: string; search?: string }>({});

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // 1. 布局副作用
  useEffect(() => {
    setHideSidebars(true);
    return () => setHideSidebars(false);
  }, [setHideSidebars]);

  // 2. 数据获取核心 (支持指定页码)
  const fetchData = useCallback(async (targetPage: number) => {
    setLoading(true);
    try {
      const [bookRes, statsRes] = await Promise.all([
        getBooksFiltered(targetPage, filters, token),
        getBookStats(token)
      ]);

      setBooks(bookRes.data);
      setPagination(bookRes.pagination);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Data Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  // 3. 监听筛选器变化
  useEffect(() => {
    fetchData(1);
  }, [filters, fetchData]);

  // 4. 执行物理粉碎
  const execDelete = async () => {
    if (!window.confirm(`警告：确认永久粉碎这 ${selectedIds.length} 条馆藏记录？此操作不可逆。`)) return;
    try {
      await deleteBooks(selectedIds, token);
      setSelectedIds([]);
      setIsSelectMode(false);
      fetchData(pagination.page); 
    } catch (err) {
      alert('删除失败');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-8 text-gray-800 dark:text-white min-h-screen pb-24">

      {/* 顶部：战略控制台 - 移动端优化 padding 和字号 */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-12 gap-4 md:gap-8">
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-2xl md:text-5xl font-black tracking-tighter italic flex items-center gap-2 md:gap-4">
            <Library size={32} className="text-blue-600 md:w-12 md:h-12 shrink-0" />
            <span className="truncate">个人<span className="text-blue-600">阅读记录</span></span>
          </h1>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="h-[1px] w-8 md:w-12 bg-blue-600/30"></div>
            <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.4em]">
              DATABASE TOTAL: {pagination.total} ENTRIES
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {isSelectMode ? (
            <div className="flex items-center gap-1.5 md:gap-2 bg-red-500/5 p-1 md:p-2 rounded-xl md:rounded-[24px] border border-red-500/20 animate-in slide-in-from-right-4">
              <button
                onClick={execDelete}
                disabled={selectedIds.length === 0}
                className="bg-red-600 text-white px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-widest disabled:opacity-30 hover:bg-red-700 transition-all shadow-lg"
              >
                执行物理粉碎 ({selectedIds.length})
              </button>
              <button onClick={() => { setIsSelectMode(false); setSelectedIds([]); }} className="px-3 md:px-5 py-2 md:py-3 text-[9px] md:text-[11px] font-black uppercase text-gray-500 hover:text-white transition-colors">
                取消
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 md:gap-3">
              <button onClick={() => setIsSelectMode(true)} className="flex items-center gap-1.5 md:gap-2 bg-gray-100 dark:bg-white/5 px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all border border-transparent">
                <Settings2 size={14} className="md:w-4 md:h-4" /> 批量
              </button>
              <div className="relative flex items-center group">
                <input 
                  type="text"
                  placeholder="搜索..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setFilters(prev => ({ ...prev, search }))}
                  className="bg-gray-100 dark:bg-white/5 border border-transparent focus:border-blue-600/50 rounded-lg md:rounded-2xl py-2 md:py-2.5 pl-8 md:pl-10 pr-2 md:pr-4 text-[9px] md:text-[11px] font-black uppercase outline-none w-24 md:w-40 focus:w-32 md:focus:w-64 transition-all"
                />
                <Search size={12} className="absolute left-2.5 md:left-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-1.5 md:gap-2 bg-blue-600 text-white px-3 md:px-8 py-2 md:py-3 rounded-lg md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-widest hover:scale-105 shadow-xl shadow-blue-500/30 transition-all">
                <Plus size={16} /> 录入
              </button>
            </div>
          )}
        </div>
      </header>

      {/* --- 强制左右分栏容器 --- */}
      <div className="flex flex-row gap-2 md:gap-12">

        {/* 左侧：统计面板 - 移动端强制变窄 */}
        <aside className="w-[70px] sm:w-[100px] md:w-64 lg:w-72 flex-shrink-0">
          <BookStatsSidebar
            stats={stats}
            activeFilters={filters}
            onFilterChange={setFilters}
          />
        </aside>

        {/* 右侧：主场 - 强制网格双列 */}
        <main className="flex-1 min-w-0">

          {/* 筛选 Tip */}
          {(filters.country || filters.bookType) && (
            <div className="mb-4 md:mb-8 flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
              <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg md:rounded-2xl shadow-lg">
                <Filter size={12} className="shrink-0" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest truncate">
                  {filters.country || 'ALL'} / {filters.bookType || 'ALL'}
                </span>
                <button onClick={() => setFilters({})} className="ml-1 hover:rotate-90 transition-transform bg-white/20 rounded-full p-0.5">
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="min-h-[300px] flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : books.length === 0 ? (
            <div className="min-h-[300px] flex flex-col items-center justify-center text-gray-500 opacity-40 space-y-4">
              <Inbox size={48} strokeWidth={1} />
              <p className="font-black text-[10px] uppercase tracking-widest">无存档</p>
            </div>
          ) : (
            <>
              {/* 重点：grid-cols-2 强制移动端双列 */}
              <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6 animate-in fade-in duration-500">
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

              {/* 分页控制 */}
              {pagination.pages > 1 && (
                <nav className="flex justify-center items-center gap-4 md:gap-12 mt-10 md:mt-20">
                  <button
                    disabled={pagination.page === 1}
                    onClick={() => fetchData(pagination.page - 1)}
                    className="p-3 md:p-6 bg-white dark:bg-white/5 rounded-xl md:rounded-[32px] border border-white/10 disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all shadow-md"
                  >
                    <ChevronLeft size={20} className="md:w-7 md:h-7" />
                  </button>

                  <div className="flex flex-col items-center">
                    <span className="text-[8px] md:text-[10px] font-black uppercase text-gray-500">PAGE</span>
                    <span className="text-sm md:text-2xl font-black italic">
                      {pagination.page} <span className="text-blue-600">/</span> {pagination.pages}
                    </span>
                  </div>

                  <button
                    disabled={pagination.page === pagination.pages}
                    onClick={() => fetchData(pagination.page + 1)}
                    className="p-3 md:p-6 bg-white dark:bg-white/5 rounded-xl md:rounded-[32px] border border-white/10 disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all shadow-md"
                  >
                    <ChevronRight size={20} className="md:w-7 md:h-7" />
                  </button>
                </nav>
              )}
            </>
          )}
        </main>
      </div>

      {/* 弹窗 */}
      {isCreateModalOpen && <CreateBookModal onClose={() => setIsCreateModalOpen(false)} onSuccess={() => fetchData(1)} />}
      {isExportModalOpen && <ExportModal currentFilters={filters} onClose={() => setIsExportModalOpen(false)} />}
      {detailBook && <BookDetailModal book={detailBook} onClose={() => setDetailBook(null)} onRefresh={() => fetchData(pagination.page)} />}
    </div>
  );
};

export default MyBooks;