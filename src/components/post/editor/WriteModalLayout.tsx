import React, { useEffect, useRef } from 'react';
import {
    X, Send, Loader2, Type,
    Image as ImageIcon, Trash2, ChevronUp,
    ChevronDown, Link as LinkIcon, Heading as HeadingIcon, Eye, Edit3, Check
} from 'lucide-react';
import anime from 'animejs';

import EditorTextArea from './EditorTextArea';
import EditorImageBlock from './EditorImageBlock';
import EditorDownloadBlock from './EditorDownloadBlock';
import EditorCover from './EditorCover';
import EditorBlockWrapper from './EditorBlockWrapper';
import ConfirmModal from '../../common/ConfirmModal';
import { Block, BlockType } from './WriteModal';

interface WriteModalLayoutProps {
    onClose: () => void;
    editSlug?: string | null;
    step: number;
    setStep: React.Dispatch<React.SetStateAction<number>>;
    mode: 'edit' | 'preview';
    setMode: React.Dispatch<React.SetStateAction<'edit' | 'preview'>>;
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    category: string;
    setCategory: React.Dispatch<React.SetStateAction<string>>;
    tags: string[];
    setTags: React.Dispatch<React.SetStateAction<string[]>>;
    cover: { file: File | null; preview: string };
    setCover: React.Dispatch<React.SetStateAction<{ file: File | null; preview: string }>>;
    blocks: Block[];
    allCategories: string[];
    isSubmitting: boolean;
    isLoadingData: boolean;
    isSelectOpen: boolean;
    setIsSelectOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isDeleteConfirmOpen: boolean;
    setIsDeleteConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isMetaDone: boolean;
    isCoverDone: boolean;
    isContentDone: boolean;
    insertBlock: (index: number, type: BlockType) => void;
    moveBlock: (index: number, direction: 'up' | 'down') => void;
    updateBlock: (id: number, field: keyof Block, value: any) => void;
    removeBlock: (id: number) => void;
    handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>, blockId: number) => void;
    handleCoverSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleNewCategoryKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleFinalPublish: () => void;
    handleDeletePost: () => void;
}

