import React, { useState, FormEvent, ChangeEvent } from 'react';
import { apiRegister, apiSendVerificationCode } from '../../utils/authUtils';
import { useNotification } from '../../context/NotificationContext';
import PasswordInput from '../common/PasswordInput';
import { User, Mail, ShieldCheck, Ticket } from 'lucide-react';

interface RegisterFormProps {
  onSwitchLogin: () => void;
  onSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchLogin, onSuccess }) => {
  const [formData, setFormData] = useState({ 
    nickname: '', 
    email: '', 
    password: '', 
    invitationCode: '', 
    verificationCode: '' 
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [vLoading, setVLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const { showNotification } = useNotification();

  const sendCode = async () => {
    if (!formData.email) return showNotification('请输入邮箱', 'error');
    setVLoading(true);
    try {
      await apiSendVerificationCode({ email: formData.email, type: 'register' });
      showNotification('验证码已发送', 'success');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { 
            clearInterval(timer); 
            return 0; 
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) { 
      showNotification(err.message, 'error'); 
    } finally { 
      setVLoading(false); 
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRegister(formData);
      showNotification('注册成功，请登录', 'success');
      onSuccess(); 
    } catch (err: any) { 
      showNotification(err.message, 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // 将 input 的 name 映射到 state 的 key
    const fieldMap: Record<string, string> = {
      nickname: 'nickname',
      email: 'email',
      vcode: 'verificationCode',
      invite: 'invitationCode'
    };
    const field = fieldMap[name] || name;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center dark:text-white">加入我们</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            name="nickname"
            placeholder="用户昵称" 
            required 
            className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
            onChange={handleChange} 
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            name="email"
            type="email" 
            autoComplete="email"
            placeholder="注册邮箱" 
            required 
            className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
            onChange={handleChange} 
          />
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <ShieldCheck className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              name="vcode"
              placeholder="邮箱验证码" 
              required 
              className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
              onChange={handleChange} 
            />
          </div>
          <button 
            type="button" 
            disabled={vLoading || countdown > 0} 
            onClick={sendCode} 
            className="px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {countdown > 0 ? `${countdown}s` : '获取'}
          </button>
        </div>

        <PasswordInput 
          id="reg-password"
          name="new-password"
          autoComplete="new-password"
          placeholder="设置密码 (至少6位)"
          value={formData.password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, password: e.target.value})}
        />

        <div className="relative">
          <Ticket className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            name="invite"
            placeholder="邀请码 (必填)" 
            required 
            className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
            onChange={handleChange} 
          />
        </div>

        <button 
          type="submit"
          disabled={loading} 
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          立即注册
        </button>
      </form>
      <p className="text-center text-sm">
        <button 
          type="button"
          onClick={onSwitchLogin} 
          className="text-blue-500 hover:underline"
        >
          已有账号？返回登录
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;