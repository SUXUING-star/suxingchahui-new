/**
 * User - 对应后端吐出的用户信息
 */
export interface IUser {
    id: string;
    nickname: string;
    email: string;
    avatar: string | null;
    isAdmin: boolean;
    createdAt?: string;
  }
  
  export class User {
    public id: string;
    public nickname: string;
    public email: string;
    public avatar: string;
    public isAdmin: boolean;
  
    constructor(raw: Partial<IUser> = {}) {
      this.id = raw.id || '';
      this.nickname = raw.nickname || '未登录用户';
      this.email = raw.email || '';
      this.avatar = raw.avatar || '/defaults/avatar.png'; // 兜底默认头像
      this.isAdmin = !!raw.isAdmin;
    }
  
    /**
     * 静态工具：从本地存储还原用户对象
     */
    static fromStorage(data: string | null): User | null {
      if (!data) return null;
      try {
        const parsed = JSON.parse(data);
        return new User(parsed);
      } catch {
        return null;
      }
    }
  
    /**
     * 获取安全的头像路径
     */
    getSafeAvatar(): string {
      return this.avatar || '/defaults/avatar.png';
    }
  
    /**
     * 判断是否是有效用户
     */
    get isAuthenticated(): boolean {
      return !!this.id;
    }
  }