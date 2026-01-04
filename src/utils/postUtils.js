// src/utils/postUtils.js
import API_BASE_URL from './apiConfig';
import { PostResponse } from '../models/PostResponse';
import { PostRequest } from '../models/PostRequest';

/**
 * 核心净化器：保留原名，内部使用类
 */
export const normalizePost = (rawPost) => {
  if (!rawPost) return null;
  if (Array.isArray(rawPost)) {
    return rawPost.map(p => new PostResponse(p));
  }
  return new PostResponse(rawPost);
};



export const getAllPosts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    const rawPosts = await response.json();
    return rawPosts.map(normalizePost); // 净化
  } catch (error) {
    console.error('Error fetching all posts:', error);
    return [];
  }
};

/**
 * 根据 ID (slug) 获取单篇文章的完整内容
 * @param {string} id - 文章的 slug
 * @param {string} [token] - 用户的 JWT Token (可选)
 * @returns {Promise<Object|null>} 文章对象或 null
 */
export const getPostById = async (id, token = null) => {
  try {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
        headers,
    });
    
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Failed to fetch post ${id}`);
    
    const rawPost = await response.json();
    return normalizePost(rawPost); // 净化
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    return null;
  }
};
export const getCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const categoriesData = await response.json();
    // 对每个分类下的 posts 数组进行净化
    return categoriesData.map(category => ({
      ...category,
      posts: Array.isArray(category.posts) ? category.posts.map(normalizePost) : [],
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getArchive = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/archive`);
    if (!response.ok) throw new Error('Failed to fetch archive');
    const rawPosts = await response.json();
    return rawPosts.map(normalizePost); // 净化
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getTagsData = async () => {
   try {
    const response = await fetch(`${API_BASE_URL}/tags`);
    if (!response.ok) throw new Error('Failed to fetch tags data');
    const rawPosts = await response.json();
    return rawPosts.map(normalizePost); // 净化
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * 获取分页后的文章列表
 * @param {object} params - 包含 page, limit, category, tag
 * @returns {Promise<object>} - 返回 { posts, pinnedPosts, currentPage, totalPages }
 */
export const getPaginatedPosts = async ({ page = 1, limit = 24, category = '', tag = '' }) => {
  try {
    // 构建查询参数，只添加有值的参数
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (category) params.append('category', category);
    if (tag) params.append('tag', tag);

    const response = await fetch(`${API_BASE_URL}/posts?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch paginated posts');
    }
    const data = await response.json();
    
    // 后端已经做好了数据清洗，这里直接返回
    // 顺便用我们的净化器再过一遍，双重保险
    return {
      ...data,
      posts: data.posts.map(normalizePost),
      pinnedPosts: data.pinnedPosts.map(normalizePost)
    };
  } catch (error) {
    console.error('Error fetching paginated posts:', error);
    // 返回一个安全的空结构，防止前端崩溃
    return { posts: [], pinnedPosts: [], currentPage: 1, totalPages: 1 };
  }
};

/**
 * 获取最新的 5 篇文章 (轻量级)
 */
export const getRecentPosts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/recent`);
    if (!response.ok) throw new Error('Failed to fetch recent posts');
    const rawPosts = await response.json();
    return rawPosts.map(normalizePost); // 仍然用净化器保证安全
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return [];
  }
};

/**
 * 获取标签云数据
 */
export const getTagCloudData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags/cloud`);
    if (!response.ok) throw new Error('Failed to fetch tag cloud data');
    return await response.json(); // 返回 [{ tag: '...', count: ... }]
  } catch (error) {
    console.error('Error fetching tag cloud data:', error);
    return [];
  }
};

export const apiSearchPosts = async (query) => {
  if (!query) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    // 使用 normalizePost 净化数据（确保 tags 是数组等）
    return data.map(normalizePost);
  } catch (error) {
    console.error('Search request error:', error);
    return [];
  }
};


/**
 * 创建文章 (POST)
 */
export const apiCreatePost = async (postRequest, token) => {
  if (!(postRequest instanceof PostRequest)) throw new Error('必须传入 PostRequest 实例');

  const res = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(postRequest.toJSON()), // 显式调用 toJSON
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
};

/**
 * 更新文章 (PUT)
 */
export const apiUpdatePost = async (slug, postRequest, token) => {
  if (!(postRequest instanceof PostRequest)) throw new Error('必须传入 PostRequest 实例');

  const res = await fetch(`${API_BASE_URL}/posts/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(postRequest.toJSON()), // 显式调用 toJSON
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
};

/**
 * 删除文章 (DELETE)
 */
export const apiDeletePost = async (slug, token) => {
  const res = await fetch(`${API_BASE_URL}/posts/${slug}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || '删除失败');
  return res.json();
};

/**
 * 获取我的文章列表 (GET)
 */
export const apiGetMyPosts = async (token) => {
  const res = await fetch(`${API_BASE_URL}/user/posts`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('获取失败');
  const data = await res.json();
  return data.map(normalizePost); // 必须经过净化器
};

/**
 * 管理员：获取待审池 (GET)
 */
export const apiGetPendingPosts = async (token) => {
  const res = await fetch(`${API_BASE_URL}/admin/pending`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('无权访问或获取失败');
  const data = await res.json();
  return data.map(normalizePost);
};

/**
 * 管理员：审核文章 (POST)
 */
export const apiReviewPost = async (postId, action, token) => {
  const res = await fetch(`${API_BASE_URL}/admin/review`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ postId, action }), // action: 'approve' / 'reject'
  });
  if (!res.ok) throw new Error('审核操作失败');
  return res.json();
};

/**
 * 核心请求体结构参考 (对应 POST_REQUEST_ALLOWED_FIELDS):
 * {
 *   title: string,
 *   content: string (由块组装成的 MD),
 *   excerpt: string,
 *   category: string,
 *   tags: string[],
 *   coverImage: { src: string, alt: string },
 *   contentImages: Array<{ _id: string, src: string, alt: string }>,
 *   downloads: Array<{ _id: string, description: string, url: string }>,
 *   topped: boolean (仅管理员传有效)
 * }
 */

export const apiUploadPostImage = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/posts/upload-image`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  if (!res.ok) throw new Error('图片上传失败');
  return res.json();
};


