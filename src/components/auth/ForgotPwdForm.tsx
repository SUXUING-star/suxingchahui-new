import React, { useState, FormEvent } from 'react';
import { apiCheckEmailExists, apiSendVerificationCode } from '../../utils/authApi';

interface ForgotPwdFormProps {
  onSwitchLogin: () => void;
  onCodeSent: (email: string) => void;
}

const ForgotPwdForm: React.FC<ForgotPwdFormProps> = ({ onSwitchLogin, onCodeSent }) => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleNext = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const checkData = await apiCheckEmailExists(email);
      
      if (!checkData.userExists) {
        setError(checkData.message || '邮箱未注册或服务器错误');
        setLoading(false);
        return;
      }

      await apiSendVerificationCode({ email, type: 'reset_password' });

      alert('重置验证码已发送至您的邮箱');
      onCodeSent(email);
      
    } catch (err: any) {
      setError(err.message || '发送失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">找回密码</h2>
        <p className="text-sm text-gray-500 mt-2">请输入您的注册邮箱</p>
      </div>

      <form onSubmit={handleNext} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">邮箱</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            className="mt-1 w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? '发送中...' : '发送验证码'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        <button 
          type="button"
          onClick={onSwitchLogin} 
          className="text-blue-500 font-bold hover:underline"
        >
          返回登录
        </button>
      </p>
    </div>
  );
};

export default ForgotPwdForm;