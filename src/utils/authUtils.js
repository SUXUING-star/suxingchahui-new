import API_BASE_URL from './apiConfig';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || '网络请求失败');
  }
  return data;
};

// --- 认证核心函数 ---

export const apiLogin = async ({ email, password }) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
};

export const apiRegister = async (formData) => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  return handleResponse(res);
};

// --- 验证码/密码重置函数 ---

export const apiSendVerificationCode = async ({ email, type }) => {
  const res = await fetch(`${API_BASE_URL}/auth/send-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, type }),
  });
  return handleResponse(res);
};

export const apiCheckEmailExists = async (email) => {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
};

export const apiResetPassword = async ({ email, verificationCode, password }) => {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, verificationCode, password }),
  });
  return handleResponse(res);
};

// --- 用户信息函数 ---

export const apiUpdateNickname = async (nickname, token) => {
  const res = await fetch(`${API_BASE_URL}/user/nickname`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ nickname }),
  });
  return handleResponse(res);
};

export const apiUploadAvatar = async (file, token) => {
    const formData = new FormData();
    formData.append('file', file); // 必须是 'file' 键名，对应后端 formidable 配置

    const res = await fetch(`${API_BASE_URL}/user/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // requests 会自动设置 Content-Type: multipart/form-data
        body: formData,
    });
    return handleResponse(res);
}