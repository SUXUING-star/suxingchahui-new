/**
 * PostResponse - 响应体标准化模型
 */
export class PostResponse {
  constructor(raw = {}) {
    this.id = raw.id || raw.slug || raw._id;
    this.slug = raw.slug || raw.id;
    this.title = raw.title || 'Untitled';
    this.date = raw.date || new Date().toISOString();
    this.status = raw.status || 'pending';
    this.topped = !!raw.topped;

    // 核心精修：摘要清洗逻辑直接内置
    this.excerpt = (raw.excerpt || '')
      .replace(/<[^>]*>?/gm, '')
      .replace(/\[image:.*?\]/g, '')
      .replace(/\[download:.*?\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    this.content = raw.content || '';
    this.category = raw.category || '未分类';
    this.categories = Array.isArray(raw.categories) ? raw.categories : [];
    this.tags = Array.isArray(raw.tags) ? raw.tags : [];
    this.coverImage = raw.coverImage || null;
    this.contentImages = Array.isArray(raw.contentImages) ? raw.contentImages : [];
    this.downloads = Array.isArray(raw.downloads) ? raw.downloads : [];

    this.author = {
      nickname: raw.author?.nickname || '未知作者',
      avatar: raw.author?.avatar || null
    };

    this._id = raw._id || null;
  }

  // 格式化日期的方法，组件直接用
  getFormattedDate() {
    return new Date(this.date).toLocaleDateString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  }
}