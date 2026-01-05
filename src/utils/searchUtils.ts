import { PostResponse } from '../models/PostResponse';

/**
 * 在文章列表中进行多关键词模糊搜索
 */
export function searchPosts(posts: PostResponse[], query: string): PostResponse[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  const searchTerms = trimmedQuery.toLowerCase().split(' ');

  return posts.filter((post) => {
    // 聚合所有可搜索内容字段
    const searchString = [
      post.title,
      post.content,
      post.tags?.join(' '),
      post.category
    ].join(' ').toLowerCase();

    // 确保每个关键词都能在内容中找到
    return searchTerms.every((term) => searchString.includes(term));
  });
}