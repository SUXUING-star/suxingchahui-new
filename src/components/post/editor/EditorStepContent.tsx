import React, { useRef, useMemo } from 'react';
import { 
    Type, Heading as HeadingIcon, Image as ImageIcon, Link as LinkIcon, 
    Bold, Italic, Code, Quote 
} from 'lucide-react';

import EditorBlockWrapper from './EditorBlockWrapper';
import EditorTextArea from './EditorTextArea';
import EditorImageBlock from './EditorImageBlock';
import EditorDownloadBlock from './EditorDownloadBlock';
import ContentRenderer from '../content/ContentRenderer'; 
import { Block, BlockType } from './WriteModal';

interface EditorStepContentProps {
    mode: 'edit' | 'preview';
    title: string;
    blocks: Block[];
    insertBlock: (index: number, type: BlockType) => void;
    moveBlock: (index: number, direction: 'up' | 'down') => void;
    updateBlock: (id: number, field: keyof Block, value: any) => void;
    removeBlock: (id: number) => void;
    handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>, blockId: number) => void;
}

const EditorStepContent: React.FC<EditorStepContentProps> = ({
    mode, title, blocks, insertBlock, moveBlock, updateBlock, removeBlock, handleImageSelect
}) => {
    // 保存所有 textarea 的 ref，以便操作光标
    const textRefs = useRef<{ [key: number]: HTMLTextAreaElement | null }>({});

    // --- 文本格式化快捷功能 ---
    const handleFormat = (blockId: number, prefix: string, suffix: string) => {
        const textarea = textRefs.current[blockId];
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentContent = blocks.find(b => b.id === blockId)?.content || '';

        const selectedText = currentContent.substring(start, end);
        const beforeText = currentContent.substring(0, start);
        const afterText = currentContent.substring(end);

        const newContent = `${beforeText}${prefix}${selectedText || '文本'}${suffix}${afterText}`;
        updateBlock(blockId, 'content', newContent);

        // 异步还原光标位置，选中添加的文本
        setTimeout(() => {
            textarea.focus();
            const newStart = start + prefix.length;
            const newEnd = newStart + (selectedText ? selectedText.length : 2);
            textarea.setSelectionRange(newStart, newEnd);
        }, 0);
    };

    // --- 为 ContentRenderer 组装伪装数据 (Preview模式) ---
    const { previewMarkdown, mockImages, mockDownloads } = useMemo(() => {
        if (mode !== 'preview') return { previewMarkdown: '', mockImages: [], mockDownloads: [] };

        const mdString = blocks.map((b) => {
            if (b.type === 'heading' && b.content) return `### ${b.content}`;
            if (b.type === 'image' && b.previewUrl) return `[image:${b.id}]`;
            
            // 兼容可能映射错误的字段
            const dlUrl = b.url || (b as any).link || (b as any).href || (b as any).download?.url;
            if (b.type === 'download' && dlUrl) return `[download:${b.id}]`;
            
            if (b.type === 'text') return b.content;
            return '';
        }).join('\n\n');

        const imgs = blocks.filter(b => b.type === 'image' && b.previewUrl).map(b => ({
            _id: String(b.id),
            src: b.previewUrl,
            alt: '预览插图'
        }));

        const dls = blocks.filter(b => b.type === 'download' && (b.url || (b as any).link || (b as any).href || (b as any).download?.url)).map(b => ({
            _id: String(b.id),
            // 全方位回显兼容
            description: b.description || b.content || (b as any).title || (b as any).download?.description || '未命名资源',
            url: b.url || (b as any).link || (b as any).href || (b as any).download?.url || ''
        }));

        return { previewMarkdown: mdString, mockImages: imgs, mockDownloads: dls };
    }, [blocks, mode]);

    if (mode === 'preview') {
        return (
            <div className="pb-20">
                <h1 className="text-3xl font-black mb-8 pb-4 border-b border-gray-100 dark:border-gray-800 dark:text-white">
                    {title || '未命名文章'}
                </h1>
                {/* 完美复用实际渲染组件 */}
                <ContentRenderer
                    content={previewMarkdown}
                    contentImages={mockImages}
                    downloads={mockDownloads}
                    isAuthenticated={true} // 预览模式假设已登录
                    onAuthRequired={() => {}}
                />
            </div>
        );
    }

    // Edit 模式
    return (
        <div className="space-y-2 pb-20">
            {blocks.map((block, index) => (
                <React.Fragment key={block.id}>
                    <EditorBlockWrapper 
                        isFirst={index === 0} 
                        isLast={index === blocks.length - 1} 
                        isInvalid={block.invalid} 
                        onMoveUp={() => moveBlock(index, 'up')} 
                        onMoveDown={() => moveBlock(index, 'down')} 
                        onRemove={() => removeBlock(block.id)}
                    >
                        {block.type === 'heading' && (
                            <EditorTextArea
                                placeholder="小标题"
                                value={block.content}
                                onChange={(v: string) => updateBlock(block.id, 'content', v)}
                                className="text-xl font-bold text-blue-600 border-l-4 border-blue-600 pl-4 py-2"
                            />
                        )}
                        
                        {block.type === 'text' && (
                            <div className="flex flex-col">
                                {/* MD 快捷格式化工具栏 */}
                                <div className="flex items-center gap-1 mb-2 opacity-30 hover:opacity-100 focus-within:opacity-100 transition-opacity bg-gray-50 dark:bg-gray-800/80 p-1 rounded-lg w-max border border-gray-100 dark:border-gray-700">
                                    <button onClick={() => handleFormat(block.id, '**', '**')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all" title="粗体"><Bold size={14} /></button>
                                    <button onClick={() => handleFormat(block.id, '*', '*')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all" title="斜体"><Italic size={14} /></button>
                                    <button onClick={() => handleFormat(block.id, '`', '`')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all" title="行内代码"><Code size={14} /></button>
                                    <button onClick={() => handleFormat(block.id, '> ', '')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all" title="引用"><Quote size={14} /></button>
                                </div>
                                <EditorTextArea 
                                    ref={(el) => textRefs.current[block.id] = el}
                                    placeholder="正文内容..." 
                                    value={block.content} 
                                    onChange={(v: string) => updateBlock(block.id, 'content', v)} 
                                    className="text-base leading-relaxed text-gray-700 dark:text-gray-300 min-h-[40px]" 
                                />
                            </div>
                        )}
                        
                        {block.type === 'image' && (
                            <EditorImageBlock 
                                previewUrl={block.previewUrl || block.url || block.content || ''} 
                                onSelect={(e) => handleImageSelect(e, block.id)} 
                                onRemove={() => updateBlock(block.id, 'previewUrl', '')} 
                            />
                        )}
                        
                        {block.type === 'download' && (() => {
                            // 疯狂回显策略：即使解析器把描述解析成了content，或者把url解析成了link/href，也能正确提取
                            const desc = block.description || block.content || (block as any).title || (block as any).download?.description || '';
                            const linkUrl = block.url || (block as any).link || (block as any).href || (block as any).download?.url || '';

                            return (
                                <EditorDownloadBlock 
                                    description={desc} 
                                    url={linkUrl} 
                                    onUpdate={(f, v) => {
                                        // 正常更新目标字段
                                        updateBlock(block.id, f, v);
                                        // 补丁：如果你原本的解析逻辑只认识 content，更新时双向同步给 content 以防万一
                                        if (f === 'description') {
                                            updateBlock(block.id, 'content', v);
                                        }
                                    }} 
                                />
                            );
                        })()}
                    </EditorBlockWrapper>

                    {/* 块间插入工具栏 */}
                    <div className="relative h-8 group/ins flex items-center justify-center my-1">
                        <div className="w-full h-[1px] bg-gray-100 dark:bg-white/5 group-hover/ins:bg-blue-500/30 transition-all" />
                        <div className="absolute flex gap-2 opacity-0 group-hover/ins:opacity-100 transition-all scale-90 group-hover/ins:scale-100 bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 rounded-full p-1">
                            <button onClick={() => insertBlock(index, 'text')} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-500 hover:text-blue-500 rounded-full transition-all" title="文本"><Type size={16} /></button>
                            <button onClick={() => insertBlock(index, 'heading')} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-500 hover:text-blue-500 rounded-full transition-all" title="标题"><HeadingIcon size={16} /></button>
                            <button onClick={() => insertBlock(index, 'image')} className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-gray-500 hover:text-emerald-500 rounded-full transition-all" title="图片"><ImageIcon size={16} /></button>
                            <button onClick={() => insertBlock(index, 'download')} className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-gray-500 hover:text-amber-500 rounded-full transition-all" title="资源"><LinkIcon size={16} /></button>
                        </div>
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};

export default EditorStepContent;