const WriteModalLayout: React.FC<WriteModalLayoutProps> = ({
    onClose,
    editSlug,
    step, setStep,
    mode, setMode,
    title, setTitle,
    category, setCategory,
    tags, setTags,
    cover, setCover,
    blocks,
    allCategories,
    isSubmitting, isLoadingData,
    isSelectOpen, setIsSelectOpen,
    isDeleteConfirmOpen, setIsDeleteConfirmOpen,
    isMetaDone, isCoverDone, isContentDone,
    insertBlock, moveBlock, updateBlock, removeBlock,
    handleImageSelect, handleCoverSelect,
    handleTagKeyDown, handleNewCategoryKeyDown,
    handleFinalPublish, handleDeletePost
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // 进场动画
    useEffect(() => {
        anime({
            targets: modalRef.current,
            opacity: [0, 1],
            scale: [0.95, 1],
            duration: 600,
            easing: 'easeOutExpo'
        });
    }, []);

    // 退出动画并关闭
    const handleClose = () => {
        anime({
            targets: modalRef.current,
            opacity: [1, 0],
            scale: [1, 0.95],
            duration: 400,
            easing: 'easeInExpo',
            complete: () => {
                onClose();
            }
        });
    };

    const steps = [
        { id: 1, title: '核心元数据', isDone: isMetaDone },
        { id: 2, title: '视觉封面', isDone: isCoverDone },
        { id: 3, title: '内容创作', isDone: isContentDone },
    ];

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 overflow-hidden">
            {/* 点击背景也要触发退出动画 */}
            <div className="absolute inset-0 bg-white/10 dark:bg-black/40 backdrop-blur-[50px]" onClick={handleClose} />

            <div 
                ref={modalRef}
                className="modal-canvas relative w-full max-w-6xl h-full max-h-[95vh] flex flex-col bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl rounded-[32px] shadow-2xl border border-white/40 dark:border-white/5 overflow-hidden opacity-0"
            >

                {isLoadingData ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                        <Loader2 className="animate-spin text-blue-600" size={48} />
                        <p className="font-bold text-gray-400 text-xs tracking-[0.4em] uppercase">载入数据...</p>
                    </div>
                ) : (
                    <>
                        {/* 顶部导航：减少了 padding (py-4) */}
                        <div className="px-8 py-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-white/50 dark:bg-black/20 flex-shrink-0">
                            <div className="flex items-center space-x-4">
                                {steps.map(s => (
                                    <button 
                                        key={s.id}
                                        onClick={() => setStep(s.id)}
                                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all ${step === s.id ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all ${
                                            s.isDone ? 'bg-green-500 text-white' : (step === s.id ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500')
                                        }`}>
                                            {s.isDone && step !== s.id ? <Check size={14} strokeWidth={3} /> : s.id}
                                        </div>
                                        <span className={`font-bold text-xs ${step === s.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>{s.title}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center space-x-3">
                                {editSlug && (
                                    <button 
                                        onClick={() => setIsDeleteConfirmOpen(true)}
                                        className="flex items-center px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 font-bold text-xs hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <Trash2 size={14} className="mr-2" /> 抹除
                                    </button>
                                )}
                                <button onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')} className="flex items-center px-4 py-2 rounded-xl bg-white dark:bg-gray-800 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 shadow-sm">
                                    {mode === 'edit' ? <><Eye size={14} className="mr-2 text-blue-500" /> 预览</> : <><Edit3 size={14} className="mr-2 text-green-500" /> 编辑</>}
                                </button>
                                <button onClick={handleClose} className="p-2 bg-gray-100 dark:bg-white/10 text-gray-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><X size={20} /></button>
                            </div>
                        </div>

                        {/* 主内容区域：移除 EditorCloud，直接渲染，减少 padding */}
                        <div className="flex-1 overflow-y-auto px-8 sm:px-16 py-8 custom-scrollbar relative">
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
                                
                                {step === 1 && (
                                    <div className="space-y-8">
                                        {/* 标题输入：缩小字体 text-3xl */}
                                        <EditorTextArea
                                            value={title}
                                            onChange={(v: string) => setTitle(v)}
                                            placeholder="输入文章标题..."
                                            className="text-3xl font-bold dark:text-white placeholder-gray-300 dark:placeholder-gray-700 leading-tight bg-transparent"
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="relative z-20">
                                                <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2 block ml-1">文章分类</label>
                                                <button onClick={() => setIsSelectOpen(!isSelectOpen)} className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl font-bold dark:text-white border border-gray-100 dark:border-gray-700 hover:border-blue-400 transition-colors">
                                                    <span>{category || "选择分类"}</span>
                                                    <ChevronDown size={20} className={isSelectOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                                                </button>
                                                {isSelectOpen && (
                                                    <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95">
                                                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                            {allCategories.map(c => <button key={c} onClick={() => { setCategory(c); setIsSelectOpen(false); }} className="w-full p-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-left font-bold text-sm dark:text-gray-200">{c}</button>)}
                                                        </div>
                                                        <div className="p-2 border-t border-gray-100 dark:border-white/5">
                                                            <input 
                                                                placeholder="输入新分类回车..." 
                                                                className="w-full p-2 bg-gray-50 dark:bg-gray-900 rounded-lg outline-none dark:text-white font-bold text-xs" 
                                                                onKeyDown={handleNewCategoryKeyDown} 
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2 block ml-1">文章标签</label>
                                                <input 
                                                    className="w-full bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl font-bold dark:text-white outline-none border border-gray-100 dark:border-gray-700 focus:border-emerald-400 transition-colors" 
                                                    placeholder="输入标签按回车" 
                                                    onKeyDown={handleTagKeyDown} 
                                                />
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {tags.map(t => <span key={t} className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold">#{t}</span>)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="max-w-2xl mx-auto">
                                        <EditorCover 
                                            preview={cover.preview} 
                                            onSelect={handleCoverSelect} 
                                            onRemove={() => setCover({ file: null, preview: '' })} 
                                        />
                                    </div>
                                )}

                                {step === 3 && (
                                    mode === 'edit' ? (
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
                                                                // 修正字体大小：text-xl
                                                                className="text-xl font-bold text-blue-600 border-l-4 border-blue-600 pl-4 py-2"
                                                            />
                                                        )}
                                                        {block.type === 'text' && (
                                                            <EditorTextArea 
                                                                placeholder="正文内容..." 
                                                                value={block.content} 
                                                                onChange={(v: string) => updateBlock(block.id, 'content', v)} 
                                                                // 修正字体大小：text-base
                                                                className="text-base leading-relaxed text-gray-700 dark:text-gray-300" 
                                                            />
                                                        )}
                                                        {block.type === 'image' && (
                                                            <EditorImageBlock 
                                                                previewUrl={block.previewUrl} 
                                                                onSelect={(e) => handleImageSelect(e, block.id)} 
                                                                onRemove={() => updateBlock(block.id, 'previewUrl', '')} 
                                                            />
                                                        )}
                                                        {block.type === 'download' && (
                                                            <EditorDownloadBlock 
                                                                description={block.description || ''} 
                                                                url={block.url || ''} 
                                                                onUpdate={(f, v) => updateBlock(block.id, f, v)} 
                                                            />
                                                        )}
                                                    </EditorBlockWrapper>

                                                    {/* 插入按钮条：更加紧凑 */}
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
                                    ) : (
                                        // 预览模式：字体调整正常
                                        <div className="prose prose-lg dark:prose-invert max-w-none pb-20">
                                            {/* 预览标题：缩小到 text-3xl */}
                                            <h1 className="text-3xl font-black mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">{title}</h1>
                                            {blocks.map((b, idx) => {
                                                const currentImgIdx = blocks.filter((item, i) => i <= idx && item.type === 'image').length;
                                                const currentDlIdx = blocks.filter((item, i) => i <= idx && item.type === 'download').length;

                                                return (
                                                    <div key={b.id} className="mb-6">
                                                        {/* 预览子标题：text-xl */}
                                                        {b.type === 'heading' && b.content && <h3 className="text-xl font-bold mt-8 mb-4">{b.content}</h3>}
                                                        {/* 预览文本：text-base */}
                                                        {b.type === 'text' && b.content && <p className="text-base leading-7 text-gray-600 dark:text-gray-300">{b.content}</p>}
                                                        {b.type === 'image' && b.previewUrl && (
                                                            <figure className="flex flex-col items-center my-6">
                                                                <img src={b.previewUrl} className="rounded-xl shadow-lg max-h-[500px] object-contain bg-gray-50 dark:bg-black/20" alt={`插图 ${currentImgIdx}`} />
                                                                <figcaption className="mt-2 text-xs text-gray-400">图 {currentImgIdx}</figcaption>
                                                            </figure>
                                                        )}
                                                        {b.type === 'download' && b.url && (
                                                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 my-4 not-prose flex items-start gap-3">
                                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg shrink-0">
                                                                    <LinkIcon size={18} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">资源 {currentDlIdx}：{b.description || '未命名资源'}</p>
                                                                    <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline break-all mt-1 block">
                                                                        {b.url}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* 底部导航：减少了 padding (py-6) */}
                        <div className="px-8 py-6 bg-white/80 dark:bg-black/40 border-t border-gray-100 dark:border-white/5 flex items-center justify-between flex-shrink-0 backdrop-blur-md">
                            <button onClick={() => setStep(prev => Math.max(1, prev - 1))} disabled={step === 1} className="flex items-center gap-2 font-bold text-gray-400 hover:text-blue-500 text-xs disabled:opacity-0 transition-all"><ChevronUp size={20} /> <span>上一步</span></button>
                            <div className="flex gap-3">{[1, 2, 3].map(i => (<div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'bg-blue-600 w-8' : 'bg-gray-200 dark:bg-gray-700 w-2'}`} />))}</div>
                            {step < 3 ? (
                                <button onClick={() => setStep(prev => Math.min(3, prev + 1))} className="flex items-center gap-2 font-bold text-gray-400 hover:text-blue-500 text-xs transition-all"><span>下一步</span> <ChevronDown size={20} /></button>
                            ) : (
                                <button onClick={handleFinalPublish} disabled={isSubmitting} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center disabled:opacity-50 disabled:hover:scale-100">
                                    {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Send className="mr-2" size={18} />} {editSlug ? '保存更改' : '发布文章'}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDeletePost}
                title="确认删除"
                message={`文章《${title}》将被删除且无法恢复。`}
                confirmText="彻底删除"
                type="danger"
            />
        </div>
    );
};

export default WriteModalLayout;