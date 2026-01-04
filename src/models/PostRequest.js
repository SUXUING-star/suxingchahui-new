/**
 * PostRequest - 文章请求体模型
 * 严格对应后端的 POST_REQUEST_ALLOWED_FIELDS
 */
export class PostRequest {
  constructor(data = {}) {
    this.title = data.title || '';
    this.content = data.content || '';
    this.excerpt = data.excerpt || '';
    this.category = data.category || '未分类';
    this.tags = Array.isArray(data.tags) ? data.tags : [];
    
    // 封面图对象
    this.coverImage = {
      src: data.coverImage?.src || '',
      alt: data.coverImage?.alt || data.title || ''
    };

    // 正文图片列表
    this.contentImages = (data.contentImages || []).map(img => ({
      _id: img._id,
      src: img.src,
      alt: img.alt || ''
    }));

    // 下载链接列表 (此时已经是明文 URL)
    this.downloads = (data.downloads || []).map(dl => ({
      _id: dl._id,
      description: dl.description || '',
      url: dl.url || ''
    }));

    // 置顶开关 (仅管理员有效)
    this.topped = !!data.topped;
  }

  /**
   * 转换为发送给后端的纯 JSON 对象
   * 显式剔除不需要的字段，确保不携带 slug 或 authorId 等后端自动生成的字段
   */
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

  /**
   * 基础校验逻辑
   */
  validate() {
    if (!this.title.trim()) throw new Error('文章标题不能为空');
    if (!this.content.trim()) throw new Error('文章内容不能为空');
    if (!this.category) throw new Error('必须选择一个分类');
    return true;
  }
}