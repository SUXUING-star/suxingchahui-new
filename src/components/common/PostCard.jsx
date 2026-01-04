// src/components/common/PostCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import TextFormatter from './TextFormatter';
import UserBadge from './UserBadge';
import LazyImage from './LazyImage';

function PostCard({ post }) {
  const coverImageUrl = post.coverImage ? post.coverImage.src : null;
  const coverImageAlt = post.coverImage ? post.coverImage.alt : post.title;

  return (
    <Link to={`/post/${post.id}`} className="block group h-full">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]">
        {/* 封面图片容器 */}
        {coverImageUrl && (
          <div className="relative aspect-video overflow-hidden">
            <LazyImage 
              src={coverImageUrl} 
              alt={coverImageAlt} 
              className="transform transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
        
        <div className="p-5 flex-1 flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 transition-colors duration-200">
            {post.title}
          </h2>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 my-3 space-x-4">
            {/* 作者信息：缩小版 */}
            <UserBadge user={post.author} size="sm" />
            
            <time className="flex items-center border-l dark:border-gray-700 pl-4">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(post.date).toLocaleDateString()}
            </time>
            {post.category && (
              <span className="flex items-center hover:text-blue-600 transition-colors duration-200">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                {post.category}
              </span>
            )}
          </div>

          {post.excerpt && (
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
              <TextFormatter content={post.excerpt} limit={200} />
            </div>
          )}

          <div className="mt-auto pt-3">
            <div className="flex flex-wrap gap-2">
              {(post.tags || []).map(tag => (
                <span key={tag} className="text-xs px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full hover:bg-blue-100 transition-colors duration-200">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PostCard;