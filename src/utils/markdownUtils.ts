import { marked } from 'marked';

// --- 类型定义 ---
interface FrontMatter {
  title?: string;
  date?: string;
  tags?: string[];
  categories?: string[];
  photos?: string[];
  topped?: boolean;
  [key: string]: any;
}

interface ParsedMarkdown {
  title: string;
  date: string;
  tags: string[];
  categories: string[];
  category: string;
  photos: string[];
  content: string | Promise<string>;
  excerpt: string | Promise<string>;
  topped: boolean;
}

// 模拟之前 imageUtils 缺失的 getImagePath (通常用于本地开发环境图片拼接)
const getImagePath = (src: string, postId: string): string => {
  if (src.startsWith('http') || src.startsWith('/')) return src;
  return `/src/posts/${postId}/${src}`;
};

/**
 * 手动解析 Markdown 顶部的 YAML FrontMatter
 */
const parseFrontMatter = (content: string): { data: FrontMatter; content: string } => {
  try {
    const frontMatterRegex = /^---\s*([\s\S]*?)\s*---/;
    const match = frontMatterRegex.exec(content);

    if (!match) {
      return { data: {}, content };
    }

    const frontMatterBlock = match[1];
    const remainingContent = content.slice(match[0].length).trim();
    const data: FrontMatter = {};

    const lines = frontMatterBlock.split('\n');
    let currentKey: string | null = null;
    let currentArray: string[] = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (line.startsWith('- ')) {
        if (currentKey) {
          currentArray.push(line.slice(2).trim());
        }
        continue;
      }

      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        if (currentKey && currentArray.length > 0) {
          data[currentKey] = currentArray;
          currentArray = [];
        }

        currentKey = line.slice(0, colonIndex).trim();
        let value: any = line.slice(colonIndex + 1).trim();

        if (value.toLowerCase() === 'true') value = true;
        else if (value.toLowerCase() === 'false') value = false;

        if (value !== '') {
          data[currentKey] = value;
          currentKey = null;
        }
      }
    }

    if (currentKey && currentArray.length > 0) {
      data[currentKey] = currentArray;
    }

    return { data, content: remainingContent };
  } catch (error) {
    console.error('Error parsing frontmatter:', error);
    return { data: {}, content };
  }
};

/**
 * 提取文章摘要 (处理 <!--more--> 标记)
 */
const generateExcerpt = (content: string): string => {
  const moreSplit = content.split('<!--more-->');
  if (moreSplit.length > 1) {
    return moreSplit[0]
      .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
      .replace(/\[.*?\]\((.*?)\)/g, '$1') // 保留链接文字
      .replace(/#{1,6}\s+/g, '') // 移除标题
      .replace(/(`{1,3}).*?\1/g, '') // 移除代码
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return '';
};

/**
 * 处理 Markdown 中的图片路径
 */
const processImagePaths = (content: string, postId: string): string => {
  return content.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (match, alt, src) => {
      const processedSrc = getImagePath(src, postId);
      return `![${alt}](${processedSrc})`;
    }
  );
};

/**
 * 主解析函数：将原始 MD 文本转换为结构化数据
 */
export const parseMarkdownFile = (content: string, postId: string): ParsedMarkdown => {
  try {
    const { data, content: markdownContent } = parseFrontMatter(content);
    const processedContent = processImagePaths(markdownContent, postId);
    const excerptRaw = generateExcerpt(processedContent);

    const photos = Array.isArray(data.photos)
      ? data.photos.map(p => p.startsWith('/') ? p.slice(1) : p)
      : [];

    return {
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString().split('T')[0],
      tags: Array.isArray(data.tags) ? data.tags : [],
      categories: Array.isArray(data.categories) ? data.categories : [],
      category: Array.isArray(data.categories) ? data.categories[0] : '未分类',
      photos: photos,
      // 注意：新版 marked.parse 返回 string 或 Promise<string>
      content: marked.parse(processedContent) as string,
      excerpt: excerptRaw ? (marked.parse(excerptRaw) as string) : '',
      topped: !!data.topped
    };
  } catch (error) {
    console.error('Error parsing markdown file:', error);
    return {
      title: 'Error parsing markdown',
      content: '',
      excerpt: '',
      date: new Date().toISOString().split('T')[0],
      tags: [],
      categories: [],
      category: '未分类',
      photos: [],
      topped: false
    };
  }
};