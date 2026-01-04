// src/components/auth/RegisterForm.jsx
import React, { useState } from 'react';
import { apiRegister, apiSendVerificationCode } from '../../utils/authUtils';
import { useNotification } from '../../context/NotificationContext';
import PasswordInput from '../common/PasswordInput';
import { User, Mail, ShieldCheck, Ticket } from 'lucide-react';

const RegisterForm = ({ onSwitchLogin, onSuccess }) => {
  const [formData, setFormData] = useState({ nickname: '', email: '', password: '', invitationCode: '', verificationCode: '' });
  const [loading, setLoading] = useState(false);
  const [vLoading, setVLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
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
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) { showNotification(err.message, 'error'); }
    finally { setVLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRegister(formData);
      showNotification('注册成功，请登录', 'success');
      onSuccess(); 
    } catch (err) { showNotification(err.message, 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center dark:text-white">加入我们</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        {/* 昵称 */}
        <div className="relative">
          <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            name="nickname"
            placeholder="用户昵称" 
            required 
            className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
            onChange={e => setFormData({...formData, nickname: e.target.value})} 
          />
        </div>

        {/* 邮箱 */}
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            name="email"
            type="email" 
            autoComplete="email" // 告诉浏览器这是新账户的邮箱
            placeholder="注册邮箱" 
            required 
            className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
        </div>

        {/* 验证码 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <ShieldCheck className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              name="vcode"
              placeholder="邮箱验证码" 
              required 
              className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
              onChange={e => setFormData({...formData, verificationCode: e.target.value})} 
            />
          </div>
          <button type="button" disabled={vLoading || countdown > 0} onClick={sendCode} className="px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50">
            {countdown > 0 ? `${countdown}s` : '获取'}
          </button>
        </div>

        {/* 密码：使用 PasswordInput */}
        <PasswordInput 
          id="reg-password"
          name="new-password"
          autoComplete="new-password" // 核心：告诉浏览器这是新密码，浏览器会提示生成强密码
          placeholder="设置密码 (至少6位)"
          value={formData.password}
          onChange={e => setFormData({...formData, password: e.target.value})}
        />

        {/* 邀请码 */}
        <div className="relative">
          <Ticket className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            name="invite"
            placeholder="邀请码 (必填)" 
            required 
            className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
            onChange={e => setFormData({...formData, invitationCode: e.target.value})} 
          />
        </div>

        <button disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-50">
          立即注册
        </button>
      </form>
      <p className="text-center text-sm"><button onClick={onSwitchLogin} className="text-blue-500 hover:underline">已有账号？返回登录</button></p>
    </div>
  );
};

export default RegisterForm;