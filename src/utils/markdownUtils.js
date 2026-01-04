import { marked } from 'marked';
import { getImagePath } from './imageUtils';
// 优化 marked 配置
marked.setOptions({
  headerIds: false, // 禁用不需要的功能
  mangle: false,
  smartypants: false // 禁用智能标点
});


const parseFrontMatter = (content) => {
    try {
      const frontMatterRegex = /^---\s*([\s\S]*?)\s*---/;
      const match = frontMatterRegex.exec(content);
      
      if (!match) {
        return {
          data: {},
          content: content
        };
      }
  
      const frontMatter = match[1];
      const remainingContent = content.slice(match[0].length).trim();
      const data = {};
  
      // 分行处理
      const lines = frontMatter.split('\n');
      let currentKey = null;
      let currentArray = [];
  
      for (let line of lines) {
        line = line.trim();
        if (!line) continue;
  
        // 如果是数组项
        if (line.startsWith('- ')) {
          if (currentKey) {
            currentArray.push(line.slice(2).trim());
          }
          continue;
        }
  
        // 如果是新的键值对
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
          // 保存之前的数组（如果有）
          if (currentKey && currentArray.length > 0) {
            data[currentKey] = currentArray;
            currentArray = [];
          }
  
          currentKey = line.slice(0, colonIndex).trim();
          let value = line.slice(colonIndex + 1).trim();
          
          // 处理布尔值
          if (value.toLowerCase() === 'true') {
            value = true;
          } else if (value.toLowerCase() === 'false') {
            value = false;
          }
          
          // 如果值不为空且不是数组开始，直接保存
          if (value !== '') {
            data[currentKey] = value;
            currentKey = null;
          }
        }
      }
  
      // 处理最后一个数组（如果有）
      if (currentKey && currentArray.length > 0) {
        data[currentKey] = currentArray;
      }
  
      return { data, content: remainingContent };
    } catch (error) {
      console.error('Error parsing frontmatter:', error);
      return { data: {}, content };
    }
};
  
const processImagePaths = (content, postId) => {
  return content.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (match, alt, src) => {
      const processedSrc = getImagePath(src, postId);
      return `![${alt}](${processedSrc})`;
    }
  );
};
  
export const parseMarkdownFile = (content, postId) => {
  try {
    const { data, content: markdownContent } = parseFrontMatter(content);
    const processedContent = processImagePaths(markdownContent, postId);
    const excerpt = generateExcerpt(processedContent);

    // 处理 photos 路径
    const photos = Array.isArray(data.photos) 
      ? data.photos.map(photo => {
          if (photo.startsWith('/')) {
            // 如果是绝对路径，移除开头的斜杠
            return photo.slice(1);
          }
          return photo;
        })
      : [];

    return {
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString().split('T')[0],
      tags: Array.isArray(data.tags) ? data.tags : [],
      categories: Array.isArray(data.categories) ? data.categories : [],
      category: Array.isArray(data.categories) ? data.categories[0] : 'Uncategorized',
      photos: photos,
      content: marked(processedContent),
      excerpt: excerpt ? marked(excerpt) : '',
      topped: Boolean(data.topped) // 将 topped 转换为布尔值，undefined/null 会变成 false
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
      topped: false // 错误情况下默认为 false
    };
  }
};

const generateExcerpt = (content) => {
  // 检查是否有 <!--more--> 标记
  const moreSplit = content.split('<!--more-->');
  
  if (moreSplit.length > 1) {
    // 如果有 <!--more--> 标记，只取第一部分
    const excerptContent = moreSplit[0];
    
    // 清理 Markdown 语法
    return excerptContent
      .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
      .replace(/\[.*?\]\((.*?)\)/g, '$1') // 保留链接文字
      .replace(/#{1,6}\s+/g, '') // 移除标题标记
      .replace(/(`{1,3}).*?\1/g, '') // 移除代码块
      .replace(/\n/g, ' ') // 替换换行为空格
      .replace(/\s+/g, ' ') // 替换多个空格为单个空格
      .trim();
  }
  
  // 如果没有 <!--more--> 标记，返回空字符串
  return '';
};