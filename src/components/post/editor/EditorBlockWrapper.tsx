import React, { ReactNode } from 'react';
import { Trash2, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';

interface EditorBlockWrapperProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  isFirst: boolean;
  isLast: boolean;
  isInvalid: boolean;
  children: ReactNode;
}

const EditorBlockWrapper: React.FC<EditorBlockWrapperProps> = ({ 
  onMoveUp, 
  onMoveDown, 
  onRemove, 
  isFirst, 
  isLast, 
  isInvalid, 
  children 
}) => (
  <div className="group relative pl-16 pr-4 py-4 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 rounded-3xl transition-all border-l-4 border-transparent hover:border-blue-500">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={onMoveUp} disabled={isFirst} className="p-1 text-gray-400 hover:text-blue-500 disabled:opacity-0"><ChevronUp size={20}/></button>
      <button onClick={onRemove} className="p-1 text-red-400 hover:text-red-500"><Trash2 size={18}/></button>
      <button onClick={onMoveDown} disabled={isLast} className="p-1 text-gray-400 hover:text-blue-500 disabled:opacity-0"><ChevronDown size={20}/></button>
    </div>

    {isInvalid && (
      <div className="mb-4 flex items-center p-3 bg-red-100 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest">
        <AlertCircle size={16} className="mr-2" /> 该资源引用已失效，请删除重试
      </div>
    )}

    {children}
  </div>
);

export default EditorBlockWrapper;