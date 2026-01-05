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
    <div className="w-full max-w-[300px] mx-auto h-full">
      <Link 
        to={`/post/${post.id}`} 
        className="group block h-full bg-white dark:bg-gray-800 rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col"
      >
        {post.coverImage && (
          <div className="relative aspect-video w-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-900">
            <LazyImage 
              src={post.coverImage.src} 
              alt={post.title} 
              objectFit="object-cover"
              className="transform transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute top-2.5 left-2.5">
                <span className="px-2 py-0.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg shadow-sm text-[9px] font-black text-blue-600 uppercase tracking-tighter flex items-center">
                    <Folder size={8} className="mr-1" /> {post.category}
                </span>
            </div>
          </div>
        )}
        
        <div className="p-3.5 flex-1 flex flex-col min-w-0">
          <h2 className="text-[15px] font-black text-gray-900 dark:text-gray-100 leading-[1.2] mb-1.5 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="text-[11px] leading-[1.4] text-gray-400 dark:text-gray-500 line-clamp-2 mb-3 font-medium">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto">
            <div className="scale-75 origin-left">
              <UserBadge user={post.author} size="sm" />
            </div>
            
            <div className="flex items-center space-x-3">
                <div className="flex items-center text-[8px] font-black text-gray-400 uppercase tracking-widest opacity-80">
                    <Clock size={10} className="mr-1 text-blue-500" />
                    {post.getFormattedDate()}
                </div>
                <div className="flex items-center text-[8px] font-black text-gray-400 uppercase tracking-widest opacity-80">
                    <Eye size={10} className="mr-1 text-emerald-500" />
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