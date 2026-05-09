import { BookOpen, Layers } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from './apiCore';

// 1. 后端返回的标准实体（带 _id 和 createdAt）
export interface Book {
  _id: string;
  title: string;
  author: string;
  year: string;        // <--- 刚加的年代字段
  country: string;
  bookType: string;
  status: 'read' | 'unread';
  stories: string[];
  shortReview?: string;
  longReview?: string;
  createdAt: string;
  updatedAt?: string;
}

// 1. 定义统一的映射和【强顺序】
export const BOOK_TYPE_MAP: Record<string, string> = { 
  '中长篇': 'novel', 
  '短篇集': 'collection', 
  '诗歌集': 'poetry' 
};
export const BOOK_TYPES = [
    { id: 'novel', label: '中长篇小说', icon: BookOpen },
    { id: 'collection', label: '短篇作品集', icon: Layers }
  ];

export const BOOK_SORT_ORDER = ['中长篇', '短篇集', '诗歌集'];

export const BOOK_COUNTRIES = [' 中国', '日本', '欧洲', '俄罗斯', '美洲', '其他'];

// 2. 这里的 Request 类型专门用于 创建(POST) 和 更新(PUT)
// 这样你就不用在组件里写 Partial<Book> 或者手动拼类型了
export interface BookRequest {
  title: string;
  author: string;
  year: string;
  country: string;
  bookType: string;
  status: 'read' | 'unread';
  stories: string[];
  shortReview: string;
  longReview?: string;
}

// 别再到处写字面量了，用这个！
export const INITIAL_BOOK_FORM: BookRequest = {
  title: '',
  author: '',
  year: '',
  country: '中国',
  bookType: 'novel',
  status: 'read',
  stories: [],
  shortReview: '',
  longReview: ''
};

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

