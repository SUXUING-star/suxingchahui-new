// src/utils/authApi.ts

import { apiPost, apiPut, apiPostForm } from './apiCore';
import { IUser } from '@/models/User';

// --- 类型定义 ---
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

// --- API 函数 ---
export const apiLogin = (payload: any): Promise<AuthSuccessResponse> => 
  apiPost('/auth/login', payload);

export const apiRegister = (formData: any): Promise<AuthSuccessResponse> => 
  apiPost('/auth/register', formData);

export const apiSendVerificationCode = (payload: { email: string; type: 'register' | 'reset_password' }): Promise<BaseResponse> => 
  apiPost('/auth/send-verification', payload);

export const apiCheckEmailExists = (email: string): Promise<CheckEmailResponse> => 
  apiPost('/auth/forgot-password', { email });

export const apiResetPassword = (payload: any): Promise<BaseResponse> => 
  apiPut('/auth/reset-password', payload, null);

export const apiUpdateNickname = (nickname: string, token: string): Promise<AuthSuccessResponse> => 
  apiPut('/user/nickname', { nickname }, token);

export const apiUploadAvatar = (file: File, token: string): Promise<AuthSuccessResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  return apiPostForm('/user/avatar', formData, token);
};