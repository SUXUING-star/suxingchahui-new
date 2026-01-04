// src/components/common/PasswordInput.jsx
import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

const PasswordInput = ({ 
  value, 
  onChange, 
  id, 
  name, 
  placeholder = "请输入密码", 
  autoComplete = "current-password",
  required = true 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        密码
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Lock size={18} />
        </div>
        <input
          id={id}
          name={name} // 必须有 name，浏览器才好存
          type={showPassword ? "text" : "password"}
          required={required}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete} // 核心：告诉浏览器这是什么密码
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white outline-none transition-all"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          tabIndex="-1" // 别让 tab 键跳到眼睛上
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;