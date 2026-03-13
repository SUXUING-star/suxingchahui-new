import React, { useRef, ChangeEvent, MouseEvent, useState } from 'react';
import { Camera, X, Upload } from 'lucide-react';

interface EditorCoverProps {
  preview: string;
  onSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

const EditorCover: React.FC<EditorCoverProps> = ({ preview, onSelect, onRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleRemove = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onRemove();
  };

  // --- 拖拽逻辑 ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!preview) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (preview) return; // 已有图片时不处理

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // 构造一个伪装的 ChangeEvent 传给原有的 onSelect
      const fakeEvent = {
        target: { files }
      } as unknown as ChangeEvent<HTMLInputElement>;
      onSelect(fakeEvent);
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Hero Cover / 封面形象</label>
      <div 
        onClick={() => !preview && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group w-full aspect-video rounded-[48px] overflow-hidden border-4 transition-all duration-300 cursor-pointer ${
          preview 
            ? 'border-blue-600 shadow-[0_30px_60px_rgba(0,0,0,0.3)]' 
            : isDragging 
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.02] border-solid' 
              : 'border-dashed border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-black/20 hover:border-blue-500'
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
          <div className="flex flex-col items-center justify-center h-full pointer-events-none">
            <div className={`p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl mb-4 transition-all duration-500 ${isDragging ? 'scale-125 rotate-6 bg-blue-600 text-white' : 'group-hover:scale-110'}`}>
              {isDragging ? <Upload size={40} className="text-white animate-bounce" /> : <Camera size={40} className="text-blue-600" />}
            </div>
            <span className={`text-xs font-black uppercase tracking-widest transition-colors ${isDragging ? 'text-blue-600' : 'text-gray-500'}`}>
              {isDragging ? '松开即刻上传' : '点击或拖拽上传 16:9 封面图'}
            </span>
          </div>
        )}
        <input 
          type="file" 
          ref={inputRef} 
          hidden 
          accept="image/*" 
          onChange={onSelect} 
          onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
        />
      </div>
    </div>
  );
};

export default EditorCover;