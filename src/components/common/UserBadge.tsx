import React from 'react';
import { User as UserIcon } from 'lucide-react';
import LazyImage from './LazyImage';

interface User {
  nickname: string;
  avatar: string | null;
}

interface UserBadgeProps {
  user: User | null | undefined;
  size?: 'sm' | 'lg';
  className?: string;
}

const UserBadge: React.FC<UserBadgeProps> = ({ user, size = 'sm', className = '' }) => {
  if (!user) return null;

  const isLarge = size === 'lg';
  
  const avatarSize = isLarge ? 'w-12 h-12' : 'w-6 h-6';
  const iconSize = isLarge ? 24 : 14;
  const textSize = isLarge ? 'text-base font-bold' : 'text-xs font-medium';

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${avatarSize} rounded-full overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700`}>
        {user.avatar ? (
            <LazyImage 
              src={user.avatar} 
              alt={user.nickname} 
              wrapperClassName="rounded-full"
            />
        ) : (
            <UserIcon size={iconSize} className="text-gray-500 dark:text-gray-400" />
        )}
      </div>
      
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