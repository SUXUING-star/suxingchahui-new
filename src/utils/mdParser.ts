// src/utils/mdParser.ts

export interface ContentBlock {
  id: number;
  type: 'text' | 'heading' | 'image' | 'download';
  content?: string; // 用于 text 和 heading
  resourceId?: string; // 用于 image 和 download
  previewUrl?: string; // 用于 image
  description?: string; // 用于 download
  url?: string; // 用于 download
  invalid?: boolean;
}

/**
 * 核心修正：使用与 ContentRenderer 完全相同的逻辑来解析 Markdown
 */
export const parseMDToBlocks = (
  content: string = '',
  contentImages: any[] = [],
  downloads: any[] = []
): ContentBlock[] => {
  if (!content.trim() && contentImages.length === 0 && downloads.length === 0) {
      return [{ id: Date.now(), type: 'text', content: '' }];
  }

  const imageMap = new Map(contentImages.map(p => [p._id, p]));
  const downloadMap = new Map(downloads.map(d => [d._id, d]));

  const placeholderRegex = /\[(image|download):(.*?)\]/g;
  const blocks: ContentBlock[] = [];
  let lastIndex = 0;
  let blockIdCounter = Date.now();

  const matches = Array.from(content.matchAll(placeholderRegex));

  for (const match of matches) {
    const [fullMatch, type, id] = match;
    const matchIndex = match.index!;

    // 1. 处理占位符前的文本
    if (matchIndex > lastIndex) {
      const textContent = content.substring(lastIndex, matchIndex);
      // 进一步切分标题和普通文本
      const textParts = textContent.split(/(### .*?\n)/g).filter(p => p.trim());
      textParts.forEach(part => {
        if (part.trim().startsWith('### ')) {
          blocks.push({ id: blockIdCounter++, type: 'heading', content: part.trim().replace('### ', '') });
        } else {
          blocks.push({ id: blockIdCounter++, type: 'text', content: part.trim() });
        }
      });
    }

    // 2. 处理占位符本身
    if (type === 'image') {
      const imgData = imageMap.get(id);
      blocks.push({
        id: blockIdCounter++,
        type: 'image',
        resourceId: id,
        previewUrl: imgData?.src, // 妈的，之前这里写错了
        invalid: !imgData,
      });
    } else if (type === 'download') {
      const dlData = downloadMap.get(id);
      blocks.push({
        id: blockIdCounter++,
        type: 'download',
        resourceId: id,
        description: dlData?.description, // 妈的，之前这里没赋值
        url: dlData?.url,               // 妈的，这里也没赋值
        invalid: !dlData,
      });
    }
    lastIndex = matchIndex + fullMatch.length;
  }

  // 3. 处理最后一个占位符之后的文本
  if (lastIndex < content.length) {
    const textContent = content.substring(lastIndex);
    const textParts = textContent.split(/(### .*?\n)/g).filter(p => p.trim());
    textParts.forEach(part => {
        if (part.trim().startsWith('### ')) {
          blocks.push({ id: blockIdCounter++, type: 'heading', content: part.trim().replace('### ', '') });
        } else {
          blocks.push({ id: blockIdCounter++, type: 'text', content: part.trim() });
        }
    });
  }

  // 如果解析后为空，返回一个默认文本块
  return blocks.length > 0 ? blocks : [{ id: Date.now(), type: 'text', content: '' }];
};