import React from 'react';
import { User as UserIcon } from 'lucide-react';
import LazyImage from './LazyImage';

const UserBadge = ({ user, size = 'sm', className = '' }) => {
  if (!user) return null;

  const isLarge = size === 'lg';
  
  // 尺寸映射
  const avatarSize = isLarge ? 'w-12 h-12' : 'w-6 h-6';
  const iconSize = isLarge ? 24 : 14;
  const textSize = isLarge ? 'text-base font-bold' : 'text-xs font-medium';

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* 头像部分 */}
      <div className={`${avatarSize} rounded-full overflow-hidden ...`}>
        {user.avatar ? (
            <LazyImage 
            src={user.avatar} 
            alt={user.nickname} 
            wrapperClassName="rounded-full" // 确保包裹层也是圆的
            />
        ) : (
            <UserIcon size={iconSize} className="text-gray-500 dark:text-gray-400" />
        )}
        </div>
      
      {/* 文本部分 */}
      <div className="flex flex-col">
        {isLarge && <span className="text-[10px] text-gray-400 uppercase tracking-wider">Author</span>}
        <span className={`${textSize} text-gray-700 dark:text-gray-200 truncate max-w-[120px]`}>
          {user.nickname}
        </span>
      </div>
    </div>
  );
};

export default UserBadge;