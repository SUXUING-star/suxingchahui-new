import React, { ReactNode } from 'react';
import { Check, AlertCircle } from 'lucide-react';

interface EditorCloudProps {
  id: string;
  title: string;
  isDone: boolean;
  isActive: boolean;
  children: ReactNode;
}

const EditorCloud: React.FC<EditorCloudProps> = ({ id, title, isDone, isActive, children }) => {
  if (!isActive) return null;

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in zoom-in-95 duration-500">
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
      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
        {children}
      </div>
    </div>
  );
};

export default EditorCloud;