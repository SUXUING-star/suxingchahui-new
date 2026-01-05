import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. 定义 Context 内部数据的类型接口
interface LayoutContextType {
  hideSidebars: boolean;
  setHideSidebars: (hide: boolean) => void;
  customBg: string | null;           // 全局背景，可以是图片 URL 或颜色值
  setCustomBg: (bg: string | null) => void;
}

// 2. 创建 Context，初始值为 undefined 是为了在 hook 里做安全检查
const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

/**
 * LayoutProvider - 布局指挥部
 */
export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hideSidebars, setHideSidebars] = useState<boolean>(false);
  
  // 核心：全局背景状态。如果为 null，则显示 BackgroundLayout 默认的星星背景
  const [customBg, setCustomBg] = useState<string | null>(null); 

  return (
    <LayoutContext.Provider value={{ 
      hideSidebars, 
      setHideSidebars, 
      customBg, 
      setCustomBg 
    }}>
      {children}
    </LayoutContext.Provider>
  );
};

/**
 * 自定义 Hook：确保调用安全
 */
export const useLayout = () => {
  const context = useContext(LayoutContext);
  
  // 如果在 Provider 外部调用，直接报个有意义的错，别让它悄悄崩溃
  if (context === undefined) {
    throw new Error('他妈的 useLayout 必须在 LayoutProvider 里面用！');
  }
  
  return context;
};