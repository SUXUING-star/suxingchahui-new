// src/utils/postApi.ts

import { apiGet, apiPost, apiPut, apiDelete, apiPostForm } from './apiCore';
import { PostResponse } from '../models/PostResponse';
import { PostRequest } from '../models/PostRequest';

// --- 业务转换工具 ---
export const normalizePost = (rawPost: any): any => {
  if (!rawPost) return null;
  if (Array.isArray(rawPost)) return rawPost.map(p => new PostResponse(p));
  return new PostResponse(rawPost);
};

// --- 读操作 (GET) ---
export const getPostById = (id: string, token: string | null = null, addView = false): Promise<PostResponse> => {
  const endpoint = addView ? `/posts/${id}?views=true` : `/posts/${id}`;
  return apiGet<PostResponse>(endpoint, token, normalizePost);
};

export const getPaginatedPosts = ({ page = 1, limit = 24, category = '', tag = '' }) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) params.append('category', category);
  if (tag) params.append('tag', tag);
  return apiGet(`/posts?${params.toString()}`, null, (data) => ({
    ...data,
    posts: normalizePost(data.posts),
    pinnedPosts: normalizePost(data.pinnedPosts),
  }));
};

export const getCategories = (): Promise<any[]> => apiGet('/categories', null, (data: any[]) =>
  data.map(category => ({ ...category, posts: normalizePost(category.posts || []) }))
);

export const getArchive = (): Promise<PostResponse[]> => apiGet('/archive', null, normalizePost);
export const getTagsData = (): Promise<PostResponse[]> => apiGet('/tags', null, normalizePost);
export const getRecentPosts = (): Promise<PostResponse[]> => apiGet('/posts/recent', null, normalizePost);
export const getTagCloudData = (): Promise<any[]> => apiGet('/tags/cloud');

export const apiSearchPosts = (query: string): Promise<PostResponse[]> => {
  if (!query) return Promise.resolve([]);
  return apiGet(`/search?q=${encodeURIComponent(query)}`, null, normalizePost);
};

export const apiGetMyPosts = (token: string): Promise<PostResponse[]> => apiGet('/user/posts', token, normalizePost);
export const apiGetPendingPosts = (token: string): Promise<PostResponse[]> => apiGet('/admin/pending', token, normalizePost);

// --- 写操作 (POST, PUT, DELETE) ---
export const apiCreatePost = (postRequest: PostRequest, token: string): Promise<any> => {
  if (!(postRequest instanceof PostRequest)) throw new Error('Params must be PostRequest');
  return apiPost('/posts', postRequest.toJSON(), token);
}
export const apiUpdatePost = (slug: string, postRequest: PostRequest, token: string): Promise<any> => apiPut(`/posts/${slug}`, postRequest.toJSON(), token);
export const apiDeletePost = (slug: string, token: string): Promise<any> => apiDelete(`/posts/${slug}`, token);
export const apiPostComment = (data: any, token: string): Promise<any> => apiPost('/posts/comment', data, token);
export const apiReviewPost = (postId: string, action: 'approve' | 'reject', token: string): Promise<any> => apiPost('/admin/review', { postId, action }, token);

export const apiDeleteComment = (data: any, token: string): Promise<any> => apiDelete('/posts/comment', token, data);

export const apiUploadPostImage = (file: File, token: string): Promise<{ success: boolean; url: string; id: string; }> => {
  const formData = new FormData();
  formData.append('file', file);
  return apiPostForm('/posts/upload-image', formData, token);
};