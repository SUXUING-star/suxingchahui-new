import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import anime from 'animejs';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  type?: 'danger' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = "确认删除", type = "danger" }) => {
  useEffect(() => {
    if (isOpen) {
      anime({ targets: '.confirm-modal-overlay', opacity: [0, 1], duration: 200, easing: 'linear' });
      anime({ targets: '.confirm-modal-content', scale: [0.9, 1], opacity: [0, 1], duration: 300, easing: 'easeOutBack' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="confirm-modal-content w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-6 text-center">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-bold dark:text-gray-100 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex space-x-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl font-bold">取消</button>
          <button onClick={onConfirm} className={`flex-1 px-4 py-2.5 text-white rounded-xl font-bold ${type === 'danger' ? 'bg-red-600' : 'bg-blue-600'}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmModal;