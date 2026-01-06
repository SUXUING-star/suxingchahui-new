// src/utils/apiCore.ts

import API_BASE_URL from './apiConfig';

// --- 内部请求管理变量 (仅用于 GET 缓存) ---
const pendingRequests = new Map<string, Promise<any>>();
const dataCache = new Map<string, any>();
const CACHE_TTL = 2000;

// --- 类型定义 ---
interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  token?: string | null;
  body?: any;
  headers?: HeadersInit; // 允许完全自定义或覆盖 header
  processor?: (data: any) => any; // 数据后处理器
  isFormData?: boolean; // 特殊标记，用于处理文件上传
}

/**
 * 统一的错误处理和响应解析
 */
const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: `请求失败，状态码: ${res.status}` }));
    throw new Error(errorData.message || '未知网络错误');
  }
  if (res.status === 204) { // No Content
    return {} as T;
  }
  return res.json();
};

/**
 * 唯一的、最终的核心请求函数
 * @param endpoint API 路径, e.g., '/posts/123'
 * @param options 所有请求配置
 */
const apiClient = async <T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> => {
  const {
    method = 'GET',
    token = null,
    body,
    headers: customHeaders,
    processor,
    isFormData = false,
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  // --- GET 请求走缓存和请求合并逻辑 ---
  if (method === 'GET') {
    const authHeader = token ? `Bearer ${token}` : '';
    const cacheKey = `${url}_${authHeader}`;

    if (dataCache.has(cacheKey)) return dataCache.get(cacheKey);
    if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey);

    const requestPromise = (async () => {
      try {
        const res = await fetch(url, { headers: { 'Authorization': authHeader } });
        let data = await handleResponse<any>(res);
        if (processor) data = processor(data);

        dataCache.set(cacheKey, data);
        setTimeout(() => dataCache.delete(cacheKey), CACHE_TTL);
        return data;
      } finally {
        pendingRequests.delete(cacheKey);
      }
    })();
    
    pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  // --- 非 GET 请求 (POST, PUT, DELETE etc.) 直接发送 ---
  const finalHeaders: Record<string, string> = {};

  // 默认 Content-Type，除非是 FormData 或用户自定义了
  if (body && !isFormData) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  // 添加 token
  if (token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  // 用户自定义的 header 优先级最高，可以覆盖上面的所有默认值
  Object.assign(finalHeaders, customHeaders);

  // 准备请求体
  let finalBody: BodyInit | undefined = undefined;
  if (body) {
    finalBody = isFormData ? body : JSON.stringify(body);
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: finalBody,
  });

  let data = await handleResponse<T>(res);
  if (processor) data = processor(data);
  return data;
};

// --- 对外暴露的便捷方法 (完全向后兼容，不用改业务代码) ---

export const apiGet = <T>(endpoint: string, token: string | null = null, processor?: (data: any) => T): Promise<T> =>
  apiClient<T>(endpoint, { method: 'GET', token, processor });

export const apiPost = <T>(endpoint: string, body: any, token: string | null = null): Promise<T> =>
  apiClient<T>(endpoint, { method: 'POST', body, token });

export const apiPut = <T>(endpoint: string, body: any, token: string | null): Promise<T> =>
  apiClient<T>(endpoint, { method: 'PUT', body, token });

export const apiDelete = <T>(endpoint: string, token: string | null, body?: any): Promise<T> =>
  apiClient<T>(endpoint, { method: 'DELETE', token, body });

export const apiPostForm = <T>(endpoint: string, formData: FormData, token: string | null): Promise<T> =>
  apiClient<T>(endpoint, { method: 'POST', body: formData, token, isFormData: true });