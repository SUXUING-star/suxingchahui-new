import React from 'react';
import { useModal } from '../../context/ModalContext';
import WriteModal from '../post/editor/WriteModal';
import AuthModal from '../auth/AuthModal';

const GlobalModalWrapper: React.FC = () => {
  const { 
    isWriteOpen, closeWriteModal, editSlug,
    isAuthOpen, closeAuthModal 
  } = useModal();

  return (
    <>
      <WriteModal 
        isOpen={isWriteOpen} 
        onClose={closeWriteModal} 
        editSlug={editSlug} 
      />
      
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={closeAuthModal} 
      />
    </>
  );
};

export default GlobalModalWrapper;