// src/components/auth/ResetPwdForm.jsx
import React, { useState } from 'react';
import { apiResetPassword } from '../../utils/authUtils';
import { useNotification } from '../../context/NotificationContext';
import PasswordInput from '../common/PasswordInput'; // <-- 引入新组件
import { ShieldCheck, Mail } from 'lucide-react';

const ResetPwdForm = ({ email, onSwitchLogin, onSuccess }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 调用封装函数
      await apiResetPassword({ email, verificationCode, password: newPassword });

      showNotification('密码重置成功！请使用新密码登录', 'success', '重置成功');
      onSuccess(); // 切换回登录界面
      
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">重置密码</h2>
        <p className="text-sm text-gray-500 mt-2">
          正在为 <span className="font-semibold text-blue-500">{email}</span> 设置新密码
        </p>
      </div>

      <form onSubmit={handleReset} className="space-y-4">
        {/* 隐藏的用户名域：帮助浏览器识别这是在给哪个账号重置密码 */}
        <input type="hidden" name="username" value={email} autoComplete="username" />

        {/* 验证码输入 */}
        <div className="space-y-2">
          <label htmlFor="reset-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            验证码
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <ShieldCheck size={18} />
            </div>
            <input 
              id="reset-code"
              name="vcode"
              type="text" 
              required 
              value={verificationCode} 
              onChange={e => setVerificationCode(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入6位验证码"
            />
          </div>
        </div>

        {/* 新密码：使用专门的 PasswordInput */}
        <PasswordInput 
          id="reset-password"
          name="new-password"
          label="新密码" // 如果你的 PasswordInput 内部没写 label，这里可以传
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          autoComplete="new-password" // 核心：告诉浏览器这是重置后的新密码
          placeholder="请输入新的登录密码"
        />

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
        >
          {loading ? '正在处理...' : '确认重置密码'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        想起密码了？ <button onClick={onSwitchLogin} className="text-blue-500 font-bold hover:underline">返回登录</button>
      </p>
    </div>
  );
};

export default ResetPwdForm;