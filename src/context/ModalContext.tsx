import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface ModalContextType {
  isWriteOpen: boolean;
  editSlug: string | null;
  openWriteModal: (slug?: string | null, callback?: (() => void) | null) => void;
  closeWriteModal: () => void;
  isAuthOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  onWriteSuccess: (() => void) | null;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [onWriteSuccess, setOnWriteSuccess] = useState<(() => void) | null>(null);

  // 全局滚动锁死逻辑
  useEffect(() => {
    if (isWriteOpen || isAuthOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none'; 
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.touchAction = 'auto';
    }
  }, [isWriteOpen, isAuthOpen]);

  const openWriteModal = (slug: string | null = null, callback: (() => void) | null = null) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    setEditSlug(slug);
    // 注意：React 设置函数状态时需要用这种写法，防止被当成执行函数
    setOnWriteSuccess(() => callback);
    setIsWriteOpen(true);
  };

  const closeWriteModal = () => {
    setIsWriteOpen(false);
    setEditSlug(null);
    setOnWriteSuccess(null);
  };

  return (
    <ModalContext.Provider value={{ 
      isWriteOpen, editSlug, openWriteModal, closeWriteModal,
      isAuthOpen, openAuthModal: () => setIsAuthOpen(true), closeAuthModal: () => setIsAuthOpen(false),
      onWriteSuccess 
    }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within ModalProvider');
  return context;
};