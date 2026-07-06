// src/modeles/User.ts

export interface User {
  id: string;
  nickname: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
  getSafeAvatar(): string;
  readonly isAuthenticated: boolean;
}

/**
 * 创建用户对象
 */
export function createUser(raw: Partial<User> = {}): User {
  return {
    id: raw.id || "",
    nickname: raw.nickname || "未登录用户",
    email: raw.email || "",
    avatar: raw.avatar || "/defaults/avatar.png",
    isAdmin: !!raw.isAdmin,
    getSafeAvatar() {
      return this.avatar || "/defaults/avatar.png";
    },
    get isAuthenticated() {
      return !!this.id;
    },
  };
}

/**
 * 从本地存储还原用户数据
 */
export function userFromStorage(data: string | null): User | null {
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return createUser(parsed);
  } catch {
    return null;
  }
}
