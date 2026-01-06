import React, { ChangeEvent } from 'react';
import {
    X, Send, Loader2, Type,
    Image as ImageIcon, Trash2, ChevronUp,
    ChevronDown, Link as LinkIcon, Heading as HeadingIcon, Eye, Edit3
} from 'lucide-react';

import { useWriteModal, Block } from './useWriteModal';
import EditorTextArea from './EditorTextArea';
import EditorImageBlock from './EditorImageBlock';
import EditorDownloadBlock from './EditorDownloadBlock';
import EditorCover from './EditorCover';
import EditorCloud from './EditorCloud';
import EditorBlockWrapper from './EditorBlockWrapper';

interface WriteModalProps {
    isOpen: boolean;
    onClose: () => void;
    editSlug?: string | null;
}

const WriteModal: React.FC<WriteModalProps> = ({ isOpen, onClose, editSlug = null }) => {
    const {
        step, setStep,
        mode, setMode,
        title, setTitle,
        category, setCategory,
        tags,
        cover, setCover,
        blocks,
        allCategories,
        isSubmitting, isLoadingData,
        isSelectOpen, setIsSelectOpen,
        isMetaDone, isCoverDone, isContentDone,
        insertBlock, moveBlock, updateBlock, removeBlock,
        handleImageSelect, handleTagKeyDown, handleNewCategoryKeyDown, handleFinalPublish
    } = useWriteModal({ isOpen, editSlug, onClose });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute inset-0 bg-white/10 dark:bg-black/40 backdrop-blur-[100px]" onClick={onClose} />
            <div className="modal-canvas relative w-full max-w-6xl h-full flex flex-col bg-white/90 dark:bg-gray-900/95 backdrop-blur-3xl rounded-[64px] shadow-[0_60px_150px_rgba(0,0,0,0.5)] border border-white/40 dark:border-white/5 overflow-hidden opacity-0">
                {isLoadingData ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                        <Loader2 className="animate-spin text-blue-600" size={64} />
                        <p className="font-black text-gray-400 text-xs tracking-[0.8em] uppercase">载入星图数据...</p>
                    </div>
                ) : (
                    <>
                        <div className="px-12 py-8 border-b border-white/10 flex justify-between items-center bg-white/50 dark:bg-black/20">
                            <div className={`px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest ${mode === 'edit' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white shadow-xl'}`}>
                                {mode === 'edit' ? '造物模式' : '时空预览'}
                            </div>
                            <div className="flex items-center space-x-4">
                                <button onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')} className="flex items-center px-6 py-3 rounded-2xl bg-white dark:bg-gray-800 font-black text-xs uppercase shadow-xl hover:scale-105 active:scale-95 transition-all border border-gray-100 dark:border-gray-700">
                                    {mode === 'edit' ? <><Eye size={16} className="mr-2 text-blue-500" /> 预览</> : <><Edit3 size={16} className="mr-2 text-green-500" /> 返回编辑</>}
                                </button>
                                <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-md"><X size={24} /></button>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col overflow-y-auto px-12 sm:px-24 py-12">
                            <EditorCloud id="01" title="核心元数据" isDone={isMetaDone} isActive={step === 1}>
                                <div className="space-y-16 py-4">
                                    <EditorTextArea value={title} onChange={setTitle} placeholder="标题..." className="text-4xl sm:text-5xl font-black dark:text-white placeholder-gray-100 dark:placeholder-gray-800 leading-tight" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="relative">
                                            <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 block ml-1">文章分类</label>
                                            <button onClick={() => setIsSelectOpen(!isSelectOpen)} className="w-full flex items-center justify-between bg-white dark:bg-gray-800 p-6 rounded-[32px] font-black dark:text-white shadow-2xl border border-gray-100 dark:border-gray-700">
                                                <span>{category || "未分类"}</span>
                                                <ChevronDown size={24} className={isSelectOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                                            </button>
                                            {isSelectOpen && (
                                                <div className="absolute top-full mt-4 w-full bg-white dark:bg-gray-800 rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.3)] overflow-hidden z-50 border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-4">
                                                    {allCategories.map(c => <button key={c} onClick={() => { setCategory(c); setIsSelectOpen(false); }} className="w-full p-6 hover:bg-blue-600 hover:text-white transition-colors text-left font-black text-base">{c}</button>)}
                                                    <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5">
                                                        <input placeholder="创建新分类并按回车..." className="w-full p-4 bg-white dark:bg-gray-900 rounded-2xl outline-none dark:text-white font-bold text-sm shadow-inner" onKeyDown={handleNewCategoryKeyDown} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 block ml-1">文章标签</label>
                                            <input className="w-full bg-white dark:bg-gray-800 p-6 rounded-[32px] font-black dark:text-white outline-none shadow-2xl border border-gray-100 dark:border-gray-700" placeholder="按回车确定标签" onKeyDown={handleTagKeyDown} />
                                            <div className="flex flex-wrap gap-3 mt-6">
                                                {tags.map(t => <span key={t} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg">#{t}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </EditorCloud>

                            <EditorCloud id="02" title="视觉封面" isDone={isCoverDone} isActive={step === 2}>
                                <div className="py-10 max-w-2xl mx-auto">
                                    <EditorCover preview={cover.preview} onSelect={(e: ChangeEvent<HTMLInputElement>) => {const file = e.target.files?.[0]; if(file) setCover({ file, preview: URL.createObjectURL(file) })}} onRemove={() => setCover({ file: null, preview: '' })} />
                                </div>
                            </EditorCloud>

                            <EditorCloud id="03" title="造物空间" isDone={isContentDone} isActive={step === 3}>
                                {mode === 'edit' ? (
                                    <div className="space-y-4 pb-40">
                                        {blocks.map((block, index) => (
                                            <React.Fragment key={block.id}>
                                                <EditorBlockWrapper isFirst={index === 0} isLast={index === blocks.length - 1} isInvalid={block.invalid} onMoveUp={() => moveBlock(index, 'up')} onMoveDown={() => moveBlock(index, 'down')} onRemove={() => removeBlock(block.id)}>
                                                    {block.type === 'heading' && <EditorTextArea placeholder="小标题..." value={block.content} onChange={(v: string) => updateBlock(block.id, 'content', v)} className="text-2xl sm:text-3xl font-black text-blue-600 border-l-8 border-blue-600 pl-6" />}
                                                    {block.type === 'text' && <EditorTextArea placeholder="开始书写正文..." value={block.content} onChange={(v: string) => updateBlock(block.id, 'content', v)} className="text-2xl font-bold text-gray-700 dark:text-gray-300 leading-relaxed" />}
                                                    {block.type === 'image' && <EditorImageBlock previewUrl={block.previewUrl} onSelect={(e: ChangeEvent<HTMLInputElement>) => handleImageSelect(e, block.id)} onRemove={() => updateBlock(block.id, 'previewUrl', '')} />}
                                                    {block.type === 'download' && <EditorDownloadBlock description={block.description || ''} url={block.url || ''} onUpdate={(f: 'description' | 'url', v: string) => updateBlock(block.id, f, v)} />}
                                                </EditorBlockWrapper>
                                                <div className="relative h-12 group/ins flex items-center justify-center">
                                                    <div className="w-full h-[2px] bg-blue-500/0 group-hover/ins:bg-blue-500/20 transition-all" />
                                                    <div className="absolute flex gap-4 opacity-0 group-hover/ins:opacity-100 transition-all scale-90 group-hover/ins:scale-100 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-3 rounded-[24px] shadow-2xl border border-gray-100 dark:border-gray-700">
                                                        <button onClick={() => insertBlock(index, 'text')} className="p-3 hover:bg-blue-500 hover:text-white rounded-2xl transition-all shadow-sm"><Type size={20} /></button>
                                                        <button onClick={() => insertBlock(index, 'heading')} className="p-3 hover:bg-blue-500 hover:text-white rounded-2xl transition-all shadow-sm"><HeadingIcon size={20} /></button>
                                                        <button onClick={() => insertBlock(index, 'image')} className="p-3 hover:bg-emerald-500 hover:text-white rounded-2xl transition-all shadow-sm"><ImageIcon size={20} /></button>
                                                        <button onClick={() => insertBlock(index, 'download')} className="p-3 hover:bg-amber-500 hover:text-white rounded-2xl transition-all shadow-sm"><LinkIcon size={20} /></button>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="max-w-4xl mx-auto prose prose-2xl dark:prose-invert py-10">
                                        <h1 className="text-7xl font-black mb-16 tracking-tighter leading-tight">{title}</h1>
                                        {blocks.map((b, idx) => {
                                            const currentImgIdx = blocks.filter((item, i) => i <= idx && item.type === 'image').length;
                                            const currentDlIdx = blocks.filter((item, i) => i <= idx && item.type === 'download').length;
                                            return (
                                                <div key={b.id} className="mb-10">
                                                    {b.type === 'heading' && <h3 className="text-4xl font-black mt-16 mb-8">{b.content}</h3>}
                                                    {b.type === 'text' && <p className="text-2xl leading-relaxed text-gray-700 dark:text-gray-300">{b.content}</p>}
                                                    {b.type === 'image' && b.previewUrl && (
                                                        <div className="flex flex-col items-center">
                                                            <img src={b.previewUrl} className="rounded-[48px] shadow-2xl border-[12px] border-white dark:border-gray-800 my-8" alt={`Content image ${currentImgIdx}`} />
                                                            <span className="text-sm font-black text-gray-400 italic">图 {currentImgIdx}</span>
                                                        </div>
                                                    )}
                                                    {b.type === 'download' && (
                                                        <div className="p-10 bg-gray-50 dark:bg-white/5 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-white/10 my-10 font-black">
                                                            资源 {currentDlIdx}：{b.description}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </EditorCloud>
                        </div>
                        <div className="px-16 py-10 bg-white/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <button onClick={() => setStep(prev => Math.max(1, prev - 1))} disabled={step === 1} className="flex items-center gap-3 font-black text-gray-400 hover:text-blue-500 uppercase tracking-[0.2em] text-xs disabled:opacity-0 transition-all"><ChevronUp size={28} /> <span>上一步</span></button>
                            <div className="flex gap-5">{[1, 2, 3].map(i => (<div key={i} className={`w-3 h-3 rounded-full transition-all duration-700 ${step === i ? 'bg-blue-600 w-16' : 'bg-gray-200 dark:bg-gray-700'}`} />))}</div>
                            {step < 3 ? (
                                <button onClick={() => setStep(prev => Math.min(3, prev + 1))} className="flex items-center gap-3 font-black text-gray-400 hover:text-blue-500 uppercase tracking-[0.2em] text-xs transition-all"><span>下一步</span> <ChevronDown size={28} /></button>
                            ) : (
                                <button onClick={handleFinalPublish} disabled={isSubmitting} className="px-16 py-5 bg-blue-600 text-white rounded-[28px] font-black text-xl shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center disabled:opacity-50">
                                    {isSubmitting ? <Loader2 className="animate-spin mr-4" size={24} /> : <Send className="mr-4" size={24} />} {editSlug ? '同步最新更改' : '确认投递星火'}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default WriteModal;