// components/common/ReadingTimeEstimate.jsx
import React from 'react';
import { Clock } from 'lucide-react';

function ReadingTimeEstimate({ content }) {
  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  const readingTime = calculateReadingTime(content);

  return (
    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
      <Clock size={16} className="mr-1" />
      <span>{readingTime} min read</span>
    </div>
  );
}

export default ReadingTimeEstimate;