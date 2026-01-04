// src/components/common/CategoryList.jsx (更新版本)
import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen } from 'lucide-react';

function CategoryList({ categories, className }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className || ''}`}>
      {categories.map(category => (
        <Link
          key={category}
          to={`/categories#${category}`}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm
                   bg-blue-100 text-blue-800 hover:bg-blue-200
                   dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800
                   transition-colors duration-200"
        >
          <FolderOpen size={14} className="mr-1" />
          {category}
        </Link>
      ))}
    </div>
  );
}

export default CategoryList;