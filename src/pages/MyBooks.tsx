
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, Library, Settings2, X, Filter, Download, Search } from 'lucide-react';
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

  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{ country?: string; bookType?: string; search?: string }>({});

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <StatusPlaceholder 
          type="denied" 
          title="访问受限" 
          message="请登录后查看您的个人书单" 
          showHome={true} 
        />
      </div>
    );
  }

  useEffect(() => {
    setHideSidebars(true);
    return () => setHideSidebars(false);
  }, [setHideSidebars]);

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    fetchData(1);
  }, [filters, fetchData]);

  const execDelete = async () => {
    if (!window.confirm(`确定要删除这 ${selectedIds.length} 条记录吗？`)) return;
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
    <div className="w-full max-w-7xl mx-auto px-4 py-6 text-gray-900 dark:text-white min-h-screen pb-32">
      
      {/* 顶部布局：两个独立的磨砂容器岛屿 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
        
        {/* 左岛屿：标题区 */}
        <div className="flex items-center gap-4 px-6 py-3 rounded-[24px] bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm">
          <div className="p-2 bg-blue-600 rounded-xl">
            <Library size={20} className="text-white" />
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl md:text-2xl font-black tracking-tight whitespace-nowrap">
              个人<span className="text-blue-600">阅读记录</span>
            </h1>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-l border-gray-200 dark:border-white/10 pl-3">
              已读共计 {pagination.total} 本
            </span>
          </div>
        </div>

        {/* 右岛屿：控制区 */}
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
              <button
                onClick={execDelete}
                disabled={selectedIds.length === 0}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-[11px] hover:bg-red-600 transition-all"
              >
                删除 ({selectedIds.length})
              </button>
              <button onClick={() => { setIsSelectMode(false); setSelectedIds([]); }} className="px-3 py-2 text-[11px] font-bold text-gray-500">
                取消
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => setIsSelectMode(true)} className="flex items-center gap-2 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-xl font-bold text-[11px] hover:bg-white transition-all border border-gray-100 dark:border-transparent">
                <Settings2 size={14} /> 批量
              </button>
              <button onClick={() => setIsExportModalOpen(true)} className="hidden sm:flex items-center gap-2 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-xl font-bold text-[11px] hover:bg-white transition-all border border-gray-100 dark:border-transparent">
                <Download size={14} /> 导出
              </button>
              <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1"></div>
              <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-[11px] hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95">
                <Plus size={16} /> 记录新书
              </button>
            </>
          )}
        </div>
      </div>

      {/* 下方主体布局 */}
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
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
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
          )}

          {pagination.pages > 1 && (
            <nav className="flex justify-center items-center gap-6 mt-16">
              <button disabled={pagination.page === 1} onClick={() => fetchData(pagination.page - 1)} className="p-3 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all shadow-sm"><ChevronLeft size={20} /></button>
              <div className="text-center">
                <span className="text-lg font-black italic">{pagination.page} / {pagination.pages}</span>
              </div>
              <button disabled={pagination.page === pagination.pages} onClick={() => fetchData(pagination.page + 1)} className="p-3 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all shadow-sm"><ChevronRight size={20} /></button>
            </nav>
          )}
        </main>
      </div>

      {isCreateModalOpen && <CreateBookModal onClose={() => setIsCreateModalOpen(false)} onSuccess={() => fetchData(1)} />}
      {isExportModalOpen && <ExportModal currentFilters={filters} onClose={() => setIsExportModalOpen(false)} />}
      {detailBook && <BookDetailModal book={detailBook} onClose={() => setDetailBook(null)} onRefresh={() => fetchData(pagination.page)} />}
    </div>
  );
};

export default MyBooks;