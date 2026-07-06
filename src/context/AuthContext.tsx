import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
// 引入 User 接口以及配套的工厂函数 createUser
import { User, createUser } from "@/models/User";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, userToken: string) => void;
  logout: () => void;
  updateUser: (newUserData: Partial<User>) => void;
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
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(window.atob(payloadBase64));

    if (!payload.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime + 10;
  } catch (error) {
    return true;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 登出：清空所有状态和本地存储
   */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  /**
   * 初始化及校验逻辑
   */
  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        if (isTokenExpired(storedToken)) {
          console.warn("Token 已过期，重置登录状态");
          logout();
        } else {
          try {
            setToken(storedToken);
            // 替代 new User() 写法
            setUser(createUser(JSON.parse(storedUser)));
          } catch (e) {
            console.error("解析用户信息失败", e);
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleFocus = () => {
      const currentToken = localStorage.getItem("token");
      if (currentToken && isTokenExpired(currentToken)) {
        logout();
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [logout]);

  /**
   * 登录成功后的处理
   */
  const login = (userData: User, userToken: string) => {
    // 替代 new User() 写法
    const userInstance = createUser(userData);
    setToken(userToken);
    setUser(userInstance);
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  /**
   * 更新用户信息（如修改昵称、头像）
   */
  const updateUser = (newUserData: Partial<User>) => {
    if (!user) return;
    const updatedData = { ...user, ...newUserData };
    // 替代 new User() 写法
    setUser(createUser(updatedData));
    localStorage.setItem("user", JSON.stringify(updatedData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateUser,
        loading,
        isAuthenticated: !!token && !isTokenExpired(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
