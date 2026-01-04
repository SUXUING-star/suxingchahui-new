// src/components/common/TextFormatter.jsx
import React from 'react';

const TextFormatter = ({ content, limit = 0, className = '' }) => {
  if (!content) return null;

  const formatText = (text) => {
    return text
      // 移除 HTML 标签
      .replace(/<[^>]+>/g, '')
      // 处理 HTML 实体
      .replace(/&[^;]+;/g, (match) => {
        const entities = {
          '&amp;': '&',
          '&lt;': '<',
          '&gt;': '>',
          '&quot;': '"',
          '&apos;': "'",
          '&#x2F;': '/',
          '&#x27;': "'",
          '&#x60;': '`',
          '&nbsp;': ' '
        };
        return entities[match] || ' ';
      })
      // 移除 Markdown 链接语法
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // 处理其他 Markdown 语法
      .replace(/\*\*([^*]+)\*\*/g, '$1') // 粗体
      .replace(/_([^_]+)_/g, '$1')       // 斜体
      .replace(/`([^`]+)`/g, '$1')       // 代码
      .replace(/#{1,6}\s+/g, '')         // 标题
      .replace(/\n/g, ' ')               // 换行转空格
      .replace(/\s+/g, ' ')              // 多个空格转单个
      .trim();
  };

  const processContent = (text) => {
    const formatted = formatText(text);
    if (limit > 0 && formatted.length > limit) {
      return formatted.slice(0, limit) + '...';
    }
    return formatted;
  };

  return (
    <span className={className}>
      {processContent(content)}
    </span>
  );
};

export default TextFormatter;