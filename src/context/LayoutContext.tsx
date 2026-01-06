import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. 定义 Context 内部数据的类型接口
interface LayoutContextType {
  hideSidebars: boolean;
  setHideSidebars: (hide: boolean) => void;
  customBg: string | null;
  setCustomBg: (bg: string | null) => void;
}

// 2. 创建 Context
const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

/**
 * LayoutProvider - 布局指挥部
 */
export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hideSidebars, setHideSidebars] = useState<boolean>(false);
  const [customBg, setCustomBg] = useState<string | null>(null); 

  const value = { 
    hideSidebars, 
    setHideSidebars, 
    customBg, 
    setCustomBg 
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

/**
 * 自定义 Hook：确保调用安全
 */
export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('他妈的 useLayout 必须在 LayoutProvider 里面用！');
  }
  return context;
};