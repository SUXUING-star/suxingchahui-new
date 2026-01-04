// src/context/ModalContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [editSlug, setEditSlug] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [onWriteSuccess, setOnWriteSuccess] = useState(null);

  // --- 核心：全局滚动锁死逻辑 ---
  useEffect(() => {
    // 只要有一个弹窗开着，就锁死 body
    if (isWriteOpen || isAuthOpen) {
      document.body.style.overflow = 'hidden';
      // 兼容手机端
      document.body.style.touchAction = 'none'; 
    } else {
      // 全部关掉时，恢复正常
      document.body.style.overflow = 'auto';
      document.body.style.touchAction = 'auto';
    }

    // 销毁时的双重保险
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.touchAction = 'auto';
    };
  }, [isWriteOpen, isAuthOpen]);

  const openWriteModal = (slug = null, callback = null) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    setEditSlug(slug);
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

export const useModal = () => useContext(ModalContext);