import { BookOpen, Layers } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from './apiCore';

// 1. 后端返回的标准实体（带 _id 和 createdAt）
export interface Book {
  _id: string;
  title: string;
  author: string;
  year: string;        // <--- 刚加的年代字段
  country: string;
  specificCountry?: string; // 具体国家
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
  '诗集文集': 'poetry' 
};
export const BOOK_TYPES = [
    { id: 'novel', label: '中长篇', icon: BookOpen },
    { id: 'collection', label: '短篇集', icon: Layers },
    { id: 'poetry', label: '诗集文集', icon: Layers }
  ];

export const BOOK_SORT_ORDER = ['中长篇', '短篇集', '诗集文集'];

export const BOOK_COUNTRIES = ['中国', '日本', '欧洲', '俄罗斯', '美洲', '阿拉伯', '其他'];

// 可选字段配置
export const EXPORTABLE_FIELDS = [
  { id: 'title', label: '书名', default: true },
  { id: 'author', label: '作者', default: true },
  { id: 'year', label: '年代/年份', default: true },
  { id: 'country', label: '地区', default: true },
  { id: 'specificCountry', label: '具体国家', default: true }, 
  { id: 'bookType', label: '体裁', default: true },
  { id: 'status', label: '阅读状态', default: true },
  { id: 'stories', label: '收录篇目', default: true },
  { id: 'shortReview', label: '阅读随笔', default: true },
  { id: 'longReview', label: '详细长评', default: false },
];

// 2. 这里的 Request 类型专门用于 创建(POST) 和 更新(PUT)
// 这样你就不用在组件里写 Partial<Book> 或者手动拼类型了
export interface BookRequest {
  title: string;
  author: string;
  year: string;
  country: string;
  specificCountry?: string; 
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
  specificCountry: '', // 初始为空
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
 * 批量创建书籍记录
 */
export const createBooksBatch = (booksData: any[], token: string | null): Promise<{ success: boolean; count: number }> => {
  return apiPost('/books', booksData, token);
};

/**
 * 更新书籍信息
 */
export const updateBook = (id: string, bookData: Partial<Book>, token: string | null): Promise<{ success: boolean; data: Book }> => {
  return apiPut(`/books/${id}`, bookData, token);
};

/**
 * 1. 批量对比接口：发给后端，让后端去库里找茬，返回差异
 */
export const compareBooksBatch = (booksData: any, token: string | null): Promise<{ success: boolean; diffs: any[] }> => {
  return apiPost('/books/compare', booksData, token);
};

/**
 * 2. 批量更新接口：只发送变化的字段进行增量更新
 */
export const updateBooksBatch = (booksData: any[], token: string | null): Promise<{ success: boolean; modifiedCount: number }> => {
  return apiPut('/books', booksData, token);
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

