// src/components/common/ConfirmModal.jsx
import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import anime from 'animejs';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "确认删除", type = "danger" }) => {
  useEffect(() => {
    if (isOpen) {
      anime({
        targets: '.confirm-modal-overlay',
        opacity: [0, 1],
        duration: 200,
        easing: 'linear'
      });
      anime({
        targets: '.confirm-modal-content',
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutBack'
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDanger = type === 'danger';

  return (
    <div className="confirm-modal-overlay fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="confirm-modal-content relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-center">
        
        {/* 警告图标 */}
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          <AlertTriangle size={32} />
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {message}
        </p>

        {/* 按钮组 */}
        <div className="flex space-x-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;