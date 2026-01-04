// src/utils/imageUtils.js

const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

if (!R2_PUBLIC_URL) {
  console.error("FATAL: VITE_R2_PUBLIC_URL is not defined in your .env.local file!");
}

/**
 * 将相对路径转换为完整的 R2 绝对 URL。
 * 这是唯一需要保留的函数。
 * @param {string | null | undefined} relativePath
 * @returns {string}
 */
export function toAbsoluteUrl(relativePath) {
  if (!relativePath || relativePath.startsWith('http')) {
    return relativePath || '';
  }
  // 使用 URL 构造函数确保路径正确拼接，即使 R2_PUBLIC_URL 末尾有或没有斜杠
  return new URL(relativePath, R2_PUBLIC_URL).toString();
}

/**
 * 修复 HTML 字符串中错误的 "encrypted:" 链接。
 * @param {string} htmlContent - 从数据库来的、包含错误 <a href="encrypted:..."> 的 HTML
 * @returns {string} - 修复后的 HTML 字符串
 */
function fixEncryptedLinks(htmlContent) {
  if (typeof window === 'undefined' || !htmlContent) {
    return htmlContent || '';
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  // 精准查找所有 href 以 "encrypted:" 开头的 a 标签
  const links = doc.querySelectorAll('a[href^="encrypted:"]');

  links.forEach(link => {
    const href = link.getAttribute('href');
    const encryptedData = href.replace('encrypted:', '');
    
    // 修正 a 标签的属性
    link.setAttribute('href', 'javascript:void(0)'); // 阻止跳转
    link.setAttribute('class', 'encrypted-link text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'); // 加上 class
    link.setAttribute('data-encrypted', encryptedData); // 加上 data 属性
  });

  return doc.body.innerHTML;
}

/**
 * 完整处理从后端获取的 HTML 内容：
 * 1. 修复加密链接。
 * 2. 转换图片路径。
 * @param {string | null | undefined} rawHtml - 从 API 获取的原始 HTML 内容。
 * @returns {string} - 完全处理好的、可供渲染的 HTML 字符串。
 */
export function processRawContent(rawHtml) {
  if (!rawHtml) return '';
  
  // 先修复加密链接
  let fixedLinksHtml = fixEncryptedLinks(rawHtml);
  
  // 再处理图片路径
  // 注意：因为 DOMParser 会重新序列化，我们可以在一个函数里完成所有操作
  // 为清晰起见，这里分开调用，但可以合并以提高性能
  if (typeof window === 'undefined') {
    return fixedLinksHtml;
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixedLinksHtml, 'text/html');
  const images = doc.querySelectorAll('img');

  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src) {
      img.setAttribute('src', toAbsoluteUrl(src));
    }
  });

  return doc.body.innerHTML;
}