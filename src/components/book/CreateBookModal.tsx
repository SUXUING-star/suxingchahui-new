
import React, { useState, useEffect, useRef } from 'react';
import anime from 'animejs';
import { X, Save, Type, Globe2, History, MessageSquare, PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BOOK_COUNTRIES, BOOK_TYPES, createBook, INITIAL_BOOK_FORM } from '@/utils/bookApi';

interface CreateBookModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateBookModal: React.FC<CreateBookModalProps> = ({ onClose, onSuccess }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_BOOK_FORM);
  
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
      easing: 'easeOutElastic(1, .8)'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author) return alert('书名和作者是必填项');

    setLoading(true);
    try {
      await createBook(formData, token);
      onSuccess();
      handleClose();
    } catch (err) {
      alert('记录保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理短篇
  const addStory = () => setFormData(prev => ({ ...prev, stories: [...prev.stories, ''] }));
  const updateStory = (index: number, val: string) => {
    const newStories = [...formData.stories];
    newStories[index] = val;
    setFormData({ ...formData, stories: newStories });
  };
  const removeStory = (index: number) => setFormData(prev => ({
    ...prev, stories: prev.stories.filter((_, i) => i !== index)
  }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-black/70 backdrop-blur-md" 
        onClick={handleClose} 
      />

      {/* 弹窗主体 - 限制高度并允许内部滚动 */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-lg bg-white dark:bg-[#121212] rounded-[32px] shadow-2xl border border-white/10 flex flex-col max-h-[90vh]"
      >
        <header className="p-6 pb-2 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-xl font-black tracking-tight">记录一本新书</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </header>

        {/* 可滚动区域 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
          <div className="space-y-5">
            
            {/* 基础信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 px-1">
                  <Type size={12} className="text-blue-600" /> 书籍名称
                </label>
                <input
                  required
                  className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 ring-blue-500/30 transition-all outline-none"
                  placeholder="例如：百年孤独"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 px-1">
                  <Globe2 size={12} className="text-blue-600" /> 作者
                </label>
                <input
                  required
                  className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 ring-blue-500/30 transition-all outline-none"
                  placeholder="作者姓名"
                  value={formData.author}
                  onChange={e => setFormData({ ...formData, author: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 px-1">
                <History size={12} className="text-blue-600" /> 出版年份 / 年代
              </label>
              <input 
                className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 ring-blue-500/30 transition-all" 
                placeholder="例如：1967" 
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: e.target.value })} 
              />
            </div>

            {/* 体裁选择 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 px-1">作品体裁</label>
              <div className="grid grid-cols-2 gap-2">
                {BOOK_TYPES.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, bookType: type.id })}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${formData.bookType === type.id
                      ? 'border-blue-600 bg-blue-600/5 text-blue-600 shadow-sm'
                      : 'border-transparent bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                      }`}
                  >
                    <type.icon size={16} />
                    <span className="font-bold text-xs">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 短篇合集处理 */}
            {formData.bookType === 'collection' && (
              <div className="space-y-3 p-4 bg-blue-50/50 dark:bg-blue-600/5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-blue-600">收录篇目 ({formData.stories.length})</label>
                  <button type="button" onClick={addStory} className="text-[10px] font-black text-blue-600 flex items-center gap-1 hover:underline">
                    <PlusCircle size={12} /> 添加
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {formData.stories.map((story, index) => (
                    <div key={index} className="flex gap-2 group">
                      <input
                        className="flex-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-blue-500"
                        placeholder={`篇目名称 ${index + 1}`}
                        value={story}
                        onChange={e => updateStory(index, e.target.value)}
                      />
                      <button type="button" onClick={() => removeStory(index)} className="text-red-400 hover:text-red-600 px-1 transition-colors">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 地区归属 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 px-1">作者所属地区</label>
              <div className="flex flex-wrap gap-2">
                {BOOK_COUNTRIES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, country: c.trim() })}
                    className={`px-4 py-1.5 rounded-lg font-bold text-[10px] transition-all border ${formData.country === c.trim()
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/5 text-gray-500 hover:border-blue-300'
                      }`}
                  >
                    {c.trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* 简评 */}
            <div className="space-y-2 pb-4">
              <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 px-1">
                <MessageSquare size={12} className="text-blue-600" /> 阅读随笔
              </label>
              <textarea
                className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-3 font-medium text-sm min-h-[80px] focus:ring-2 ring-blue-500/30 transition-all resize-none outline-none"
                placeholder="记录一些读后感..."
                value={formData.shortReview}
                onChange={e => setFormData({ ...formData, shortReview: e.target.value })}
              />
            </div>
          </div>
        </form>

        {/* 固定底部按钮 */}
        <footer className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 rounded-b-[32px] flex gap-3 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-3.5 rounded-xl font-bold text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
          >
            取消
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] bg-blue-600 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
            完成书籍记录
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CreateBookModal;