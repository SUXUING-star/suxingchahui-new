// src/components/common/ContentRenderer.jsx
import React from 'react';
import { marked } from 'marked';
import { Download, Lock, ExternalLink } from 'lucide-react';
import LazyImage from './LazyImage'; 

marked.setOptions({ breaks: true, gfm: true });

const ContentRenderer = ({ content, contentImages, downloads, isAuthenticated, onAuthRequired }) => {
  if (!content) return null;

  const imageMap = new Map((contentImages || []).map(p => [p._id, p]));
  const downloadMap = new Map((downloads || []).map(d => [d._id, d]));
  
  const placeholderRegex = /\[(image|download):(.*?)\]/g;
  const nodes = [];
  let lastIndex = 0;

  for (const match of content.matchAll(placeholderRegex)) {
    const [fullMatch, type, id] = match;
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      nodes.push({ type: 'text', content: content.substring(lastIndex, matchIndex) });
    }
    nodes.push({ type, id });
    lastIndex = matchIndex + fullMatch.length;
  }
  if (lastIndex < content.length) {
    nodes.push({ type: 'text', content: content.substring(lastIndex) });
  }

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {nodes.map((node, index) => {
        const key = `node-${index}`;
        
        if (node.type === 'text') {
          return <div key={key} dangerouslySetInnerHTML={{ __html: marked.parse(node.content) }} />;
        }

        if (node.type === 'image') {
          const img = imageMap.get(node.id);
          if (!img) return null;
          return (
            <figure key={key} className="my-8 not-prose flex flex-col items-center">
              <LazyImage 
                src={img.src} alt={img.alt} fullHeight={false}
                wrapperClassName="rounded-2xl shadow-xl border dark:border-gray-700 overflow-hidden max-w-full"
                className="max-h-[80vh] w-auto"
                objectFit="object-contain"
              />
              {img.alt && <figcaption className="mt-3 text-sm text-gray-500 italic">{img.alt}</figcaption>}
            </figure>
          );
        }

        if (node.type === 'download') {
          const dl = downloadMap.get(node.id);
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
                
                {/* 核心修正：直接使用 isAuthenticated 判断 */}
                {isAuthenticated ? (
                  <a
                    href={dl.url} // 后端保证已登录时 url 必定存在
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
      })}
    </div>
  );
};

export default ContentRenderer;