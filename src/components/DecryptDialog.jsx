// src/components/DecryptDialog.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Key, X, ExternalLink, Copy } from 'lucide-react';

/**
 * 解密加密链接的对话框组件。
 * @param {object} props
 * @param {boolean} props.isOpen - 控制对话框是否显示
 * @param {function} props.onClose - 关闭对话框的回调函数
 * @param {string} [props.encryptedData=''] - 传入的加密数据字符串 (e.g., "encrypted:...")
 */
const DecryptDialog = ({ isOpen, onClose, encryptedData = '' }) => {
  const [password, setPassword] = useState('');
  const [currentEncryptedInput, setCurrentEncryptedInput] = useState(''); // 用于输入框的加密文本
  const [error, setError] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedUrl, setDecryptedUrl] = useState('');
  const [showResult, setShowResult] = useState(false);

  // 当对话框打开时，初始化加密文本输入框为传入的数据
  useEffect(() => {
    if (isOpen) {
      setCurrentEncryptedInput(encryptedData);
      // 同时重置其他状态，确保每次打开都是干净的
      setPassword('');
      setError('');
      setDecryptedUrl('');
      setShowResult(false);
    }
  }, [isOpen, encryptedData]); // 依赖 isOpen 和 encryptedData

  // 处理解密后的URL显示时间
  useEffect(() => {
    let timer;
    if (decryptedUrl && showResult) { // 确保只有在显示结果时才启动计时
      timer = setTimeout(() => {
        setShowResult(false);
        setDecryptedUrl(''); // 清空 URL
        setCurrentEncryptedInput(''); // 清空输入框
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [decryptedUrl, showResult]);

  /**
   * 解密 URL 的核心函数
   * 注意: 这个函数依赖于浏览器 Web Crypto API (window.crypto.subtle)
   * @param {string} encryptedBase64Url - 原始 Base64URL 编码的加密字符串 (不含 "encrypted:")
   * @param {string} password - 解密密码
   * @returns {Promise<string|null>} 解密后的 URL 或 null (如果失败)
   */
  const decryptUrl = useCallback(async (encryptedBase64Url, password) => {
    try {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      // 从 Base64URL 解码
      // 填充 = 符号以确保 Base64 正确解码
      const base64Padding = encryptedBase64Url.padEnd(encryptedBase64Url.length + (4 - (encryptedBase64Url.length % 4)) % 4, '=');
      const encryptedData = Uint8Array.from(atob(base64Padding.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
      
      const keyMaterial = await window.crypto.subtle.importKey(
          'raw',
          encoder.encode(password),
          { name: 'PBKDF2' },
          false,
          ['deriveBits', 'deriveKey']
      );
      
      const key = await window.crypto.subtle.deriveKey(
          {
          name: 'PBKDF2',
          salt: encoder.encode('static_salt_for_blog'), // 使用固定盐值
          iterations: 100000,
          hash: 'SHA-256'
          },
          keyMaterial,
          { name: 'AES-GCM', length: 256 },
          true,
          ['decrypt']
      );
      
      // 分离 nonce (IV) 和加密内容
      const nonce = encryptedData.slice(0, 12); // IV 通常是 12 字节
      const ciphertext = encryptedData.slice(12);
      
      const decryptedData = await window.crypto.subtle.decrypt(
          {
          name: 'AES-GCM',
          iv: nonce
          },
          key,
          ciphertext
      );
      
      return decoder.decode(decryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      setError('解密失败，请检查密码和链接'); // 设置更友好的错误信息
      return null;
    }
  }, []); // useCallback 确保函数引用稳定

  /**
   * 处理解密按钮点击事件
   */
  const handleDecrypt = useCallback(async () => {
    if (!password || !currentEncryptedInput) {
      setError('请输入密码和加密链接');
      return;
    }
    
    setIsDecrypting(true);
    setError(''); // 清除之前的错误信息
    
    try {
      const encryptedPart = currentEncryptedInput.includes('encrypted:')
        ? currentEncryptedInput.split('encrypted:')[1].trim()
        : currentEncryptedInput.trim();
  
      const url = await decryptUrl(encryptedPart, password);
      if (url) {
        setDecryptedUrl(url);
        setShowResult(true);
      } else {
        // decryptUrl 内部已经设置了错误，这里可以不重复设置
        // 或者进一步区分错误类型
      }
    } catch (err) {
      console.error('Unexpected decryption error:', err);
      setError('发生未知错误，请重试');
    } finally {
      setIsDecrypting(false);
    }
  }, [password, currentEncryptedInput, decryptUrl]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(decryptedUrl);
      alert('链接已复制到剪贴板');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('复制失败，请手动复制或浏览器不支持');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              解密链接
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {!showResult ? (
            <>
              <div className="space-y-2">
                <label htmlFor="encrypted-link" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  加密链接
                </label>
                <div className="relative rounded-md shadow-sm">
                  <textarea
                    id="encrypted-link"
                    className="block w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="请粘贴以 encrypted: 开头的加密链接"
                    rows={3}
                    value={currentEncryptedInput}
                    onChange={(e) => setCurrentEncryptedInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  密码
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleDecrypt();
                    }}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    解密成功！链接将在5秒后消失
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
                      title="复制链接"
                    >
                      <Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </button>
                    <a
                      href={decryptedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
                      title="打开链接"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </a>
                  </div>
                </div>
                <p className="mt-2 text-sm text-blue-700 dark:text-blue-300 break-all">
                  {decryptedUrl}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!showResult && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
            >
              取消
            </button>
            <button
              onClick={handleDecrypt}
              disabled={isDecrypting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDecrypting ? '解密中...' : '解密'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecryptDialog;