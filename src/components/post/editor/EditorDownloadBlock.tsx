import React, { ChangeEvent } from 'react';
import { Link as LinkIcon, FileText, Globe } from 'lucide-react';

interface EditorDownloadBlockProps {
  description: string;
  url: string;
  onUpdate: (field: 'description' | 'url', value: string) => void;
}

const EditorDownloadBlock: React.FC<EditorDownloadBlockProps> = ({ description, url, onUpdate }) => {
  return (
    <div className="p-6 bg-amber-50/50 dark:bg-amber-900/10 rounded-[32px] border-2 border-amber-100 dark:border-amber-900/30 space-y-4 shadow-inner">
      <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 mb-2 ml-2">
        <LinkIcon size={18} />
        <span className="text-[10px] font-black uppercase tracking-widest">下载链接配置</span>
      </div>
      <div className="space-y-3">
        <div className="relative">
          <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" size={18} />
          <input 
            placeholder="资源描述，例如：4K 蓝光原盘" 
            value={description}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate('description', e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 rounded-2xl font-bold outline-none border-none shadow-sm dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
        </div>
        <div className="relative">
          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" size={18} />
          <input 
            placeholder="下载链接，例如：magnet:?xt=..." 
            value={url}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate('url', e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 rounded-2xl font-bold outline-none border-none shadow-sm dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
        </div>
      </div>
    </div>
  );
};

export default EditorDownloadBlock;