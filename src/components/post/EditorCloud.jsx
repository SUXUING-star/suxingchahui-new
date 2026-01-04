// src/components/post/EditorCloud.jsx
import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

const EditorCloud = ({ id, title, isDone, isActive, children }) => {
  if (!isActive) return null;

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in zoom-in-95 duration-500">
      {/* 标题区：保持绝对精炼 */}
      <div className="flex items-center space-x-5 mb-10">
        <div className={`w-14 h-14 rounded-3xl flex items-center justify-center font-black text-2xl shadow-2xl transition-all ${isDone ? 'bg-green-500 text-white scale-110' : 'bg-blue-600 text-white'}`}>
          {isDone ? <Check size={28} strokeWidth={4} /> : id}
        </div>
        <div>
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.5em]">{title}</h3>
          {!isDone && (
            <span className="text-[10px] font-black text-amber-500 flex items-center mt-1 uppercase tracking-wider">
              <AlertCircle size={12} className="mr-1.5" /> 待完善
            </span>
          )}
        </div>
      </div>

      {/* 核心内容区：去除所有多余 padding，让子组件自己控制 */}
      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
        {children}
      </div>
    </div>
  );
};

export default EditorCloud;