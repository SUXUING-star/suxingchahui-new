// src/modeles/PostResponse.ts

/**
 * 评论模型接口
 */
export interface CommentResponse {
  id: string;
  content: string;
  date: string;
  parentId: string | null;
  user: { nickname: string; avatar: string | null };
  replies: CommentResponse[];
  getFormattedDate(): string;
}

/**
 * 全站文章响应模型接口
 */
export interface PostResponse {
  id: string;
  slug: string;
  title: string;
  createTime: string;
  updateTime: string;
  views: number;
  commentsCount: number;
  status: string;
  topped: boolean;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage: { src: string; alt?: string } | null;
  contentImages: any[];
  downloads: any[];
  author: { nickname: string; avatar: string | null; id?: string };
  comments: CommentResponse[];
  _id: string | null;
  getFormattedDate(): string;
  isEdited(): boolean;
}

/**
 * 创建评论响应对象
 */
export function createCommentResponse(raw: any = {}): CommentResponse {
  return {
    id: raw.id || raw._id,
    content: raw.content || "",
    date: raw.date || new Date().toISOString(),
    parentId: raw.parentId || null,
    user: {
      nickname: raw.user?.nickname || "虚空访客",
      avatar: raw.user?.avatar || null,
    },
    replies: Array.isArray(raw.replies)
      ? raw.replies.map((r: any) => createCommentResponse(r))
      : [],
    getFormattedDate() {
      return new Date(this.date).toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  };
}

/**
 * 创建文章响应对象
 */
export function createPostResponse(raw: any = {}): PostResponse {
  const createTime = raw.createTime || new Date().toISOString();
  const comments = Array.isArray(raw.comments)
    ? raw.comments.map((c: any) => createCommentResponse(c))
    : [];

  const excerpt = (raw.excerpt || "")
    .replace(/<[^>]*>?/gm, "")
    .replace(/\[image:.*?\]/g, "")
    .replace(/\[download:.*?\]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    _id: raw._id || null,
    id: raw.id || raw.slug || raw._id,
    slug: raw.slug || raw.id,
    title: raw.title || "Untitled",
    createTime,
    updateTime: raw.updateTime || createTime,
    views: parseInt(raw.views) || 0,
    status: raw.status || "pending",
    topped: !!raw.topped,
    excerpt,
    content: raw.content || "",
    category: raw.category || "未分类",
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    coverImage: raw.coverImage || null,
    contentImages: Array.isArray(raw.contentImages) ? raw.contentImages : [],
    downloads: Array.isArray(raw.downloads) ? raw.downloads : [],
    author: {
      nickname: raw.author?.nickname || "未知作者",
      avatar: raw.author?.avatar || null,
      id: raw.author?.id,
    },
    comments,
    commentsCount: raw.commentsCount || comments.length,
    getFormattedDate() {
      return new Date(this.createTime).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
    isEdited() {
      return (
        Math.abs(
          new Date(this.updateTime).getTime() -
            new Date(this.createTime).getTime(),
        ) > 10000
      );
    },
  };
}
