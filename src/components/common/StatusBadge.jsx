// src/components/common/StatusBadge.jsx
import React from 'react';
import { Clock, CheckCircle, Lock } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const config = {
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

  const { text, color, icon } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${color}`}>
      {icon} {text}
    </span>
  );
};

export default StatusBadge;