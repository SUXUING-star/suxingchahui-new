// src/components/common/StatusPlaceholder.jsx
import React from 'react';
import { AlertCircle, Inbox, ShieldX, RefreshCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatusPlaceholder = ({ 
  type = 'empty', 
  title, 
  message, 
  onRetry, // 这里接收的是一个真正的 fetchData 函数
  showHome = false 
}) => {
  const navigate = useNavigate();

  const configs = {
    empty: { icon: <Inbox size={48} className="text-gray-300" />, defaultTitle: '空空如也', color: 'text-gray-400' },
    error: { icon: <AlertCircle size={48} className="text-red-500" />, defaultTitle: '链路中断', color: 'text-red-500' },
    denied: { icon: <ShieldX size={48} className="text-amber-500" />, defaultTitle: '拒绝访问', color: 'text-amber-500' }
  };

  const config = configs[type] || configs.empty;

  return (
    <div className="flex items-center justify-center py-20 px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/95 border border-gray-100 dark:border-white/5 rounded-[48px] p-12 shadow-2xl text-center">
        <div className="flex justify-center mb-8">
          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-[32px] shadow-inner">{config.icon}</div>
        </div>

        <h3 className={`text-2xl font-black mb-3 uppercase tracking-tighter ${config.color}`}>
          {title || config.defaultTitle}
        </h3>
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-10 px-4 leading-relaxed">
          {message}
        </p>

        <div className="flex flex-col space-y-4">
          {onRetry && (
            <button 
              onClick={onRetry} // 直接触发父级传入的刷新逻辑
              className="group flex items-center justify-center px-10 py-4 bg-blue-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/30"
            >
              <RefreshCcw size={18} className="mr-3 group-hover:rotate-180 transition-transform duration-500" /> 
              尝试重新连接
            </button>
          )}
          
          {showHome && (
            <button 
              onClick={() => navigate('/')}
              className="flex items-center justify-center px-10 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
            >
              <Home size={18} className="mr-3" /> 回到枢纽中心
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusPlaceholder;