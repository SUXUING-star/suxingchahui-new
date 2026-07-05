// 1. 后端返回的标准实体（带 _id 和 createdAt）
export interface BookResponse {
  id: string;
  title: string;
  author: string;
  year: string; // <--- 刚加的年代字段
  country: string;
  specificCountry?: string; // 具体国家
  bookType: string;
  status: "read" | "unread";
  stories: string[];
  shortReview?: string;
  longReview?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BookListResponse {
  success: boolean;
  data: BookResponse[];
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
