// 2. 这里的 Request 类型专门用于 创建(POST) 和 更新(PUT)
// 这样你就不用在组件里写 Partial<Book> 或者手动拼类型了
export interface BookRequest {
  title: string;
  author: string;
  year: string;
  country: string;
  specificCountry?: string;
  bookType: string;
  status: "read" | "unread";
  stories: string[];
  shortReview: string;
  longReview?: string;
}

// 别再到处写字面量了，用这个！
export const INITIAL_BOOK_FORM: BookRequest = {
  title: "",
  author: "",
  year: "",
  country: "中国",
  specificCountry: "", // 初始为空
  bookType: "novel",
  status: "read",
  stories: [],
  shortReview: "",
  longReview: "",
};
