import API_BASE_URL from './apiConfig';
import { PostResponse } from '../models/PostResponse';
import { PostRequest } from '../models/PostRequest';

// --- 内部请求管理变量 ---
const pendingRequests = new Map<string, Promise<any>>(); // 正在飞往服务器的 Promise
const dataCache = new Map<string, any>();       // 已完成的 2 秒热缓存
const CACHE_TTL = 2000;            // 2 秒热失效

/**
 * 智能请求控制器 (TS 泛型版)
 * 核心逻辑：合并相同的 GET 请求，并提供极短时间的缓存以防 React 18 之后双重挂载带来的重复请求
 */
const smartFetch = async <T>(
  url: string, 
  options: RequestInit = {}, 
  processor?: (data: any) => T
): Promise<T> => {
  const isGet = !options.method || options.method === 'GET';
  
  // 1. 非 GET 操作 (POST, PUT, DELETE) 绝对不走缓存和合并
  if (!isGet) {
    const res = await fetch(url, options);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Request Failed');
    }
    return res.json();
  }

  // 2. 生成唯一指纹 (URL + Authorization)
  const headers = options.headers as Record<string, string> || {};
  const authHeader = headers['Authorization'] || '';
  const cacheKey = `${url}_${authHeader}`;

  // 3. 检查【结果缓存】：2 秒内拿过同样数据的，直接吐出来
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey);
  }

  // 4. 检查【在途队列】：如果同样的请求正在跑，直接共享它的 Promise
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  // 5. 发起真实网络请求
  const requestPromise = (async () => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      let data = await response.json();
      
      // 执行标准化处理 (例如实例化 PostResponse)
      if (processor) {
        data = processor(data);
      }

      // 写入 2 秒热缓存
      dataCache.set(cacheKey, data);
      setTimeout(() => dataCache.delete(cacheKey), CACHE_TTL);

      return data;
    } finally {
      // 无论成功失败，请求结束必须从“在途队列”移除
      pendingRequests.delete(cacheKey);
    }
  })();

  // 存入在途队列
  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

// --- 【业务转换工具】 ---

/**
 * 将后端原始 JSON 转换为 PostResponse 实例
 */
export const normalizePost = (rawPost: any): any => {
  if (!rawPost) return null;
  if (Array.isArray(rawPost)) return rawPost.map(p => new PostResponse(p));
  return new PostResponse(rawPost);
};

// --- 【读操作接口 (GET) - 全部接入 smartFetch】 ---

/**
 * 获取文章详情
 */
export const getPostById = async (id: string, token: string | null = null, addView = false): Promise<PostResponse> => {
  const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
  const url = new URL(`${API_BASE_URL}/posts/${id}`);
  if (addView) url.searchParams.append('views', 'true');

  return smartFetch<PostResponse>(url.toString(), { headers }, normalizePost);
};

/**
 * 分页获取文章列表
 */
export const getPaginatedPosts = async ({ page = 1, limit = 24, category = '', tag = '' }) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) params.append('category', category);
  if (tag) params.append('tag', tag);
  const url = `${API_BASE_URL}/posts?${params.toString()}`;
  
  return smartFetch(url, {}, (data) => ({
    ...data,
    posts: normalizePost(data.posts),
    pinnedPosts: normalizePost(data.pinnedPosts)
  }));
};

/**
 * 获取分类数据（及其下的文章）
 */
export const getCategories = async (): Promise<any[]> => {
  return smartFetch(`${API_BASE_URL}/categories`, {}, (data: any[]) => {
    return data.map(category => ({
      ...category,
      posts: normalizePost(category.posts || []),
    }));
  });
};

/**
 * 获取归档数据
 */
export const getArchive = async (): Promise<PostResponse[]> => {
  return smartFetch(`${API_BASE_URL}/archive`, {}, normalizePost);
};

/**
 * 获取所有标签对应的文章
 */
export const getTagsData = async (): Promise<PostResponse[]> => {
  return smartFetch(`${API_BASE_URL}/tags`, {}, normalizePost);
};

/**
 * 获取最近更新的文章
 */
export const getRecentPosts = async (): Promise<PostResponse[]> => {
  return smartFetch(`${API_BASE_URL}/posts/recent`, {}, normalizePost);
};

/**
 * 获取标签云统计
 */
export const getTagCloudData = async (): Promise<any[]> => {
  return smartFetch(`${API_BASE_URL}/tags/cloud`, {});
};

/**
 * 搜索文章
 */
export const apiSearchPosts = async (query: string): Promise<PostResponse[]> => {
  if (!query) return [];
  const url = `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`;
  return smartFetch(url, {}, normalizePost);
};

/**
 * 获取“我的文章” (需鉴权)
 */
export const apiGetMyPosts = async (token: string): Promise<PostResponse[]> => {
  return smartFetch(`${API_BASE_URL}/user/posts`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }, normalizePost);
};

/**
 * 获取待审核文章 (仅限管理员)
 */
export const apiGetPendingPosts = async (token: string): Promise<PostResponse[]> => {
  return smartFetch(`${API_BASE_URL}/admin/pending`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }, normalizePost);
};

// --- 【写操作接口 (POST, PUT, DELETE) - 直接 fetch，严禁合并】 ---

/**
 * 创建文章
 */
export const apiCreatePost = async (postRequest: PostRequest, token: string): Promise<any> => {
  if (!(postRequest instanceof PostRequest)) throw new Error('Params must be PostRequest');
  const res = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(postRequest.toJSON()),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Create post failed');
  }
  return res.json();
};

/**
 * 更新文章
 */
export const apiUpdatePost = async (slug: string, postRequest: PostRequest, token: string): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/posts/${slug}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(postRequest.toJSON()),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Update post failed');
  }
  return res.json();
};

/**
 * 删除文章
 */
export const apiDeletePost = async (slug: string, token: string): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/posts/${slug}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
};

/**
 * 发表评论
 */
export const apiPostComment = async (data: any, token: string): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/posts/comment`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Comment failed');
  return res.json();
};

/**
 * 删除评论
 */
export const apiDeleteComment = async (data: any, token: string): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/posts/comment`, {
    method: 'DELETE',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Delete comment failed');
  return res.json();
};

/**
 * 审核文章 (管理员)
 */
export const apiReviewPost = async (postId: string, action: 'approve' | 'reject', token: string): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/admin/review`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ postId, action }),
  });
  if (!res.ok) throw new Error('Review failed');
  return res.json();
};

/**
 * 上传文章内的图片
 */
export const apiUploadPostImage = async (file: File, token: string): Promise<{ success: boolean; url: string; id: string; }> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/posts/upload-image`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Upload failed');
  }
  return res.json();
};