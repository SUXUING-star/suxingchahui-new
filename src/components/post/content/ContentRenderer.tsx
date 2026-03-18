import React, { useMemo } from 'react';
import { marked, Renderer } from 'marked';
import { Download, Lock, ExternalLink } from 'lucide-react';
import LazyImage from '../../common/LazyImage';
import { slugify } from '../../../utils/markdownUtils';

interface ContentRendererProps {
  content: string;
  contentImages?: any[];
  downloads?: any[];
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ 
  content, 
  contentImages = [], 
  downloads = [], 
  isAuthenticated, 
  onAuthRequired 
}) => {
  // useMemo 仅负责 HTML 生成，不再有副作用
  const htmlContent = useMemo(() => {
    if (!content) return [];

    const renderer = new Renderer();

    // 重写 heading 渲染，确保 ID 与 TOC 一致
    renderer.heading = (text, level) => {
      const id = slugify(text);
      return `<h${level} id="${id}">${text}</h${level}>`;
    };

    // 转义 HTML 防止代码里有尖括号被当成 HTML 标签
    const escapeHtml = (str: string) => {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    // 重写多行代码块渲染，避免内部的 # 被当成标题，并增加区分样式
    renderer.code = (code, language) => {
      const langClass = language ? ` class="language-${escapeHtml(language)}"` : '';
      return `<pre class="not-prose my-6 p-4 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-x-auto text-[13px] sm:text-sm leading-relaxed font-mono text-gray-800 dark:text-gray-200 shadow-sm whitespace-pre"><code${langClass}>${escapeHtml(code)}</code></pre>`;
    };

    // 重写行内代码渲染，增加带背景的小框样式并移除默认样式的丑陋反引号
    renderer.codespan = (code) => {
      return `<code class="px-1.5 py-0.5 mx-0.5 bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 rounded-md text-[0.85em] font-mono text-blue-600 dark:text-blue-400 break-words before:hidden after:hidden">${code}</code>`;
    };
    
    marked.setOptions({ renderer });

    const imageMap = new Map(contentImages.map(p => [p._id, p]));
    const downloadMap = new Map(downloads.map(d => [d._id, d]));
    
    // 保护 Markdown 代码块：提取代码段落替换为占位符，防止切分正则将包含 `#` 占位符的代码腰斩
    const codeBlocks: string[] = [];
    const codeBlockRegex = /(```[\s\S]*?```|`[^`]*`)/g;
    const safeContent = content.replace(codeBlockRegex, (match) => {
      codeBlocks.push(match);
      return `__MARKDOWN_CODE_${codeBlocks.length - 1}__`;
    });

    // 正则切分自定义标签 [image:xxx] [download:xxx]
    const placeholderRegex = /\[(image|download):(.*?)\]/g;
    const nodes: { type: string; id?: string; content?: string }[] = [];
    let lastIndex = 0;
    const matches = Array.from(safeContent.matchAll(placeholderRegex));
    
    for (const match of matches) {
      const [fullMatch, type, id] = match;
      const matchIndex = match.index!;
      if (matchIndex > lastIndex) {
        nodes.push({ type: 'text', content: safeContent.substring(lastIndex, matchIndex) });
      }
      nodes.push({ type, id });
      lastIndex = matchIndex + fullMatch.length;
    }

    if (lastIndex < safeContent.length) {
      nodes.push({ type: 'text', content: safeContent.substring(lastIndex) });
    }

    // 渲染节点
    return nodes.map((node, index) => {
      const key = `node-${index}`;
      
      if (node.type === 'text' && node.content) {
        // 恢复被保护的代码块占位符，执行解析
        const restoredContent = node.content.replace(/__MARKDOWN_CODE_(\d+)__/g, (_, idx) => {
          return codeBlocks[parseInt(idx, 10)] || '';
        });
        return <div key={key} dangerouslySetInnerHTML={{ __html: marked.parse(restoredContent) as string }} />;
      }

      if (node.type === 'image') {
        const img = imageMap.get(node.id!);
        if (!img) return null;
        return (
          <figure key={key} className="my-8 not-prose flex flex-col items-center">
            <LazyImage 
              src={img.src} alt={img.alt || ''} fullHeight={false}
              wrapperClassName="rounded-2xl shadow-xl border dark:border-gray-700 overflow-hidden max-w-full"
              className="max-h-[80vh] w-auto"
              objectFit="object-contain"
            />
            {img.alt && <figcaption className="mt-3 text-sm text-gray-500 italic">{img.alt}</figcaption>}
          </figure>
        );
      }

      if (node.type === 'download') {
        const dl = downloadMap.get(node.id!);
        if (!dl) return null;

        return (
          <div key={key} className="not-prose my-6">
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600">
                  <Download size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{dl.description}</p>
                  <p className="text-xs text-gray-500">资源文件已就绪</p>
                </div>
              </div>
              
              {isAuthenticated ? (
                <a
                  href={dl.url}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  <ExternalLink size={18} className="mr-2" /> 立即下载
                </a>
              ) : (
                <button
                  onClick={onAuthRequired}
                  className="flex items-center px-6 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                >
                  <Lock size={18} className="mr-2" /> 登录后可见
                </button>
              )}
            </div>
          </div>
        );
      }
      return null;
    });
  }, [content, contentImages, downloads, isAuthenticated, onAuthRequired]);

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {htmlContent}
    </div>
  );
};

export default ContentRenderer;