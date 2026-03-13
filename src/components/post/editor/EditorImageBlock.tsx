import React, { useRef, ChangeEvent, useState } from 'react';
import { UploadCloud, X, RefreshCw, Upload } from 'lucide-react';

interface EditorImageBlockProps {
  previewUrl?: string;
  onSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

const EditorImageBlock: React.FC<EditorImageBlockProps> = ({ previewUrl, onSelect, onRemove }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    if (!previewUrl) fileInputRef.current?.click();
  };

  // --- 拖拽逻辑 ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!previewUrl) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (previewUrl) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const fakeEvent = {
        target: { files }
      } as unknown as ChangeEvent<HTMLInputElement>;
      onSelect(fakeEvent);
    }
  };

  return (
    <div className="w-full group/img">
      {previewUrl ? (
        <div className="relative rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-4 border-white/50 dark:border-white/10 group">
          <img 
            src={previewUrl} 
            className="w-full h-auto max-h-[500px] object-contain bg-black/5 dark:bg-white/5 transition-transform duration-700 group-hover:scale-105" 
            alt="文章插图" 
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-white/90 dark:bg-gray-800/90 text-blue-600 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2"
            >
              <RefreshCw size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">更换</span>
            </button>
            <button 
              onClick={onRemove}
              className="p-4 bg-red-500 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full py-12 px-6 rounded-[32px] border-4 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer backdrop-blur-md ${
            isDragging 
              ? 'border-solid border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.01]' 
              : 'border-dashed border-gray-100 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-400 bg-white/40 dark:bg-black/20 hover:bg-white/60'
          }`}
        >
          <div className={`w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex items-center justify-center mb-6 transition-all duration-500 ${isDragging ? 'scale-125 rotate-12 bg-blue-500 text-white' : 'group-hover/img:scale-110'}`}>
            {isDragging ? <Upload size={40} className="text-white animate-bounce" /> : <UploadCloud size={40} className="text-blue-500" />}
          </div>
          <div className="text-center space-y-1 pointer-events-none">
            <p className={`text-lg font-black tracking-tighter uppercase transition-colors ${isDragging ? 'text-blue-600' : 'text-gray-900 dark:text-white'}`}>
              {isDragging ? '放置以上传' : '插入图片'}
            </p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              支持拖拽或点击上传
            </p>
          </div>
        </div>
      )}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={onSelect}
        onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
      />
    </div>
  );
};

export default EditorImageBlock;