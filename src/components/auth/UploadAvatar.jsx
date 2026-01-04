import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiUploadAvatar } from '../../utils/authUtils';
import { Upload, X, Check, Loader } from 'lucide-react';

const UploadAvatar = ({ onSuccess, onError }) => {
  const { user, token, updateUser } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatar);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) { // 5MB 限制
        onError('文件大小不能超过 5MB');
        return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    onError(''); // 清除错误
  };

  const handleUpload = async () => {
    if (!file || !token) return;
    setUploading(true);
    try {
      const data = await apiUploadAvatar(file, token);
      
      // 更新 AuthContext
      updateUser({ avatar: data.avatar });
      
      onSuccess('头像上传成功!');
    } catch (err) {
      onError(err.message || '头像上传失败');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        hidden 
      />

      {/* 头像预览 */}
      <div 
        className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 cursor-pointer group relative"
        onClick={() => fileInputRef.current.click()}
      >
        <img 
          src={preview || user?.avatar || '/defaults/avatar.png'} 
          alt="Avatar Preview" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload size={30} className="text-white" />
        </div>
      </div>
      
      {file && (
        <p className="text-sm text-gray-500 dark:text-gray-400">已选择: {file.name}</p>
      )}

      <button 
        onClick={handleUpload}
        disabled={!file || uploading}
        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
      >
        {uploading ? (
            <>
                <Loader size={20} className="mr-2 animate-spin" />
                上传中...
            </>
        ) : (
            <>
                <Upload size={20} className="mr-2" />
                确认上传
            </>
        )}
      </button>
    </div>
  );
};

export default UploadAvatar;