// src/components/layout/GlobalModalWrapper.jsx
import React from 'react';
import { useModal } from '../../context/ModalContext';
import WriteModal from '../post/WriteModal';
import AuthModal from '../auth/AuthModal';

const GlobalModalWrapper = () => {
  const { 
    isWriteOpen, closeWriteModal, editSlug,
    isAuthOpen, closeAuthModal 
  } = useModal();

  return (
    <>
      {/* 写稿/编辑弹窗 */}
      <WriteModal 
        isOpen={isWriteOpen} 
        onClose={closeWriteModal} 
        editSlug={editSlug} 
      />
      
      {/* 登录/注册弹窗 */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={closeAuthModal} 
      />
    </>
  );
};

export default GlobalModalWrapper;