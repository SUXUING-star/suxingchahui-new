import API_BASE_URL from './apiConfig';
import { IUser } from '@/models/User';

interface BaseResponse {
  success: boolean;
  message?: string;
}

interface AuthSuccessResponse extends BaseResponse {
  token: string;
  user: IUser;
}

interface CheckEmailResponse extends BaseResponse {
  userExists: boolean;
}

const handleResponse = async <T>(res: Response): Promise<T> => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || '网络请求失败');
  }
  return data as T;
};

export const apiLogin = async (payload: any): Promise<AuthSuccessResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<AuthSuccessResponse>(res);
};

export const apiRegister = async (formData: any): Promise<AuthSuccessResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  return handleResponse<AuthSuccessResponse>(res);
};

export const apiSendVerificationCode = async (payload: { 
  email: string; 
  type: 'register' | 'reset_password' 
}): Promise<BaseResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/send-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<BaseResponse>(res);
};

export const apiCheckEmailExists = async (email: string): Promise<CheckEmailResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse<CheckEmailResponse>(res);
};

export const apiResetPassword = async (payload: any): Promise<BaseResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<BaseResponse>(res);
};

export const apiUpdateNickname = async (nickname: string, token: string): Promise<AuthSuccessResponse> => {
  const res = await fetch(`${API_BASE_URL}/user/nickname`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ nickname }),
  });
  return handleResponse<AuthSuccessResponse>(res);
};

export const apiUploadAvatar = async (file: File, token: string): Promise<AuthSuccessResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/user/avatar`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  return handleResponse<AuthSuccessResponse>(res);
};