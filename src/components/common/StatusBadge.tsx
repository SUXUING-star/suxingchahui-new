import React from 'react';
import { Clock, CheckCircle, Lock } from 'lucide-react';

type StatusType = 'pending' | 'published' | 'rejected';

interface StatusBadgeProps {
  status: StatusType | string;
}

interface StatusConfig {
  text: string;
  color: string;
  icon: React.ReactNode;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config: Record<StatusType, StatusConfig> = {
    pending: {
      text: '审核中',
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      icon: <Clock size={12} className="mr-1" />
    },
    published: {
      text: '已公开',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      icon: <CheckCircle size={12} className="mr-1" />
    },
    rejected: {
      text: '已锁定',
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      icon: <Lock size={12} className="mr-1" />
    }
  };

  const currentConfig = config[status as StatusType] || config.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${currentConfig.color}`}>
      {currentConfig.icon} {currentConfig.text}
    </span>
  );
};

export default StatusBadge;