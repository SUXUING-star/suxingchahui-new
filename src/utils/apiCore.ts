// src/utils/apiCore.ts

import pako from "pako";
import API_BASE_URL from "./apiConfig";

// --- 内部请求管理变量 (仅用于 GET 缓存) ---
const pendingRequests = new Map<string, Promise<any>>();
const dataCache = new Map<string, any>();
const CACHE_TTL = 2000;

// --- 类型定义 ---
interface ApiClientOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  token?: string | null;
  body?: any;
  headers?: HeadersInit; // 允许完全自定义或覆盖 header
  processor?: (data: any) => any; // 数据后处理器
  isFormData?: boolean; // 特殊标记，用于处理文件上传
  useLocalCache?: boolean; // 💡 是否开启本地持久缓存 (localStorage)
  localCacheTTL?: number; // 💡 本地缓存时间 (ms)，默认 60000ms
}

/**
 * 统一的错误处理和响应解析 (增加解压逻辑)
 */
const handleResponse = async <T>(res: Response): Promise<T> => {
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    throw new Error("登录已过期，请重新登录");
  }

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: `请求失败: ${res.status}` }));
    throw new Error(errorData.message || "未知网络错误");
  }

  if (res.status === 204) return {} as T;

  // 检测是否被压缩
  const isCompressed =
    res.headers.get("X-Response-Compressed") === "true" ||
    res.headers.get("Content-Encoding") === "gzip";

  if (isCompressed) {
    const arrayBuffer = await res.arrayBuffer();
    const decompressed = pako.ungzip(new Uint8Array(arrayBuffer), {
      to: "string",
    });
    return JSON.parse(decompressed);
  }

  return res.json();
};

/**
 * 唯一的、最终的核心请求函数
 * @param endpoint API 路径, e.g., '/posts/123'
 * @param options 所有请求配置
 */
const apiClient = async <T>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> => {
  const {
    method = "GET",
    token = null,
    body,
    headers: customHeaders,
    processor,
    isFormData = false,
    useLocalCache = false,
    localCacheTTL = 60000,
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  // --- GET 请求走缓存和请求合并逻辑 ---
  if (method === "GET") {
    const authHeader = token ? `Bearer ${token}` : "";
    const memoryCacheKey = `${url}_${authHeader}`;
    const storageCacheKey = `local_cache_${endpoint}`;

    // 1. 优先检测并读取本地 LocalStorage 缓存
    if (useLocalCache) {
      try {
        const cachedStr = localStorage.getItem(storageCacheKey);
        if (cachedStr) {
          const { timestamp, data } = JSON.parse(cachedStr);
          if (Date.now() - timestamp < localCacheTTL) {
            // 本地缓存有效，直接应用数据后处理器并返回
            return processor ? processor(data) : data;
          }
        }
      } catch (e) {
        console.warn("Failed to read localStorage cache:", e);
      }
    }

    // 2. 检测内存缓存和正在进行的重复请求
    if (dataCache.has(memoryCacheKey)) return dataCache.get(memoryCacheKey);
    if (pendingRequests.has(memoryCacheKey))
      return pendingRequests.get(memoryCacheKey);

    const requestPromise = (async () => {
      try {
        const res = await fetch(url, {
          headers: { Authorization: authHeader },
        });
        const rawData = await handleResponse<any>(res);

        // 请求成功后，如果启用了本地缓存，写入 LocalStorage 归档
        if (useLocalCache) {
          try {
            localStorage.setItem(
              storageCacheKey,
              JSON.stringify({
                timestamp: Date.now(),
                data: rawData,
              }),
            );
          } catch (e) {
            console.warn("Failed to write localStorage cache:", e);
          }
        }

        let processedData = rawData;
        if (processor) processedData = processor(rawData);

        dataCache.set(memoryCacheKey, processedData);
        setTimeout(() => dataCache.delete(memoryCacheKey), CACHE_TTL);
        return processedData;
      } finally {
        pendingRequests.delete(memoryCacheKey);
      }
    })();

    pendingRequests.set(memoryCacheKey, requestPromise);
    return requestPromise;
  }

  // --- 非 GET 请求 (POST, PUT, DELETE etc.) 直接发送 ---
  const finalHeaders: Record<string, string> = {};

  if (body && !isFormData) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  Object.assign(finalHeaders, customHeaders);

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

// --- 对外暴露的便捷方法 (兼容原业务，并支持新特性) ---

export const apiGet = <T>(
  endpoint: string,
  token: string | null = null,
  processor?: (data: any) => T,
  cacheOptions?: { useLocalCache?: boolean; localCacheTTL?: number },
): Promise<T> =>
  apiClient<T>(endpoint, {
    method: "GET",
    token,
    processor,
    ...cacheOptions,
  });

export const apiPost = <T>(
  endpoint: string,
  body: any,
  token: string | null = null,
): Promise<T> => apiClient<T>(endpoint, { method: "POST", body, token });

export const apiPut = <T>(
  endpoint: string,
  body: any,
  token: string | null,
): Promise<T> => apiClient<T>(endpoint, { method: "PUT", body, token });

export const apiDelete = <T>(
  endpoint: string,
  token: string | null,
  body?: any,
): Promise<T> => apiClient<T>(endpoint, { method: "DELETE", token, body });

export const apiPostForm = <T>(
  endpoint: string,
  formData: FormData,
  token: string | null,
): Promise<T> =>
  apiClient<T>(endpoint, {
    method: "POST",
    body: formData,
    token,
    isFormData: true,
  });
