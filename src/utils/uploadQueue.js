import { apiUploadPostImage } from './postUtils';

/**
 * 处理图片块的排队上传
 */
export const processImageBlocks = async (blocks, token) => {
  const uploadPromises = blocks.map(async (block) => {
    if (block.type === 'image' && block.file) {
      // 只有带 File 对象的才需要上传
      const data = await apiUploadPostImage(block.file, token);
      return { 
        id: block.id, 
        url: data.url, 
        resourceId: data.id // 后端吐回的 id
      };
    }
    return null;
  });

  const results = await Promise.all(uploadPromises);
  return results.filter(r => r !== null);
};