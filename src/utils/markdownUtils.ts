import { marked } from 'marked';

export interface Heading {
  id: string;
  level: number;
  text: string;
}

// 统一的 ID 生成算法
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // 允许中文、字母、数字、空格、横杠
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// 专门用于提取标题的纯函数，不涉及 DOM 操作
export const extractHeadings = (content: string): Heading[] => {
  const tokens = marked.lexer(content);
  const headings: Heading[] = [];

  marked.walkTokens(tokens, (token) => {
    if (token.type === 'heading') {
      headings.push({
        id: slugify(token.text),
        level: token.depth,
        text: token.text,
      });
    }
  });

  return headings;
};