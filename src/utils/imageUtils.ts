const R2_PUBLIC_URL: string = import.meta.env.VITE_R2_PUBLIC_URL || '';

export function toAbsoluteUrl(relativePath: string | null | undefined): string {
  if (!relativePath || relativePath.startsWith('http')) return relativePath || '';
  return new URL(relativePath, R2_PUBLIC_URL).toString();
}

export function processRawContent(rawHtml: string | null | undefined): string {
  if (!rawHtml || typeof window === 'undefined') return rawHtml || '';
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');
  
  // 1. 修复加密链接
  doc.querySelectorAll('a[href^="encrypted:"]').forEach(link => {
    const href = link.getAttribute('href')!;
    const encryptedData = href.replace('encrypted:', '');
    link.setAttribute('href', 'javascript:void(0)');
    link.setAttribute('class', 'encrypted-link text-blue-600');
    link.setAttribute('data-encrypted', encryptedData);
  });

  // 2. 转换图片
  doc.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (src) img.setAttribute('src', toAbsoluteUrl(src));
  });

  return doc.body.innerHTML;
}