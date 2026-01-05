import { apiUploadPostImage } from './postUtils';
import { ContentBlock } from './mdParser';

interface UploadResult {
  id: number;
  url: string;
  resourceId: string;
}

/**
 * 处理图片块的排队上传
 * blocks 传入的是编辑器中的块，只有带有 file 对象的才需要上传
 */
export const processImageBlocks = async (
  blocks: (ContentBlock & { file?: File })[], 
  token: string
): Promise<UploadResult[]> => {
  const uploadPromises = blocks.map(async (block) => {
    // 只有类型为 image 且包含真实 File 对象的才上传
    if (block.type === 'image' && block.file) {
      const data = await apiUploadPostImage(block.file, token);
      return { 
        id: block.id, 
        url: data.url, 
        resourceId: (data as any).id // 对应后端返回的资源 ID
      };
    }
    return null;
  });

  const results = await Promise.all(uploadPromises);
  // 过滤掉 null，只保留上传成功的
  return results.filter((r): r is UploadResult => r !== null);
};