import React, { useRef, ChangeEvent } from 'react';
import { UploadCloud, X, RefreshCw } from 'lucide-react';

interface EditorImageBlockProps {
  previewUrl?: string;
  onSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

const EditorImageBlock: React.FC<EditorImageBlockProps> = ({ previewUrl, onSelect, onRemove }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!previewUrl) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full group/img">
      {previewUrl ? (
        <div className="relative rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-4 border-white/50 dark:border-white/10 group">
          <img 
            src={previewUrl} 
            className="w-full h-auto max-h-[500px] object-contain bg-black/5 dark:bg-white/5 transition-transform duration-700 group-hover:scale-105" 
            alt="Preview" 
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-white/90 dark:bg-gray-800/90 text-blue-600 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2"
            >
              <RefreshCw size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">更换资源</span>
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
          className="w-full py-12 px-6 rounded-[32px] border-4 border-dashed border-gray-100 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-400 bg-white/40 dark:bg-black/20 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white/60 group/btn"
        >
          <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex items-center justify-center mb-6 group-hover/btn:scale-110 group-hover/btn:rotate-3 transition-all duration-500">
            <UploadCloud size={40} className="text-blue-500" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-lg font-black text-gray-900 dark:text-white tracking-tighter uppercase">
              插入视觉星火
            </p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              支持 JPG, PNG, WEBP (MAX 5MB)
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
      />
    </div>
  );
};

export default EditorImageBlock;