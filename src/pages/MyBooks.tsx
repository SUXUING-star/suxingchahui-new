import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Library, Settings2, X, Filter, Download, Inbox, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLayout } from '@/context/LayoutContext';
import { getBooksFiltered, deleteBooks, getBookStats, Book } from '@/utils/bookApi';

import LoadingSpinner from '@/components/common/LoadingSpinner';
import BookCard from '@/components/common/BookCard';
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
      // 这里的 getBooksFiltered 必须传入当前 filters，确保分页是针对过滤结果的
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

  // 3. 监听筛选器变化：一旦筛选条件变了，强制切回第 1 页
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
      fetchData(pagination.page); // 保持在当前页刷新
    } catch (err) {
      alert('删除失败');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-white min-h-screen pb-24">

      {/* 顶部：战略控制台 */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter italic flex items-center gap-4">
            <Library size={48} className="text-blue-600" />
            个人<span className="text-blue-600">阅读记录</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-blue-600/30"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
              DATABASE TOTAL: {pagination.total} ENTRIES
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isSelectMode ? (
            <div className="flex items-center gap-2 bg-red-500/5 p-2 rounded-[24px] border border-red-500/20 animate-in slide-in-from-right-4">
              <button
                onClick={execDelete}
                disabled={selectedIds.length === 0}
                className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest disabled:opacity-30 hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
              >
                执行物理粉碎 ({selectedIds.length})
              </button>
              <button onClick={() => { setIsSelectMode(false); setSelectedIds([]); }} className="px-5 py-3 text-[11px] font-black uppercase text-gray-500 hover:text-white transition-colors">
                取消
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setIsSelectMode(true)} className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                <Settings2 size={16} /> 批量管理
              </button>
              <div className="relative flex items-center group">
              <input 
                type="text"
                placeholder="搜索记录..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setFilters(prev => ({ ...prev, search }))}
                className="bg-gray-100 dark:bg-white/5 border border-transparent focus:border-blue-600/50 rounded-2xl py-2.5 pl-10 pr-4 text-[11px] font-black uppercase tracking-widest outline-none w-40 focus:w-64 transition-all"
              />
              <Search size={14} className="absolute left-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              {search && (
                <button 
                  onClick={() => { setSearch(''); setFilters(prev => ({ ...prev, search: '' })); }}
                  className="absolute right-3 text-gray-400 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>
              <button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                <Download size={16} /> 导出档案
              </button>
              <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 shadow-xl shadow-blue-500/30 transition-all">
                <Plus size={20} /> 录入新篇
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">

        {/* 左侧：统计与筛选面板 */}
        <aside className="lg:w-72 flex-shrink-0">
          <BookStatsSidebar
            stats={stats}
            activeFilters={filters}
            onFilterChange={setFilters}
          />
        </aside>

        {/* 右侧：内容主场 */}
        <main className="flex-1 min-w-0">

          {/* 筛选激活 Tip */}
          {(filters.country || filters.bookType) && (
            <div className="mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-left-4">
              <div className="flex items-center gap-3 bg-blue-600 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
                <Filter size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  FILTER ACTIVE: {filters.country} {filters.bookType && `/ ${filters.bookType}`}
                </span>
                <button onClick={() => setFilters({})} className="ml-2 hover:rotate-90 transition-transform bg-white/20 rounded-full p-0.5">
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* 数据展示区 */}
          {loading ? (
            <div className="min-h-[500px] flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : books.length === 0 ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-gray-500 opacity-40 space-y-4">
              <Inbox size={64} strokeWidth={1} />
              <p className="font-black text-xs uppercase tracking-[0.4em]">此筛选范围内无任何存档</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
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

              {/* 分页控制：确保翻页时带着当前 filters */}
              {pagination.pages > 1 && (
                <nav className="flex justify-center items-center gap-12 mt-20">
                  <button
                    disabled={pagination.page === 1}
                    onClick={() => fetchData(pagination.page - 1)}
                    className="group p-6 bg-white dark:bg-white/5 rounded-[32px] shadow-xl border border-white/10 disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                  >
                    <ChevronLeft size={28} />
                  </button>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 mb-1">PAGE</span>
                    <span className="text-2xl font-black italic tracking-tighter">
                      {pagination.page} <span className="text-blue-600 mx-1">/</span> {pagination.pages}
                    </span>
                  </div>

                  <button
                    disabled={pagination.page === pagination.pages}
                    onClick={() => fetchData(pagination.page + 1)}
                    className="group p-6 bg-white dark:bg-white/5 rounded-[32px] shadow-xl border border-white/10 disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                  >
                    <ChevronRight size={28} />
                  </button>
                </nav>
              )}
            </>
          )}
        </main>
      </div>

      {/* 弹窗图层 */}
      {isCreateModalOpen && (
        <CreateBookModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => fetchData(1)}
        />
      )}

      {isExportModalOpen && (
        <ExportModal
          currentFilters={filters}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      {detailBook && (
        <BookDetailModal
          book={detailBook}
          onClose={() => setDetailBook(null)}
          onRefresh={() => fetchData(pagination.page)}
        />
      )}
    </div>
  );
};

export default MyBooks;