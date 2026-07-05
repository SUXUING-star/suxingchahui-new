import { BookOpen, Layers } from "lucide-react";

// 1. 定义统一的映射和【强顺序】
export const BOOK_TYPE_MAP: Record<string, string> = {
  中长篇: "novel",
  短篇集: "collection",
  诗集文集: "poetry",
};
export const BOOK_TYPES = [
  { id: "novel", label: "中长篇", icon: BookOpen },
  { id: "collection", label: "短篇集", icon: Layers },
  { id: "poetry", label: "诗集文集", icon: Layers },
];

export const BOOK_SORT_ORDER = ["中长篇", "短篇集", "诗集文集"];

export const BOOK_COUNTRIES = [
  "中国",
  "日本",
  "欧洲",
  "俄罗斯",
  "美洲",
  "阿拉伯",
  "其他",
];

// 可选字段配置
export const EXPORTABLE_FIELDS = [
  { id: "title", label: "书名", default: true },
  { id: "author", label: "作者", default: true },
  { id: "year", label: "年代/年份", default: true },
  { id: "country", label: "地区", default: true },
  { id: "specificCountry", label: "具体国家", default: true },
  { id: "bookType", label: "体裁", default: true },
  { id: "status", label: "阅读状态", default: true },
  { id: "stories", label: "收录篇目", default: true },
  { id: "shortReview", label: "阅读随笔", default: true },
  { id: "longReview", label: "详细长评", default: false },
];
