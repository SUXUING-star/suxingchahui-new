// src/utils/postApi.ts

import { apiDelete, apiGet, apiPost, apiPostForm, apiPut } from "./apiCore";
// 引入接口及其对应的工厂函数
import { PostRequest } from "../models/PostRequest";
import { PostResponse, createPostResponse } from "../models/PostResponse";

// --- 业务转换工具 ---
export const normalizePost = (rawPost: any): any => {
  if (!rawPost) return null;
  if (Array.isArray(rawPost)) return rawPost.map((p) => createPostResponse(p));
  return createPostResponse(rawPost);
};

// --- 读操作 (GET) ---
export const getPostById = (
  id: string,
  token: string | null = null,
  addView = false,
): Promise<PostResponse> => {
  const endpoint = addView ? `/posts/${id}?views=true` : `/posts/${id}`;
  return apiGet<PostResponse>(endpoint, token, normalizePost);
};

export const getPostBySlug = (
  slug: string,
  token: string | null = null,
  addView = false,
): Promise<PostResponse> => {
  const endpoint = addView ? `/posts/${slug}?views=true` : `/posts/${slug}`;
  return apiGet<PostResponse>(endpoint, token, normalizePost);
};

export const getPaginatedPosts = ({
  page = 1,
  limit = 24,
  category = "",
  tag = "",
}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (category) params.append("category", category);
  if (tag) params.append("tag", tag);
  return apiGet(
    `/posts?${params.toString()}`,
    null,
    (data) => ({
      ...data,
      posts: normalizePost(data.posts),
      pinnedPosts: normalizePost(data.pinnedPosts),
    }),
    {
      useLocalCache: true,
      localCacheTTL: 30000,
    },
  );
};

export const getCategories = (): Promise<any[]> =>
  apiGet(
    "/posts/categories",
    null,
    (data: any[]) =>
      data.map((category) => ({
        ...category,
        posts: normalizePost(category.posts || []),
      })),
    {
      useLocalCache: true,
      localCacheTTL: 60000,
    },
  );

export const getArchive = (): Promise<PostResponse[]> =>
  apiGet("/posts/archive", null, normalizePost);

export const getTagsData = (): Promise<PostResponse[]> =>
  apiGet("/posts/tags", null, normalizePost);

// 💡 仅需一行配置，即刻享有一分钟本地缓存
export const getRecentPosts = (): Promise<PostResponse[]> =>
  apiGet("/posts/recent", null, normalizePost, {
    useLocalCache: true,
    localCacheTTL: 60000,
  });

// 💡 同理，一行配置即可为标签索引开启本地缓存
export const getTagCloudData = (): Promise<any[]> =>
  apiGet("/tags/cloud", null, undefined, {
    useLocalCache: true,
    localCacheTTL: 60000,
  });

export const apiSearchPosts = (query: string): Promise<PostResponse[]> => {
  if (!query) return Promise.resolve([]);
  return apiGet(
    `/posts/search?q=${encodeURIComponent(query)}`,
    null,
    normalizePost,
  );
};

export const apiGetMyPosts = (token: string): Promise<PostResponse[]> =>
  apiGet("/user/posts", token, normalizePost);
export const apiGetPendingPosts = (token: string): Promise<PostResponse[]> =>
  apiGet("/admin/pending", token, normalizePost);

// --- 写操作 (POST, PUT, DELETE) ---
export const apiCreatePost = (
  postRequest: PostRequest,
  token: string,
): Promise<any> => {
  if (!postRequest || typeof postRequest.toJSON !== "function")
    throw new Error("Params must be PostRequest");
  return apiPost("/posts", postRequest.toJSON(), token);
};

export const apiUpdatePost = (
  slug: string,
  postRequest: PostRequest,
  token: string,
): Promise<any> => apiPut(`/posts/${slug}`, postRequest.toJSON(), token);

export const apiTogglePostPin = (
  slug: string,
  topped: boolean,
  token: string,
): Promise<{ success: boolean; topped: boolean }> =>
  apiPut(`/posts/${slug}`, { topped }, token);

export const apiDeletePost = (slug: string, token: string): Promise<any> =>
  apiDelete(`/posts/${slug}`, token);

export const apiPostComment = (data: any, token: string): Promise<any> =>
  apiPost("/posts/comment", data, token);

export const apiReviewPost = (
  postId: string,
  action: "approve" | "reject",
  token: string,
): Promise<any> => apiPost("/admin/review", { postId, action }, token);

export const apiDeleteComment = (data: any, token: string): Promise<any> =>
  apiDelete("/posts/comment", token, data);

export const apiUploadPostImage = (
  file: File,
  token: string,
): Promise<{ success: boolean; url: string; id: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  return apiPostForm("/posts/upload-image", formData, token);
};
