import React, { useState, useEffect, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';
import { useNotification } from '@/context/NotificationContext';
import { PostRequest } from '@/models/PostRequest';
import {
    apiCreatePost,
    apiUpdatePost,
    apiUploadPostImage,
    apiDeletePost,
    getCategories,
    getPostById
} from '@/utils/postApi';
import { parseMDToBlocks } from '@/utils/mdParser';
import { convertToWebP } from '@/utils/imageUtils';
import WriteModalLayout from './WriteModalLayout';

// --- 类型定义 ---
export type BlockType = 'text' | 'heading' | 'image' | 'download';

export interface Block {
    id: number;
    type: BlockType;
    content: string;
    invalid: boolean;
    description?: string;
    url?: string;
    previewUrl?: string;
    file?: File | null;
    resourceId?: string;
}

interface CoverState {
    file: File | null;
    preview: string;
}

interface WriteModalProps {
    isOpen: boolean;
    onClose: () => void;
    editSlug?: string | null; // slug 可空
}

const WriteModal: React.FC<WriteModalProps> = ({ isOpen, onClose, editSlug = null }) => {
    const { token } = useAuth();
    const { showNotification } = useNotification();
    const { onWriteSuccess } = useModal();
    
    // --- State ---
    const [step, setStep] = useState<number>(1);
    const [mode, setMode] = useState<'edit' | 'preview'>('edit');
    const [title, setTitle] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);
    const [cover, setCover] = useState<CoverState>({ file: null, preview: '' });
    const [blocks, setBlocks] = useState<Block[]>([{ id: Date.now(), type: 'text', content: '', invalid: false }]);
    const [allCategories, setAllCategories] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
    const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);

    // --- Computed ---
    const isMetaDone = title.trim().length > 0 && !!category;
    const isCoverDone = !!cover.preview;
    const isContentDone = blocks.some(b =>
        (b.type === 'text' && b.content.trim() !== '') ||
        (b.type === 'heading' && b.content.trim() !== '') ||
        (b.type === 'image' && (b.previewUrl || b.file)) ||
        (b.type === 'download' && b.url && b.url.trim() !== '')
    );

    // --- Effects ---
    const fetchMetadata = async () => {
        try {
            const cats = await getCategories();
            setAllCategories(cats.map((c: any) => c._id));
        } catch (err) { }
    };

    const loadExistingPost = useCallback(async () => {
        if (!editSlug) return;
        setIsLoadingData(true);
        try {
            const post = await getPostById(editSlug);
            if (!post) throw new Error('文章未找到');
            setTitle(post.title);
            setCategory(post.category);
            setTags(post.tags);
            setCover({ file: null, preview: post.coverImage?.src || '' });
            
            // 解析逻辑依赖 mdParser 的正确性
            const parsedBlocks = parseMDToBlocks(post.content, post.contentImages, post.downloads);
            const sanitizedBlocks: Block[] = parsedBlocks.map(b => ({
                id: b.id,
                type: b.type,
                content: b.content || '',
                invalid: b.invalid || false,
                description: b.description || '',
                url: b.url || '',
                previewUrl: b.previewUrl || '',
                file: null,
                resourceId: b.resourceId,
            }));
            setBlocks(sanitizedBlocks);
        } catch (err: any) {
            showNotification(err.message, 'error');
            onClose();
        } finally {
            setIsLoadingData(false);
        }
    }, [editSlug, onClose, showNotification, token]);

    const resetState = useCallback(() => {
        setTitle(''); setCategory(''); setTags([]); setStep(1); setMode('edit');
        setCover({ file: null, preview: '' });
        setBlocks([{ id: Date.now(), type: 'text', content: '', invalid: false }]);
        setIsDeleteConfirmOpen(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchMetadata();
            if (editSlug) {
                loadExistingPost();
            } else {
                resetState();
            }
        }
    }, [isOpen, editSlug, loadExistingPost, resetState]);


    // --- Handlers ---
    const insertBlock = (index: number, type: BlockType) => {
        const newBlock: Block = { id: Date.now(), type, content: '', invalid: false, description: '', url: '', previewUrl: '' };
        setBlocks(prev => {
            const newBlocks = [...prev];
            newBlocks.splice(index + 1, 0, newBlock);
            return newBlocks;
        });
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    const updateBlock = (id: number, field: keyof Block, value: any) => {
        setBlocks(prev => prev.map(b => {
            if (b.id === id) {
                const updated = { ...b, [field]: value };
                if (b.type === 'download' && field === 'url' && (value as string).trim() !== '') {
                    updated.invalid = false;
                }
                return updated;
            }
            return b;
        }));
    };

    const removeBlock = (id: number) => {
        setBlocks(prev => {
            const filtered = prev.filter(b => b.id !== id);
            return filtered.length === 0 ? [{ id: Date.now(), type: 'text', content: '', invalid: false }] : filtered;
        });
    };

    // --- WebP Integration Handlers ---
    const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>, blockId: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 即时预览
        const tempPreview = URL.createObjectURL(file);
        setBlocks(prev => prev.map(b => b.id === blockId ? {
            ...b,
            file,
            previewUrl: tempPreview,
            invalid: false
        } : b));

        // 异步转 WebP
        try {
            const { file: convertedFile, previewUrl: finalPreview } = await convertToWebP(file);
            setBlocks(prev => prev.map(b => b.id === blockId ? {
                ...b,
                file: convertedFile,
                previewUrl: finalPreview
            } : b));
        } catch (err) {
            console.error('WebP convert failed', err);
        }
    };

    const handleCoverSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const tempPreview = URL.createObjectURL(file);
        setCover({ file, preview: tempPreview });

        try {
            const { file: convertedFile, previewUrl: finalPreview } = await convertToWebP(file);
            setCover({ file: convertedFile, preview: finalPreview });
        } catch (err) {
            console.error('WebP convert failed', err);
        }
    };

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = e.currentTarget.value.trim();
            if (value && !tags.includes(value)) setTags([...tags, value]);
            e.currentTarget.value = '';
        }
    };

    const handleNewCategoryKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = e.currentTarget.value.trim();
            if (value) {
                setCategory(value);
                if (!allCategories.includes(value)) setAllCategories(prev => [...prev, value]);
                setIsSelectOpen(false);
            }
        }
    };

    // --- Publish & Delete ---
    const handleFinalPublish = async () => {
        if (!isMetaDone) { setStep(1); return showNotification('核心配置未完成', 'error'); }
        if (!isCoverDone) { setStep(2); return showNotification('请设置封面', 'error'); }
        if (!isContentDone) { setStep(3); return showNotification('文章内容不能为空', 'error'); }
        if (!token) return showNotification('请先登录', 'error');

        setIsSubmitting(true);
        showNotification('星火集结：正在同步资源...', 'success');

        try {
            let coverData: { src: string; alt: string } | undefined = undefined;
            if (cover.preview) coverData = { src: cover.preview, alt: title };
            
            if (cover.file) {
                const res = await apiUploadPostImage(cover.file, token);
                coverData = { src: res.url, alt: title };
            }

            const contentImages: any[] = [];
            const downloads: any[] = [];
            
            const finalBlocks = await Promise.all(blocks.map(async (b) => {
                if (b.type === 'image') {
                    if (b.file) {
                        const res = await apiUploadPostImage(b.file, token);
                        contentImages.push({ _id: res.id, src: res.url, alt: `插图 ${contentImages.length + 1}` });
                        return { ...b, resourceId: res.id };
                    } else if (b.resourceId) {
                        contentImages.push({ _id: b.resourceId, src: b.previewUrl, alt: `插图 ${contentImages.length + 1}` });
                    }
                }
                if (b.type === 'download' && b.url) {
                    const dlId = b.resourceId || `dl-${Math.random().toString(36).substr(2, 5)}`;
                    downloads.push({ _id: dlId, description: b.description, url: b.url });
                    return { ...b, resourceId: dlId };
                }
                return b;
            }));

            const mdContent = finalBlocks.map(b => {
                if (b.type === 'heading') return `### ${b.content}`;
                if (b.type === 'image' && b.resourceId) return `[image:${b.resourceId}]`;
                if (b.type === 'download' && b.resourceId) return `[download:${b.resourceId}]`;
                return b.content;
            }).join('\n\n');

            const requestModel = new PostRequest({
                title, category, tags, coverImage: coverData, contentImages, downloads,
                content: mdContent, excerpt: blocks.find(b => b.type === 'text')?.content?.slice(0, 150) || ''
            });

            let responseData;
            if (editSlug) {
                responseData = await apiUpdatePost(editSlug, requestModel, token);
            } else {
                responseData = await apiCreatePost(requestModel, token);
            }

            const finalStatus = responseData.status;

            if (finalStatus === 'published') {
                showNotification('星火已点燃：文章已实时发布', 'success', '全站同步');
            } else if (finalStatus === 'pending') {
                showNotification('已送入审核：由于权限变更，内容需重新审批', 'success', '审核队列');
            } else {
                showNotification('状态异常，请联系管理员', 'error');
            }

            if (onWriteSuccess) onWriteSuccess();
            onClose();
        } catch (err: any) {
            showNotification(err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePost = async () => {
        if (!editSlug || !token) return;
        setIsDeleteConfirmOpen(false);
        try {
            await apiDeletePost(editSlug, token);
            showNotification('文章已抹除', 'success');
            if (onWriteSuccess) onWriteSuccess();
            onClose();
        } catch (err: any) {
            showNotification(err.message || '删除失败', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <WriteModalLayout
            onClose={onClose}
            editSlug={editSlug}
            step={step}
            setStep={setStep}
            mode={mode}
            setMode={setMode}
            title={title}
            setTitle={setTitle}
            category={category}
            setCategory={setCategory}
            tags={tags}
            setTags={setTags}
            cover={cover}
            setCover={setCover}
            blocks={blocks}
            allCategories={allCategories}
            isSubmitting={isSubmitting}
            isLoadingData={isLoadingData}
            isSelectOpen={isSelectOpen}
            setIsSelectOpen={setIsSelectOpen}
            isDeleteConfirmOpen={isDeleteConfirmOpen}
            setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
            isMetaDone={isMetaDone}
            isCoverDone={isCoverDone}
            isContentDone={isContentDone}
            insertBlock={insertBlock}
            moveBlock={moveBlock}
            updateBlock={updateBlock}
            removeBlock={removeBlock}
            handleImageSelect={handleImageSelect}
            handleCoverSelect={handleCoverSelect}
            handleTagKeyDown={handleTagKeyDown}
            handleNewCategoryKeyDown={handleNewCategoryKeyDown}
            handleFinalPublish={handleFinalPublish}
            handleDeletePost={handleDeletePost}
        />
    );
};

export default WriteModal;