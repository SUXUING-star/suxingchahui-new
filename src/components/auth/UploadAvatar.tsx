import React, { useState, useRef, ChangeEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiUploadAvatar } from '../../utils/authUtils';
import { Upload, Loader } from 'lucide-react';

interface UploadAvatarProps {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

const UploadAvatar: React.FC<UploadAvatarProps> = ({ onSuccess, onError }) => {
  const { user, token, updateUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(user?.avatar);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      onError('文件大小不能超过 5MB');
      return;
    }
    
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    onError('');
  };

  const handleUpload = async () => {
    if (!file || !token) return;
    setUploading(true);
    try {
      // 假设 apiUploadAvatar 返回的数据包含更新后的 user 对象或 avatar 地址
      const data = await apiUploadAvatar(file, token);
      
      // 根据 apiUploadAvatar 的返回结构更新，此处假设返回 AuthSuccessResponse
      updateUser(data.user);
      
      onSuccess('头像上传成功!');
    } catch (err: any) {
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

      <div 
        className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 cursor-pointer group relative"
        onClick={() => fileInputRef.current?.click()}
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
        type="button"
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