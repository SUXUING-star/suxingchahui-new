import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import anime from 'animejs';
import UploadAvatar from './UploadAvatar';
import { useNotification } from '../../context/NotificationContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Status {
  message: string;
  type: 'success' | 'error' | '';
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<Status>({ message: '', type: '' });
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isOpen) {
      anime({
        targets: '.profile-modal-overlay',
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
      });
      anime({
        targets: '.profile-modal-content',
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutBack'
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;
    
  const handleSuccess = (msg: string) => {
    showNotification(msg, 'success', '上传成功');
    setTimeout(onClose, 1000);
  };
    
  const handleError = (msg: string) => {
    setStatus({ message: msg, type: 'error' });
  };

  return (
    <div className="profile-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm opacity-0">
      <div className="profile-modal-content relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden p-8 opacity-0">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-center dark:text-white mb-6">更新头像</h2>
        
        {status.message && (
          <div className={`p-3 mb-4 rounded-lg text-sm ${
            status.type === 'success' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
              : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
          }`}>
            {status.message}
          </div>
        )}

        <UploadAvatar 
          onSuccess={handleSuccess} 
          onError={handleError}
        />
      </div>
    </div>
  );
};

export default ProfileModal;