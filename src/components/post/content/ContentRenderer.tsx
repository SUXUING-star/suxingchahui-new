
import React, { useMemo } from 'react';
import { marked, Renderer } from 'marked';
import { Download, Lock, ExternalLink } from 'lucide-react';
import LazyImage from '../../common/LazyImage';
import { slugify } from '../../../utils/markdownUtils';
import DownloadBlock from './DownloadBlock';

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
  const htmlContent = useMemo(() => {
    if (!content) return [];

    // 【核心补丁 1】：自动将带换行的单反引号（`）升级为三反引号（```）代码块
    // 匹配前面不是反引号，且内部包含 \n 换行的单反引号对
    let fixedContent = content.replace(/(^|[^`\\])`([^`]*?\n[^`]*?)`/g, '$1```\n$2\n```');

    const renderer = new Renderer();

    renderer.heading = (text, level) => {
      const id = slugify(text);
      return `<h${level} id="${id}">${text}</h${level}>`;
    };

    const escapeHtml = (str: string) => {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    // 重写多行代码块，增加滚动条和好看的背景
    renderer.code = (code, language) => {
      const langClass = language ? ` class="language-${escapeHtml(language)}"` : '';
      return `<pre class="not-prose my-6 p-4 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-x-auto text-[13px] sm:text-sm leading-relaxed font-mono text-gray-800 dark:text-gray-200 shadow-sm whitespace-pre"><code${langClass}>${escapeHtml(code)}</code></pre>`;
    };

    // 行内代码，加上 whitespace-pre-wrap 兜底，防止意外的换行错乱
    renderer.codespan = (code) => {
      return `<code class="px-1.5 py-0.5 mx-0.5 bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 rounded-md text-[0.85em] font-mono text-blue-600 dark:text-blue-400 break-words whitespace-pre-wrap before:hidden after:hidden">${code}</code>`;
    };

    marked.setOptions({ renderer });

    const imageMap = new Map(contentImages.map(p => [p._id, p]));
    const downloadMap = new Map(downloads.map(d => [d._id, d]));

    // 【核心补丁 2】：保护代码块里的内容不被正则切碎
    const codeBlocks: string[] = [];
    // 现在 fixedContent 里的多行单反引号已经变成 ``` 了，安全提取
    const codeBlockRegex = /(```[\s\S]*?```|`[^`]*`)/g;
    const safeContent = fixedContent.replace(codeBlockRegex, (match) => {
      codeBlocks.push(match);
      return `__MARKDOWN_CODE_${codeBlocks.length - 1}__`;
    });

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

    return nodes.map((node, index) => {
      const key = `node-${index}`;

      if (node.type === 'text' && node.content) {
        // 恢复代码块
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
          <DownloadBlock
            key={key}
            description={dl.description}
            url={dl.url}
            isAuthenticated={isAuthenticated}
            onAuthRequired={onAuthRequired}
          />
        );
      }
    });
  }, [content, contentImages, downloads, isAuthenticated, onAuthRequired]);

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {htmlContent}
    </div>
  );
};

export default ContentRenderer;
