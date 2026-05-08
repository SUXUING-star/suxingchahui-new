import React, { useState, useEffect } from 'react';
import { X, BookOpen, User, Globe, Tag, MessageSquare, Edit3, Save, RotateCcw, Plus, Trash2, List } from 'lucide-react';
import { Book, updateBook } from '@/utils/bookApi';
import { useAuth } from '@/context/AuthContext';

interface Props {
  book: Book;
  onClose: () => void;
  onRefresh?: () => void;
}

const BookDetailModal: React.FC<Props> = ({ book, onClose, onRefresh }) => {
  const { token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // 初始化表单状态
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    country: book.country,
    status: book.status as 'read' | 'unread',
    bookType: book.bookType || 'novel',
    stories: book.stories || [],
    shortReview: book.shortReview || '',
    longReview: book.longReview || ''
  });

  // 篇目操作逻辑
  const addStory = () => setFormData(p => ({ ...p, stories: [...p.stories, ''] }));
  const removeStory = (index: number) => setFormData(p => ({ ...p, stories: p.stories.filter((_, i) => i !== index) }));
  const updateStory = (index: number, val: string) => {
    const newStories = [...formData.stories];
    newStories[index] = val;
    setFormData({ ...formData, stories: newStories });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateBook(book._id, formData, token);
      setIsEditing(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('档案同步失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>

      <div className="relative w-full max-w-3xl bg-white dark:bg-[#0a0a0a] rounded-[40px] shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 md:p-12 overflow-y-auto max-h-[90vh]">
          
          {/* 头部：标题与基础信息 */}
          <header className="flex justify-between items-start mb-10">
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <input
                  className="text-4xl font-black tracking-tighter uppercase italic text-blue-600 bg-gray-100 dark:bg-white/5 border-none rounded-2xl px-5 py-3 w-full focus:ring-2 ring-blue-500 transition-all"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              ) : (
                <h2 className="text-4xl font-black tracking-tighter uppercase italic text-blue-600">{formData.title}</h2>
              )}

              <div className="flex flex-wrap gap-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2">
                  <User size={14} className="text-blue-500" />
                  {isEditing ? (
                    <input className="bg-transparent border-b border-gray-700 focus:outline-none focus:border-blue-500 pb-1" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} />
                  ) : formData.author}
                </span>
                <span className="flex items-center gap-2">
                  <Globe size={14} className="text-emerald-500" />
                  {isEditing ? (
                    <select className="bg-transparent border-b border-gray-700 focus:outline-none" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })}>
                      {['中', '日', '欧', '俄', '美', '其他'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : formData.country}
                </span>
                <span className="flex items-center gap-2">
                  <Tag size={14} className="text-orange-500" />
                  {isEditing ? (
                    <select className="bg-transparent border-b border-gray-700 focus:outline-none uppercase" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                      <option value="read">已阅</option>
                      <option value="unread">待读</option>
                    </select>
                  ) : (formData.status === 'read' ? 'ARCHIVED / 已阅' : 'PENDING / 待读')}
                </span>
              </div>
            </div>

            <div className="flex gap-3 ml-6">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`p-4 rounded-2xl transition-all ${isEditing ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'bg-gray-100 dark:bg-white/5 hover:scale-110'}`}
              >
                {isEditing ? <RotateCcw size={20} /> : <Edit3 size={20} />}
              </button>
              <button onClick={onClose} className="p-4 hover:bg-red-500 hover:text-white dark:bg-white/5 rounded-2xl transition-all">
                <X size={20} />
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-12 space-y-10">
              
              {/* 短篇集篇目展示/编辑区 */}
              {formData.bookType === 'collection' && (
                <section className="bg-blue-600/5 rounded-[32px] p-8 border border-blue-500/10">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-6">
                    <List size={14} /> 收录篇目 / Stories Inventory
                  </h4>
                  
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {formData.stories.map((story, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white dark:bg-black/20 p-2 rounded-xl border border-white/10">
                            <input
                              className="flex-1 bg-transparent border-none text-xs font-bold focus:ring-0"
                              value={story}
                              onChange={e => updateStory(idx, e.target.value)}
                              placeholder={`篇目 #${idx + 1}`}
                            />
                            <button onClick={() => removeStory(idx)} className="text-gray-400 hover:text-red-500 p-1">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={addStory}
                          className="flex items-center justify-center gap-2 border-2 border-dashed border-blue-500/30 rounded-xl py-2 text-blue-500 hover:bg-blue-500/10 transition-all text-[10px] font-black uppercase"
                        >
                          <Plus size={14} /> 增补篇目
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {formData.stories.length > 0 ? formData.stories.map((s, i) => (
                        <span key={i} className="px-4 py-2 bg-white dark:bg-white/5 rounded-xl text-[11px] font-bold italic text-gray-400 border border-white/5">
                          {s}
                        </span>
                      )) : <span className="text-xs text-gray-600 italic">尚未录入具体篇目信息</span>}
                    </div>
                  )}
                </section>
              )}

              {/* 核心简评 */}
              <section>
                <h4 className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">
                  <BookOpen size={14} /> 核心简评 / Summary
                </h4>
                {isEditing ? (
                  <textarea
                    className="w-full text-lg italic font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-white/5 p-8 rounded-[32px] border-none focus:ring-2 ring-blue-500 min-h-[140px] transition-all"
                    value={formData.shortReview}
                    onChange={e => setFormData({ ...formData, shortReview: e.target.value })}
                  />
                ) : (
                  <div className="relative group">
                    <div className="absolute -left-4 top-0 bottom-0 w-1.5 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                    <p className="text-xl italic font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 p-8 rounded-[32px] leading-relaxed">
                      “{formData.shortReview || '暂无速记简评。'}”
                    </p>
                  </div>
                )}
              </section>

              {/* 深度长评 */}
              <section>
                <h4 className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4">
                  <MessageSquare size={14} /> 深度分析 / Long Review
                </h4>
                {isEditing ? (
                  <textarea
                    className="w-full text-sm leading-relaxed text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 p-8 rounded-[32px] min-h-[300px] border-none focus:ring-2 ring-emerald-500 transition-all"
                    value={formData.longReview}
                    onChange={e => setFormData({ ...formData, longReview: e.target.value })}
                    placeholder="在此录入针对该文献的深度解构内容..."
                  />
                ) : (
                  <div className="text-sm leading-[1.8] text-gray-500 dark:text-gray-400 whitespace-pre-wrap px-4 font-medium">
                    {formData.longReview || '该文献尚未进行深度长篇分析存档。'}
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* 保存触发区 */}
          {isEditing && (
            <footer className="mt-12 flex justify-end">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="group flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/40 transition-all disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                确认同步档案
              </button>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;