import React from 'react';
import { Link } from 'react-router-dom';
import LazyImage from './LazyImage';
import UserBadge from './UserBadge';
import { Clock, Folder, Eye } from 'lucide-react';
import { PostResponse } from '@/models/PostResponse';

interface PostCardProps {
  post: PostResponse;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    // 去掉了 max-w-[300px]，让宽度由父级 Grid 决定
    <div className="w-full h-full">
      <Link 
        to={`/post/${post.id}`} 
        className="group block h-full bg-white dark:bg-gray-800 rounded-[16px] sm:rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col"
      >
        {post.coverImage && (
          <div className="relative aspect-[4/3] sm:aspect-video w-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-900">
            <LazyImage 
              src={post.coverImage.src} 
              alt={post.title} 
              objectFit="object-cover"
              className="transform transition-transform duration-700 group-hover:scale-110"
            />
            {/* 这里的分类标签在移动端稍微缩小一点 */}
            <div className="absolute top-2 left-2">
                <span className="px-1.5 py-0.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-md shadow-sm text-[8px] sm:text-[9px] font-black text-blue-600 uppercase tracking-tighter flex items-center">
                    <Folder size={8} className="mr-1" /> 
                    <span className="truncate max-w-[50px] sm:max-w-none">{post.category}</span>
                </span>
            </div>
          </div>
        )}
        
        {/* 调小了 padding (p-2.5 sm:p-3.5) */}
        <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col min-w-0">
          <h2 className="text-[13px] sm:text-[15px] font-black text-gray-900 dark:text-gray-100 leading-[1.2] mb-1 sm:mb-1.5 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="hidden sm:line-clamp-2 text-[11px] leading-[1.4] text-gray-400 dark:text-gray-500 mb-3 font-medium">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto pt-2">
            {/* 移动端进一步缩放头像 */}
            <div className="scale-[0.65] sm:scale-75 origin-left">
              <UserBadge user={post.author} size="sm" />
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex items-center text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest opacity-80">
                    <Clock size={8} className="mr-0.5 sm:mr-1 text-blue-500" />
                    {post.getFormattedDate()}
                </div>
                <div className="flex items-center text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest opacity-80">
                    <Eye size={8} className="mr-0.5 sm:mr-1 text-emerald-500" />
                    {post.views}
                </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PostCard;