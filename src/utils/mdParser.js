// src/utils/mdParser.js

export const parseMDToBlocks = (content, contentImages = [], downloads = []) => {
  if (!content) return [{ id: Date.now(), type: 'text', content: '' }];

  // 1. 强力分割：按自定义占位符和标题进行分割
  // 匹配：[image:xxx] 或 [download:xxx] 或 ### 标题
  const regex = /(\[image:.*?\]|\[download:.*?\]|### .*?\n)/g;
  const parts = content.split(regex).filter(p => p.trim() !== '');
  
  return parts.map((part, index) => {
    const id = Date.now() + index;
    const trimmed = part.trim();

    // A. 匹配小标题
    if (trimmed.startsWith('### ')) {
      return { id, type: 'heading', content: trimmed.replace('### ', '') };
    }

    // B. 匹配图片
    const imgMatch = trimmed.match(/^\[image:(.*?)\]$/);
    if (imgMatch) {
      const resId = imgMatch[1];
      const imgData = contentImages.find(i => i._id === resId);
      return { 
        id, type: 'image', 
        resourceId: resId, 
        content: imgData?.src || '', 
        previewUrl: imgData?.src || '',
        invalid: !imgData // 如果找不到资源，标记为无效
      };
    }

    // C. 匹配下载
    const dlMatch = trimmed.match(/^\[download:(.*?)\]$/);
    if (dlMatch) {
      const resId = dlMatch[1];
      const dlData = downloads.find(d => d._id === resId);
      return { 
        id, type: 'download', 
        resourceId: resId, 
        description: dlData?.description || '', 
        url: dlData?.url || '',
        invalid: !dlData 
      };
    }

    // D. 默认文本块
    return { id, type: 'text', content: trimmed };
  });
};