import { User } from './User';

/**
 * 评论模型
 */
export class Comment {
  public _id: string;
  public content: string;
  public date: string;
  public parentId: string | null;
  public user: { nickname: string; avatar: string | null };
  public replies: Comment[];

  constructor(raw: any = {}) {
    this._id = raw._id;
    this.content = raw.content || '';
    this.date = raw.date || new Date().toISOString();
    this.parentId = raw.parentId || null;
    this.user = {
      nickname: raw.user?.nickname || '虚空访客',
      avatar: raw.user?.avatar || null
    };
    this.replies = Array.isArray(raw.replies) 
      ? raw.replies.map((r: any) => new Comment(r)) 
      : [];
  }

  getFormattedDate(): string {
    return new Date(this.date).toLocaleString('zh-CN', {
      month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  }
}

/**
 * 全站文章响应模型
 */
export class PostResponse {
  public id: string;
  public slug: string;
  public title: string;
  public createTime: string;
  public updateTime: string;
  public views: number;
  public status: string;
  public topped: boolean;
  public excerpt: string;
  public content: string;
  public category: string;
  public tags: string[];
  public coverImage: { src: string; alt?: string } | null;
  public contentImages: any[];
  public downloads: any[];
  public author: { nickname: string; avatar: string | null; id?: string };
  public comments: Comment[];
  public _id: string | null;

  constructor(raw: any = {}) {
    this._id = raw._id || null;
    this.id = raw.id || raw.slug || raw._id;
    this.slug = raw.slug || raw.id;
    this.title = raw.title || 'Untitled';
    this.createTime = raw.createTime || new Date().toISOString();
    this.updateTime = raw.updateTime || this.createTime;
    this.views = parseInt(raw.views) || 0;
    this.status = raw.status || 'pending';
    this.topped = !!raw.topped;
    this.content = raw.content || '';
    this.category = raw.category || '未分类';
    this.tags = Array.isArray(raw.tags) ? raw.tags : [];
    this.coverImage = raw.coverImage || null;
    this.contentImages = Array.isArray(raw.contentImages) ? raw.contentImages : [];
    this.downloads = Array.isArray(raw.downloads) ? raw.downloads : [];

    // 自动清理摘要
    this.excerpt = (raw.excerpt || '')
      .replace(/<[^>]*>?/gm, '')
      .replace(/\[image:.*?\]/g, '')
      .replace(/\[download:.*?\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    this.author = {
      nickname: raw.author?.nickname || '未知作者',
      avatar: raw.author?.avatar || null,
      id: raw.author?.id
    };

    this.comments = Array.isArray(raw.comments) 
      ? raw.comments.map((c: any) => new Comment(c)) 
      : [];
  }

  getFormattedDate(): string {
    return new Date(this.createTime).toLocaleDateString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  }

  isEdited(): boolean {
    return Math.abs(new Date(this.updateTime).getTime() - new Date(this.createTime).getTime()) > 10000;
  }
}