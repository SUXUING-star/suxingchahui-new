import React from 'react';
import { Link } from 'react-router-dom';
import LazyImage from './LazyImage';
import UserBadge from './UserBadge';
import { Clock, Folder, Eye, Tag, MessageCircle } from 'lucide-react'; // 新增 Tag 图标
import { PostResponse } from '@/models/PostResponse';

interface PostCardProps {
  post: PostResponse;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
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
            {/* 分类标签更紧贴边缘 top-1.5 left-1.5 */}
            <div className="absolute top-1.5 left-1.5">
                <span className="px-1.5 py-0.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-md shadow-sm text-[8px] sm:text-[9px] font-black text-blue-600 uppercase tracking-tighter flex items-center">
                    <Folder size={8} className="mr-1" /> 
                    <span className="truncate max-w-[50px] sm:max-w-none">{post.category}</span>
                </span>
            </div>
          </div>
        )}
        
        {/* 1. 压榨四周 Padding (p-2 sm:p-2.5)，让内部空间极致紧凑 */}
        <div className="p-2 sm:p-2.5 flex-1 flex flex-col min-w-0">
          
          {/* 2. 缩小标题行高与下边距 (leading-[1.15] mb-1) */}
          <h2 className="text-[13px] sm:text-[14px] font-black text-gray-900 dark:text-gray-100 leading-[1.15] mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h2>

          {/* 3. 新增：标签展示区，紧凑横向排列，限制最多显示前3个防止撑爆 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1 sm:mb-1.5">
              {post.tags.slice(0, 3).map((tag, idx) => (
                <span 
                  key={idx} 
                  className="flex items-center px-1.5 py-[2px] bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 rounded-[4px] text-[7.5px] sm:text-[8px] font-bold tracking-tight"
                >
                  <Tag size={7} className="mr-0.5 opacity-80" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 4. 缩小摘要字号与下边距 */}
          {post.excerpt && (
            <p className="hidden sm:line-clamp-2 text-[10px] sm:text-[11px] leading-tight text-gray-400 dark:text-gray-500 mb-1.5 font-medium">
              {post.excerpt}
            </p>
          )}

          {/* 5. 底部栏：调小上边距 (pt-1.5) 以及元素间的间距 (space-x-1.5) */}
          <div className="flex items-center justify-between mt-auto pt-1.5">
            <div className="scale-[0.65] sm:scale-75 origin-left">
              <UserBadge user={post.author} size="sm" />
            </div>
            
            {/* 紧凑的数据展示区 */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
                {/* 评论数 */}
                <div className="flex items-center text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest opacity-80">
                    <MessageCircle size={8} className="mr-0.5 sm:mr-1 text-purple-500" />
                    {post.commentsCount}
                </div>
                {/* 浏览量 */}
                <div className="flex items-center text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest opacity-80">
                    <Eye size={8} className="mr-0.5 sm:mr-1 text-emerald-500" />
                    {post.views}
                </div>
                {/* 时间 (仅在 sm 以上显示以节省空间) */}
                <div className="hidden xs:flex items-center text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest opacity-80">
                    <Clock size={8} className="mr-0.5 sm:mr-1 text-blue-500" />
                    {post.getFormattedDate()}
                </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PostCard;