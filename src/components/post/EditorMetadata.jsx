import React from 'react';
import { X, Tag as TagIcon } from 'lucide-react';
import EditorTextArea from './EditorTextArea';
import EditorSelect from './EditorSelect';

const EditorMetadata = ({ title, setTitle, category, setCategory, tags, setTags, allCategories }) => {
  return (
    <div className="space-y-10 p-10 bg-white/40 dark:bg-white/5 rounded-[40px] border border-white/60 dark:border-white/10 shadow-2xl">
      {/* 标题 - 自动伸缩 */}
      <EditorTextArea 
        value={title}
        onChange={setTitle}
        placeholder="在这里输入标题..."
        className="text-5xl font-black dark:text-white placeholder-gray-300 dark:placeholder-gray-700"
      />

      <div className="flex flex-wrap gap-8 items-end">
        <EditorSelect 
          label="所属分类"
          value={category}
          onChange={setCategory}
          options={allCategories}
        />

        <div className="flex-1 min-w-[300px] space-y-2">
          <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] block">
            标签管理
          </label>
          <div className="flex flex-wrap gap-2 p-3 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/50">
            {tags.map(t => (
              <span key={t} className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-xs font-black flex items-center shadow-md">
                #{t} <X size={14} className="ml-2 cursor-pointer" onClick={() => setTags(tags.filter(i => i !== t))} />
              </span>
            ))}
            <input 
              placeholder="输入标签按回车..." 
              className="flex-1 bg-transparent px-2 py-1 font-black outline-none dark:text-white text-sm"
              onKeyDown={e => {
                if (e.key === 'Enter' && e.target.value) {
                  setTags([...new Set([...tags, e.target.value.trim()])]);
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorMetadata;