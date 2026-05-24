import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { IUser, User } from '@/models/User';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: IUser, userToken: string) => void;
  logout: () => void;
  updateUser: (newUserData: Partial<IUser>) => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 辅助函数：解析 JWT 并检查是否过期
 */
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    // JWT 格式为 header.payload.signature
    const [, payloadBase64] = token.split('.');
    // atob 解码 Base64，JSON.parse 转为对象
    const payload = JSON.parse(window.atob(payloadBase64));
    
    // 如果没有 exp 字段，默认视为过期
    if (!payload.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000); // 转换为秒
    // 留 10 秒缓冲区，防止发请求的一瞬间刚好过期
    return payload.exp < (currentTime + 10); 
  } catch (error) {
    // 解析失败（Token 格式不对或被篡改）
    return true;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 登出：清空所有状态和本地存储
   */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  /**
   * 初始化及校验逻辑
   */
  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        // 1. 检查是否过期
        if (isTokenExpired(storedToken)) {
          console.warn('Token 已过期，重置登录状态');
          logout();
        } else {
          // 2. 没过期，尝试恢复状态
          try {
            setToken(storedToken);
            setUser(new User(JSON.parse(storedUser)));
          } catch (e) {
            console.error('解析用户信息失败', e);
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();

    // 进阶优化：用户开着网页长时间不刷新，切回来时自动检查一次
    const handleFocus = () => {
      const currentToken = localStorage.getItem('token');
      if (currentToken && isTokenExpired(currentToken)) {
        logout();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [logout]);

  /**
   * 登录成功后的处理
   */
  const login = (userData: IUser, userToken: string) => {
    const userInstance = new User(userData);
    setToken(userToken);
    setUser(userInstance);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * 更新用户信息（如修改昵称、头像）
   */
  const updateUser = (newUserData: Partial<IUser>) => {
    if (!user) return;
    const updatedData = { ...user, ...newUserData };
    setUser(new User(updatedData));
    localStorage.setItem('user', JSON.stringify(updatedData));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      updateUser, 
      loading, 
      isAuthenticated: !!token && !isTokenExpired(token) 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};