import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初始化：从本地存储恢复
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(new User(JSON.parse(storedUser)));
    }
    setLoading(false);
  }, []);

  const login = (userData: IUser, userToken: string) => {
    const userInstance = new User(userData);
    setToken(userToken);
    setUser(userInstance);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (newUserData: Partial<IUser>) => {
    if (!user) return;
    const updatedData = { ...user, ...newUserData };
    setUser(new User(updatedData));
    localStorage.setItem('user', JSON.stringify(updatedData));
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, login, logout, updateUser, 
      loading, isAuthenticated: !!token 
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