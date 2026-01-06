import React, { useRef, ChangeEvent, MouseEvent } from 'react';
import { Camera, X } from 'lucide-react';

interface EditorCoverProps {
  preview: string;
  onSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

const EditorCover: React.FC<EditorCoverProps> = ({ preview, onSelect, onRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRemove = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <div className="space-y-4">
      <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Hero Cover / 封面形象</label>
      <div 
        onClick={() => !preview && inputRef.current?.click()}
        className={`relative group w-full aspect-video rounded-[48px] overflow-hidden border-4 transition-all cursor-pointer ${
          preview ? 'border-blue-600 shadow-[0_30px_60px_rgba(0,0,0,0.3)]' : 'border-dashed border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 hover:border-blue-500'
        }`}
      >
        {preview ? (
          <>
            <img src={preview} className="w-full h-full object-cover" alt="Cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
              <button onClick={handleRemove} className="p-4 bg-red-600 text-white rounded-2xl hover:scale-110 transition-all shadow-xl font-black text-xs uppercase">更换图片</button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl mb-4 group-hover:scale-110 transition-transform"><Camera size={40} className="text-blue-600" /></div>
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">点击上传 16:9 封面图</span>
          </div>
        )}
        <input 
          type="file" 
          ref={inputRef} 
          hidden 
          accept="image/*" 
          onChange={onSelect} 
          onClick={(e) => { (e.target as HTMLInputElement).value = '' }} // 清理 value
        />
      </div>
    </div>
  );
};

export default EditorCover;