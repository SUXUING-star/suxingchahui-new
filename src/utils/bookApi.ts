import { apiGet, apiPost, apiPut, apiDelete } from './apiCore';

export interface Book {
  _id: string;
  title: string;
  author: string;
  status: 'read' | 'unread';
  country: string;
  bookType: string;
  stories: string[]; // 同步增加
  shortReview?: string;
  longReview?: string;
  createdAt: string;
}
export interface BookListResponse {
  success: boolean;
  data: Book[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export interface BookStatsResponse {
  success: boolean;
  data: Array<{
    country: string;
    total: number;
    details: Array<{ name: string; count: number }>;
  }>;
}

/**
 * 获取书单列表（分页）
 */
export const getBooks = (page = 1, limit = 10, token: string | null): Promise<BookListResponse> => {
  return apiGet<BookListResponse>(`/books?page=${page}&limit=${limit}`, token);
};

/**
 * 创建新书籍
 */
export const createBook = (bookData: Partial<Book>, token: string | null): Promise<{ success: boolean; data: Book }> => {
  return apiPost('/books', bookData, token);
};

/**
 * 更新书籍信息
 */
export const updateBook = (id: string, bookData: Partial<Book>, token: string | null): Promise<{ success: boolean; data: Book }> => {
  return apiPut(`/books/${id}`, bookData, token);
};

/**
 * 批量删除书籍
 */
export const deleteBooks = (ids: string[], token: string | null): Promise<{ success: boolean; deletedCount: number }> => {
  return apiDelete('/books', token, { ids });
};


export const getBookStats = (token: string | null): Promise<BookStatsResponse> => {
  return apiGet<BookStatsResponse>('/books/stats', token);
};

export const getBooksFiltered = (page: number, params: any, token: string | null): Promise<BookListResponse> => {
  const query = new URLSearchParams({ 
    page: page.toString(), 
    ...params 
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

