// src/components/post/EditorImageBlock.jsx
import React from 'react';
import { ImageIcon, X, UploadCloud } from 'lucide-react';

const EditorImageBlock = ({ previewUrl, onSelect, onRemove }) => {
  const fileInputRef = React.useRef(null);

  return (
    <div className="relative group w-full">
      {previewUrl ? (
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 dark:border-gray-700/50">
          <img src={previewUrl} className="w-full h-auto max-h-[600px] object-contain bg-black/5" alt="preview" />
          <button 
            onClick={onRemove}
            className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current.click()}
          className="w-full h-64 rounded-3xl border-4 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-blue-50/30 group"
        >
          <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
            <UploadCloud size={40} className="text-blue-500" />
          </div>
          <p className="mt-4 font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-xs">点击或拖拽上传图片</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={onSelect} 
          />
        </div>
      )}
    </div>
  );
};

export default EditorImageBlock;