export interface ContentBlock {
  id: number;
  type: 'text' | 'heading' | 'image' | 'download';
  content?: string;
  resourceId?: string;
  previewUrl?: string;
  description?: string;
  url?: string;
  invalid?: boolean;
}

export const parseMDToBlocks = (
  content: string, 
  contentImages: any[] = [], 
  downloads: any[] = []
): ContentBlock[] => {
  if (!content) return [{ id: Date.now(), type: 'text', content: '' }];

  const regex = /(\[image:.*?\]|\[download:.*?\]|### .*?\n)/g;
  const parts = content.split(regex).filter(p => p.trim() !== '');
  
  return parts.map((part, index) => {
    const id = Date.now() + index;
    const trimmed = part.trim();

    if (trimmed.startsWith('### ')) {
      return { id, type: 'heading', content: trimmed.replace('### ', '') };
    }

    const imgMatch = trimmed.match(/^\[image:(.*?)\]$/);
    if (imgMatch) {
      const resId = imgMatch[1];
      const imgData = contentImages.find(i => i._id === resId);
      return { id, type: 'image', resourceId: resId, content: imgData?.src, previewUrl: imgData?.src, invalid: !imgData };
    }

    const dlMatch = trimmed.match(/^\[download:(.*?)\]$/);
    if (dlMatch) {
      const resId = dlMatch[1];
      const dlData = downloads.find(d => d._id === resId);
      return { id, type: 'download', resourceId: resId, description: dlData?.description, url: dlData?.url, invalid: !dlData };
    }

    return { id, type: 'text', content: trimmed };
  });
};