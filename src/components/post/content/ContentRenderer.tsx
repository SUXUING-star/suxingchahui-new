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
    
    marked.setOptions({ renderer });

    const imageMap = new Map(contentImages.map(p => [p._id, p]));
    const downloadMap = new Map(downloads.map(d => [d._id, d]));
    
    // 正则切分自定义标签 [image:xxx] [download:xxx]
    const placeholderRegex = /\[(image|download):(.*?)\]/g;
    const nodes: { type: string; id?: string; content?: string }[] = [];
    let lastIndex = 0;
    const matches = Array.from(content.matchAll(placeholderRegex));
    
    for (const match of matches) {
      const [fullMatch, type, id] = match;
      const matchIndex = match.index!;
      if (matchIndex > lastIndex) {
        nodes.push({ type: 'text', content: content.substring(lastIndex, matchIndex) });
      }
      nodes.push({ type, id });
      lastIndex = matchIndex + fullMatch.length;
    }

    if (lastIndex < content.length) {
      nodes.push({ type: 'text', content: content.substring(lastIndex) });
    }

    // 渲染节点
    return nodes.map((node, index) => {
      const key = `node-${index}`;
      
      if (node.type === 'text') {
        return <div key={key} dangerouslySetInnerHTML={{ __html: marked.parse(node.content || '') as string }} />;
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