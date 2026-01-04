import React from 'react';
import { Camera, X } from 'lucide-react';

const EditorCover = ({ preview, onSelect, onRemove }) => {
  const inputRef = React.useRef();
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">文章封面图</label>
      <div 
        onClick={() => !preview && inputRef.current.click()}
        className={`relative group h-64 rounded-[32px] overflow-hidden border-2 transition-all cursor-pointer ${
          preview ? 'border-blue-500 shadow-2xl' : 'border-dashed border-gray-300 dark:border-gray-700 bg-white/40 dark:bg-black/20 hover:border-blue-400'
        }`}
      >
        {preview ? (
          <>
            <img src={preview} className="w-full h-full object-cover" alt="Cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-3 bg-red-500 text-white rounded-2xl hover:scale-110 transition-all"><X /></button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl mb-3"><Camera size={32} className="text-blue-500" /></div>
            <span className="text-xs font-black text-gray-400 uppercase">点击上传封面</span>
          </div>
        )}
        <input type="file" ref={inputRef} hidden accept="image/*" onChange={onSelect} />
      </div>
    </div>
  );
};

export default EditorCover;