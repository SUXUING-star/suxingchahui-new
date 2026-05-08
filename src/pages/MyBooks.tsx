import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Library, Settings2, X, Filter, Download } from 'lucide-react';
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

  // 数据状态
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // 筛选与管理状态
  const [filters, setFilters] = useState<{ country?: string; bookType?: string }>({});
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // 1. 隐藏系统侧边栏
  useEffect(() => {
    setHideSidebars(true);
    return () => setHideSidebars(false);
  }, [setHideSidebars]);

  // 2. 核心加载逻辑
  const fetchData = useCallback(async (page: number, currentFilters = filters) => {
    setLoading(true);
    try {
      const [bookRes, statsRes] = await Promise.all([
        getBooksFiltered(page, currentFilters, token),
        getBookStats(token)
      ]);
      setBooks(bookRes.data);
      setPagination(bookRes.pagination);
      setStats(statsRes.data);
      console.log('Fetched books:', bookRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token, filters]);

  // 3. 筛选条件变化监听
  useEffect(() => {
    fetchData(1, filters);
  }, [filters, fetchData]);

  // 4. 批量删除执行
  const execDelete = async () => {
    if (!window.confirm(`确认粉碎这 ${selectedIds.length} 条馆藏记录？`)) return;
    try {
      await deleteBooks(selectedIds, token);
      setSelectedIds([]);
      setIsSelectMode(false);
      fetchData(1);
    } catch (err) { alert('删除失败'); }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 text-gray-800 dark:text-white min-h-screen">

      {/* 顶部页头 */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic flex items-center gap-4">
            <Library size={40} className="text-blue-600" />
            个人<span className="text-blue-600">阅读记录</span>
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">数字化存档总计: {pagination.total}</span>
            {loading && <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSelectMode ? (
            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-right-4">
              <button onClick={execDelete} disabled={selectedIds.length === 0} className="bg-red-500 text-white px-5 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest disabled:opacity-30 transition-all">
                物理粉碎 ({selectedIds.length})
              </button>
              <button onClick={() => { setIsSelectMode(false); setSelectedIds([]); }} className="px-4 py-2 text-[11px] font-black uppercase text-gray-400 hover:text-white">
                取消
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => setIsSelectMode(true)} className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-5 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                <Settings2 size={16} /> 批量管理
              </button>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-5 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              >
                <Download size={16} /> 导出档案
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 shadow-lg shadow-blue-500/30 transition-all"
              >
                <Plus size={18} /> 录入新篇
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-10">

        {/* 左侧统计组件 */}
        <BookStatsSidebar
          stats={stats}
          activeFilters={filters}
          onFilterChange={setFilters}
        />

        {/* 右侧主内容 */}
        <main className="flex-1 space-y-8">

          {/* 筛选激活提示条 */}
          {(filters.country || filters.bookType) && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex items-center gap-3 bg-blue-600/10 text-blue-500 px-5 py-2.5 rounded-2xl border border-blue-500/20">
                <Filter size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  当前检索范围：{filters.country} {filters.bookType ? `/ ${filters.bookType}` : ''}
                </span>
                <button onClick={() => setFilters({})} className="ml-2 hover:rotate-90 transition-transform">
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* 书籍网格 */}
          {loading && books.length === 0 ? (
            <div className="flex justify-center py-40 opacity-20"><Library size={64} className="animate-pulse" /></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
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

          {/* 分页控制 */}
          {pagination.pages > 1 && (
            <nav className="flex justify-center items-center gap-8 pt-10 pb-20">
              <button disabled={pagination.page === 1} onClick={() => fetchData(pagination.page - 1)} className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-[20px] shadow-xl border border-white/10 disabled:opacity-20 hover:scale-110 transition-all">
                <ChevronLeft size={24} />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">INDEX</span>
                <span className="text-sm font-black italic">{pagination.page} / {pagination.pages}</span>
              </div>
              <button disabled={pagination.page === pagination.pages} onClick={() => fetchData(pagination.page + 1)} className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-[20px] shadow-xl border border-white/10 disabled:opacity-20 hover:scale-110 transition-all">
                <ChevronRight size={24} />
              </button>
            </nav>
          )}
        </main>
      </div>

      {/* 3. 放置弹窗组件 */}
      {isCreateModalOpen && (
        <CreateBookModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => fetchData(1)} // 成功后刷新第一页
        />
      )}
      {isExportModalOpen && (
        <ExportModal
          currentFilters={filters}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      {/* 详情与编辑弹窗 */}
      {detailBook && (
        <BookDetailModal
          book={detailBook}
          onClose={() => setDetailBook(null)}
          onRefresh={() => fetchData(pagination.page)} // 传入刷新逻辑
        />
      )}
    </div>
  );
};

export default MyBooks;