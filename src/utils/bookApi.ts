import { apiGet, apiPost, apiPut, apiDelete } from "./apiCore";
import {
  BookListResponse,
  BookResponse,
  BookStatsResponse,
} from "@/models/BookReponse";
/**
 * 获取书单列表（分页）
 */
export const getBooks = (
  page = 1,
  limit = 10,
  token: string | null,
): Promise<BookListResponse> => {
  return apiGet<BookListResponse>(`/books?page=${page}&limit=${limit}`, token);
};

/**
 * 创建新书籍
 */
export const createBook = (
  bookData: Partial<BookResponse>,
  token: string | null,
): Promise<{ success: boolean; data: BookResponse }> => {
  return apiPost("/books", bookData, token);
};

/**
 * 批量创建书籍记录
 */
export const createBooksBatch = (
  booksData: any[],
  token: string | null,
): Promise<{ success: boolean; count: number }> => {
  return apiPost("/books", booksData, token);
};

/**
 * 更新书籍信息
 */
export const updateBook = (
  id: string,
  bookData: Partial<BookResponse>,
  token: string | null,
): Promise<{ success: boolean; data: BookResponse }> => {
  return apiPut(`/books/${id}`, bookData, token);
};

/**
 * 1. 批量对比接口：发给后端，让后端去库里找茬，返回差异
 */
export const compareBooksBatch = (
  booksData: any,
  token: string | null,
): Promise<{ success: boolean; diffs: any[] }> => {
  return apiPost("/books/compare", booksData, token);
};

/**
 * 2. 批量更新接口：只发送变化的字段进行增量更新
 */
export const updateBooksBatch = (
  booksData: any[],
  token: string | null,
): Promise<{ success: boolean; modifiedCount: number }> => {
  return apiPut("/books", booksData, token);
};

/**
 * 批量删除书籍
 */
export const deleteBooks = (
  ids: string[],
  token: string | null,
): Promise<{ success: boolean; deletedCount: number }> => {
  return apiDelete("/books", token, { ids });
};

export const getBookStats = (
  token: string | null,
): Promise<BookStatsResponse> => {
  return apiGet<BookStatsResponse>("/books/stats", token);
};

export const getBooksFiltered = (
  page: number,
  params: any,
  token: string | null,
): Promise<BookListResponse> => {
  const query = new URLSearchParams({
    page: page.toString(),
    ...params,
  }).toString();
  return apiGet<BookListResponse>(`/books?${query}`, token);
};

/**
 * 获取导出数据 (JSON 包装格式)
 */
export const getExportData = (params: any, token: string | null) => {
  const query = new URLSearchParams(params).toString();
  return apiGet<{
    success: boolean;
    payload: any;
    filename: string;
    type: string;
  }>(`/books/export?${query}`, token);
};
