import React, { useState } from 'react';
import { X, Save, BookOpen, Globe2, Layers, Type } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createBook } from '@/utils/bookApi';

interface CreateBookModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateBookModal: React.FC<CreateBookModalProps> = ({ onClose, onSuccess }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  // 在 CreateBookModal.tsx 或相关组件中修改
  const [formData, setFormData] = useState<{
    title: string;
    author: string;
    bookType: string;
    stories: string[];
    country: string;
    status: 'read' | 'unread'; // 显式约束类型
    shortReview: string;
    longReview?: string;
  }>({
    title: '',
    author: '',
    bookType: 'novel',
    stories: [] as string[],
    country: '中',
    status: 'read', // 初始值
    shortReview: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author) return alert('请填写完整信息');

    setLoading(true);
    try {
      await createBook(formData, token);
      onSuccess();
      onClose();
    } catch (err) {
      alert('录入失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const countries = ['中', '日', '欧', '俄', '美', '其他'];
  const bookTypes = [
    { id: 'novel', label: '中长篇小说', icon: BookOpen },
    { id: 'collection', label: '短篇作品集', icon: Layers }
  ];

  // 处理添加短篇
  const addStory = () => setFormData(prev => ({ ...prev, stories: [...prev.stories, ''] }));
  // 处理修改短篇
  const updateStory = (index: number, val: string) => {
    const newStories = [...formData.stories];
    newStories[index] = val;
    setFormData({ ...formData, stories: newStories });
  };
  // 处理删除短篇
  const removeStory = (index: number) => setFormData(prev => ({
    ...prev, stories: prev.stories.filter((_, i) => i !== index)
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* 弹窗主体 */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#121212] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
        <header className="p-8 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter">NEW <span className="text-blue-600">ARCHIVE</span></h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">录入新的馆藏记录</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
          {/* 书名与作者 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Type size={12} /> 书名 / Title
              </label>
              <input
                required
                className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-blue-500 transition-all"
                placeholder="输入书籍名称..."
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Globe2 size={12} /> 作者 / Author
              </label>
              <input
                required
                className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 ring-blue-500 transition-all"
                placeholder="作者姓名..."
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
          </div>

          {/* 类型选择 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">作品体裁 / Category</label>
            <div className="grid grid-cols-2 gap-3">
              {bookTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, bookType: type.id })}
                  className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${formData.bookType === type.id
                    ? 'border-blue-600 bg-blue-600/5 text-blue-600'
                    : 'border-transparent bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                >
                  <type.icon size={18} />
                  <span className="font-black text-xs uppercase">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
          {formData.bookType === 'collection' && (
            <div className="space-y-3 animate-in slide-in-from-top-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex justify-between">
                收录篇目 / Stories ({formData.stories.length})
                <button type="button" onClick={addStory} className="text-blue-500 hover:underline">+ 添加篇目</button>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {formData.stories.map((story, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      className="flex-1 bg-gray-100 dark:bg-white/5 border-none rounded-lg px-3 py-2 text-xs font-bold focus:ring-1 ring-blue-500"
                      placeholder={`篇目 ${index + 1}`}
                      value={story}
                      onChange={e => updateStory(index, e.target.value)}
                    />
                    <button type="button" onClick={() => removeStory(index)} className="text-red-400 hover:text-red-600 px-1">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 地区选择 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">地区归属 / Regional Origin</label>
            <div className="flex flex-wrap gap-2">
              {countries.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, country: c })}
                  className={`px-6 py-2 rounded-xl font-black text-[11px] transition-all ${formData.country === c
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 简评 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">速记短评 / Brief Review</label>
            <textarea
              className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-3 font-medium text-sm min-h-[100px] focus:ring-2 ring-blue-500 transition-all resize-none"
              placeholder="记录此时此刻的想法..."
              value={formData.shortReview}
              onChange={e => setFormData({ ...formData, shortReview: e.target.value })}
            />
          </div>

          <footer className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              放弃录入
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-3 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
              确认存档
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default CreateBookModal;