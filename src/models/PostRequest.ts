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

export class PostRequest {
  public title: string;
  public content: string;
  public excerpt: string;
  public category: string;
  public tags: string[];
  public coverImage: ICoverImage;
  public contentImages: IContentImage[];
  public downloads: IDownload[];
  public topped: boolean;

  constructor(data: Partial<PostRequest> = {}) {
    this.title = data.title || '';
    this.content = data.content || '';
    this.excerpt = data.excerpt || '';
    this.category = data.category || '未分类';
    this.tags = Array.isArray(data.tags) ? data.tags : [];
    
    this.coverImage = {
      src: data.coverImage?.src || '',
      alt: data.coverImage?.alt || data.title || ''
    };

    this.contentImages = (data.contentImages || []).map(img => ({
      _id: img._id,
      src: img.src,
      alt: img.alt || ''
    }));

    this.downloads = (data.downloads || []).map(dl => ({
      _id: dl._id,
      description: dl.description || '',
      url: dl.url || ''
    }));

    this.topped = !!data.topped;
  }

  toJSON() {
    return {
      title: this.title,
      content: this.content,
      excerpt: this.excerpt,
      category: this.category,
      tags: this.tags,
      coverImage: this.coverImage,
      contentImages: this.contentImages,
      downloads: this.downloads,
      topped: this.topped
    };
  }

  validate(): void {
    if (!this.title.trim()) throw new Error('文章标题不能为空');
    if (!this.content.trim()) throw new Error('文章内容不能为空');
  }
}