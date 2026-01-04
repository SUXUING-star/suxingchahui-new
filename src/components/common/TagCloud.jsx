// src/components/common/TagCloud.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function TagCloud({ tagData }) {
  if (!tagData || tagData.length === 0) return null;

  // 获取最大和最小计数用于计算字体大小
  const counts = tagData.map(item => item.count);
  const maxCount = Math.max(...counts);
  const minCount = Math.min(...counts);

  const getTagStyle = (count) => {
    // 计算 0 到 1 之间的权重
    const weight = maxCount === minCount ? 0 : (count - minCount) / (maxCount - minCount);
    
    // 根据权重决定字体大小 (0.75rem 到 1.25rem)
    const fontSize = 0.75 + weight * 0.5 + 'rem';
    
    // 根据权重决定透明度和背景
    const opacity = 0.6 + weight * 0.4;

    return { fontSize, opacity };
  };

  // 预定义的几种雅致色彩
  const colors = [
    'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tagData.map((item, index) => {
        const style = getTagStyle(item.count);
        const colorClass = colors[index % colors.length]; // 循环使用颜色

        return (
          <Link
            key={item.tag}
            to={`/tags#${item.tag}`}
            style={style}
            className={`
              inline-flex items-center px-3 py-1.5 rounded-xl
              font-bold transition-all duration-300
              hover:scale-110 hover:shadow-md active:scale-95
              ${colorClass}
            `}
          >
            <span className="mr-1">#</span>
            {item.tag}
            <span className="ml-1.5 text-[10px] opacity-50 font-normal">
              {item.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default TagCloud;