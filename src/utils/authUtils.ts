import API_BASE_URL from './apiConfig';
import { IUser } from '@/models/User';

// 统一定义响应格式
interface AuthResponse {
  success: boolean;
  token?: string;
  user?: IUser;
  message?: string;
  userExists?: boolean;
}

const handleResponse = async (res: Response): Promise<any> => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || '网络请求失败');
  }
  return data;
};

export const apiLogin = async (payload: any): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const apiRegister = async (formData: any): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  return handleResponse(res);
};

export const apiSendVerificationCode = async (payload: { email: string; type: 'register' | 'reset_password' }): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/send-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const apiCheckEmailExists = async (email: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
};

export const apiResetPassword = async (payload: any): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const apiUpdateNickname = async (nickname: string, token: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/user/nickname`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ nickname }),
  });
  return handleResponse(res);
};

export const apiUploadAvatar = async (file: File, token: string): Promise<AuthResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/user/avatar`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(res);
};