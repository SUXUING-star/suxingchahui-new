import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiLogin } from '../../utils/authApi';
import { useNotification } from '../../context/NotificationContext';
import PasswordInput from '../common/PasswordInput';
import { Mail } from 'lucide-react';

interface LoginFormProps {
  onSwitchRegister: () => void;
  onSwitchForgot: () => void;
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onSwitchRegister, 
  onSwitchForgot, 
  onSuccess 
}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const { login } = useAuth();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiLogin({ email, password });
      login(data.user, data.token);
      showNotification(`欢迎回来，${data.user.nickname}`, 'success');
      onSuccess();
    } catch (err: any) {
      showNotification(err.message || '登录失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">登录账号</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            邮箱
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input 
              id="login-email"
              name="username"
              type="email" 
              required 
              autoComplete="username"
              value={email} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <PasswordInput 
          id="login-password"
          name="password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <div className="text-right">
          <button 
            type="button" 
            onClick={onSwitchForgot} 
            className="text-xs text-blue-500 hover:underline"
          >
            忘记密码？
          </button>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? '正在验证...' : '登录'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        没有账号？{' '}
        <button 
          type="button"
          onClick={onSwitchRegister} 
          className="text-blue-500 font-bold hover:underline"
        >
          创建一个
        </button>
      </p>
    </div>
  );
};

export default LoginForm;