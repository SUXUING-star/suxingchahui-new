import React, { useState, useEffect, useRef } from 'react';
import anime from 'animejs';
import {
  X, BookOpen, User, Globe, Tag,
  MessageSquare, Edit3, Save,
  RotateCcw, Plus, Trash2, List, Clock, History, CheckCircle2, Circle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Book, updateBook, INITIAL_BOOK_FORM, BOOK_COUNTRIES, BOOK_TYPES } from '@/utils/bookApi';

interface Props {
  book: Book;
  onClose: () => void;
  onRefresh?: () => void;
}

const BookDetailModal: React.FC<Props> = ({ book, onClose, onRefresh }) => {
  const { token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ...INITIAL_BOOK_FORM,
    ...book,
    shortReview: book.shortReview || '',
    longReview: book.longReview || '',
    stories: book.stories || []
  });

  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  // 入场动画
  useEffect(() => {
    anime({
      targets: backdropRef.current,
      opacity: [0, 1],
      duration: 300,
      easing: 'linear'
    });
    anime({
      targets: modalRef.current,
      scale: [0.9, 1],
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 800,
      easing: 'easeOutElastic(1, .8)',
      complete: (anim) => {
        anim.animatables.forEach(a => (a.target as HTMLElement).style.transform = '');
      }
    });
  }, []);

  const handleClose = () => {
    anime({
      targets: [modalRef.current, backdropRef.current],
      opacity: 0,
      scale: 0.9,
      duration: 200,
      easing: 'easeInQuad',
      complete: onClose
    });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateBook(book._id, formData, token);
      setIsEditing(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('同步失败');
    } finally {
      setLoading(false);
    }
  };

  const updateStory = (idx: number, val: string) => {
    const s = [...formData.stories]; s[idx] = val; setFormData({ ...formData, stories: s });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div ref={backdropRef} className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={handleClose} />

      {/* 弹窗主体 */}
      <div ref={modalRef} className="relative w-full max-w-3xl bg-white dark:bg-[#0a0a0a] rounded-[40px] shadow-2xl border border-white/10 flex flex-col max-h-[90vh] overflow-hidden">

        {/* 固定头部岛屿 */}
        <header className="p-6 md:p-10 pb-4 flex justify-between items-start shrink-0">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              {/* 状态显示/编辑 */}
              {isEditing ? (
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                  <button
                    onClick={() => setFormData({ ...formData, status: 'read' })}
                    className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${formData.status === 'read' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400'}`}
                  >已读</button>
                  <button
                    onClick={() => setFormData({ ...formData, status: 'unread' })}
                    className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${formData.status === 'unread' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400'}`}
                  >待读</button>
                </div>
              ) : (
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${formData.status === 'read' ? 'border-emerald-500/50 text-emerald-500' : 'border-orange-500/50 text-orange-500'
                  }`}>
                  {formData.status === 'read' ? <><CheckCircle2 size={10} /> READ</> : <><Circle size={10} /> UNREAD</>}
                </span>
              )}
            </div>
            {isEditing ? (
              <input
                className="text-2xl md:text-4xl font-black italic text-blue-600 bg-gray-100 dark:bg-white/5 border-none rounded-2xl px-4 py-2 w-full outline-none focus:ring-2 ring-blue-500"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            ) : (
              <h2 className="text-2xl md:text-4xl font-black italic text-blue-600 tracking-tight">{formData.title}</h2>
            )}

            {/* 元数据展示与编辑区 */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              {/* 作者 */}
              <span className="flex items-center gap-1.5">
                <User size={14} className="text-blue-500" /> 
                {isEditing ? <input className="bg-transparent border-b border-gray-600 outline-none" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} /> : formData.author}
              </span>

              {/* 体裁 - 新增编辑逻辑 */}
              <span className="flex items-center gap-1.5">
                <Tag size={14} className="text-pink-500" />
                {isEditing ? (
                  <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                    {BOOK_TYPES.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setFormData({ ...formData, bookType: type.id })}
                        className={`px-2 py-0.5 rounded text-[9px] font-black transition-all ${formData.bookType === type.id ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-400'}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  BOOK_TYPES.find(t => t.id === formData.bookType)?.label || '未知体裁'
                )}
              </span>

              {/* 地区 */}
              <span className="flex items-center gap-1.5">
                <Globe size={14} className="text-emerald-500" /> 
                {isEditing ? (
                  <select className="bg-transparent border-b border-gray-600 outline-none" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })}>
                    {BOOK_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : formData.country}
              </span>

              {/* 年代 */}
              <span className="flex items-center gap-1.5">
                <History size={14} className="text-purple-500" /> 
                {isEditing ? <input className="bg-transparent border-b border-gray-600 w-16 outline-none" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} /> : (formData.year || '未知年代')}
              </span>
              
              <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(book.createdAt).toLocaleDateString()} 记录</span>
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <button onClick={() => setIsEditing(!isEditing)} className={`p-3 rounded-xl transition-all ${isEditing ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 hover:scale-110'}`}>
              {isEditing ? <RotateCcw size={20} /> : <Edit3 size={20} />}
            </button>
            <button onClick={handleClose} className="p-3 hover:bg-red-500 hover:text-white dark:bg-white/5 rounded-xl transition-all"><X size={20} /></button>
          </div>
        </header>

        {/* 内容滚动区 */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pt-2 space-y-10 custom-scrollbar">

          {/* 篇目岛屿 (如果是短篇集则显示) */}
          {formData.bookType === 'collection' && (
            <section className="bg-blue-600/5 rounded-[32px] p-6 border border-blue-500/10">
              <h4 className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4"><List size={14} /> 收录篇目</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {formData.stories.map((story, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white dark:bg-black/20 p-2 rounded-xl border border-white/10 shadow-sm">
                    {isEditing ? (
                      <>
                        <input className="flex-1 bg-transparent border-none text-[11px] font-bold outline-none" value={story} onChange={e => updateStory(idx, e.target.value)} />
                        <button onClick={() => setFormData(p => ({ ...p, stories: p.stories.filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </>
                    ) : (
                      <span className="text-[11px] font-bold text-gray-500 truncate px-2">{story}</span>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button onClick={() => setFormData(p => ({ ...p, stories: [...p.stories, ''] }))} className="flex items-center justify-center gap-2 border-2 border-dashed border-blue-500/20 rounded-xl py-2 text-blue-500 hover:bg-blue-500/5 transition-all text-[10px] font-black">
                    <Plus size={14} /> 新增篇目
                  </button>
                )}
              </div>
            </section>
          )}

          {/* 阅读随笔 */}
          <section className="space-y-4">
            <h4 className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest"><BookOpen size={14} /> 阅读随笔</h4>
            {isEditing ? (
              <textarea className="w-full text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border-none outline-none focus:ring-2 ring-blue-500/30 min-h-[120px]" value={formData.shortReview} onChange={e => setFormData({ ...formData, shortReview: e.target.value })} />
            ) : (
              <div className="relative pl-6">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                <p className="text-lg italic font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                  “{formData.shortReview || '暂无阅读随笔。'}”
                </p>
              </div>
            )}
          </section>

          {/* 详细记录 */}
          <section className="space-y-4">
            <h4 className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest"><MessageSquare size={14} /> 详细记录</h4>
            {isEditing ? (
              <textarea className="w-full text-sm leading-relaxed text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 p-6 rounded-3xl min-h-[250px] outline-none focus:ring-2 ring-emerald-500/30" value={formData.longReview} onChange={e => setFormData({ ...formData, longReview: e.target.value })} placeholder="录入深度的分析内容..." />
            ) : (
              <div className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 whitespace-pre-wrap font-medium px-2">
                {formData.longReview || '暂无详细记录存档。'}
              </div>
            )}
          </section>
        </div>

        {/* 固定底部岛屿 */}
        {isEditing && (
          <footer className="p-6 md:p-8 border-t border-gray-100 dark:border-white/5 shrink-0 flex justify-end bg-gray-50/50 dark:bg-white/2">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 shadow-xl shadow-blue-500/30 transition-all disabled:opacity-50"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
              确认保存修改
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

export default BookDetailModal;