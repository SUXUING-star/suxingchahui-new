// src/modeles/PostRequest.ts

export interface ICoverImage {
  src: string;
  alt?: string;
}

export interface IContentImage {
  _id: string;
  src: string;
  alt?: string;
}

export interface IDownload {
  _id: string;
  description: string;
  url: string;
}

export interface PostRequest {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  coverImage: ICoverImage;
  contentImages: IContentImage[];
  downloads: IDownload[];
  topped?: boolean;
  toJSON(): any;
  validate(): void;
}

/**
 * 创建请求数据对象
 */
export function createPostRequest(
  data: Partial<PostRequest> = {},
): PostRequest {
  const topped = typeof data.topped === "boolean" ? data.topped : undefined;

  return {
    title: data.title || "",
    content: data.content || "",
    excerpt: data.excerpt || "",
    category: data.category || "未分类",
    tags: Array.isArray(data.tags) ? data.tags : [],
    coverImage: {
      src: data.coverImage?.src || "",
      alt: data.coverImage?.alt || data.title || "",
    },
    contentImages: (data.contentImages || []).map((img) => ({
      _id: img._id,
      src: img.src,
      alt: img.alt || "",
    })),
    downloads: (data.downloads || []).map((dl) => ({
      _id: dl._id,
      description: dl.description || "",
      url: dl.url || "",
    })),
    ...(topped !== undefined ? { topped } : {}),
    toJSON() {
      const serialized: any = {
        title: this.title,
        content: this.content,
        excerpt: this.excerpt,
        category: this.category,
        tags: this.tags,
        coverImage: this.coverImage,
        contentImages: this.contentImages,
        downloads: this.downloads,
      };

      if (this.topped !== undefined) {
        serialized.topped = this.topped;
      }

      return serialized;
    },
    validate() {
      if (!this.title.trim()) throw new Error("文章标题不能为空");
      if (!this.content.trim()) throw new Error("文章内容不能为空");
    },
  };
}
