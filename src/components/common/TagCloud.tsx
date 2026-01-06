import React from 'react';
import { Link } from 'react-router-dom';

interface TagItem {
  tag: string;
  count: number;
}

interface TagCloudProps {
  tagData: TagItem[];
}

const TagCloud: React.FC<TagCloudProps> = ({ tagData }) => {
  if (!tagData || tagData.length === 0) return null;

  const colors: readonly string[] = [
    'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800',
    'bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400 border-slate-100 dark:border-slate-700',
    'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800',
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tagData.map((item, index) => {
        const colorClass = colors[index % colors.length];
        
        return (
          <Link
            key={item.tag}
            to={`/tags#${item.tag}`}
            className={`
              inline-flex items-center px-3 py-1.5 rounded-xl border
              font-black text-[11px] uppercase tracking-wider transition-all duration-300
              hover:scale-110 hover:shadow-lg active:scale-95
              ${colorClass}
            `}
          >
            <span className="opacity-40 mr-1">#</span>
            {item.tag}
            <span className="ml-1.5 px-1.5 py-0.5 bg-white/50 dark:bg-black/20 rounded-md text-[9px] opacity-60">
              {item.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default TagCloud;