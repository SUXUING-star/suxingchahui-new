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
    const { token, user } = useAuth();
    const { showNotification } = useNotification();
    const { onWriteSuccess } = useModal();

    // --- State ---
    const [step, setStep] = useState<number>(1);
    const [mode, setMode] = useState<'edit' | 'preview'>('edit');
    const [title, setTitle] = useState<string>('');
    const [topped, setTopped] = useState<boolean>(false);
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
    const isAdmin = !!user?.isAdmin; // 3. 增加 isAdmin 判断

    // --- Effects ---
    const fetchMetadata = async () => {
        try {
            const cats = await getCategories();
            setAllCategories(cats.map((c: any) => c._id));
        } catch (err) { }
    };

    // --- 加载逻辑修改 ---
    const loadExistingPost = useCallback(async () => {
        if (!editSlug) return;
        setIsLoadingData(true);
        try {
            const post = await getPostById(editSlug, token || undefined); 
            if (!post) throw new Error('文章未找到');

            // console.log('Fetched post data:', post); // 调试日志

            setTitle(post.title);
            setCategory(post.category);
            setTags(post.tags);
            setTopped(post.topped); // 2. 【关键】加载已有的置顶状态
            setCover({ file: null, preview: post.coverImage?.src || '' });

            const parsedBlocks = parseMDToBlocks(post.content, post.contentImages, post.downloads);
            const sanitizedBlocks: Block[] = parsedBlocks.map(b => ({
                id: b.id || Date.now() + Math.random(), // 确保 ID 唯一
                type: b.type,
                content: b.content || '',
                invalid: false,
                // 强制检查下载块的元数据
                description: b.description || (b as any).download?.description || '',
                url: b.url || (b as any).download?.url || '',
                previewUrl: b.previewUrl || '',
                resourceId: b.resourceId || (b as any)._id, // 关键：保留原始 ID 链接
            }));
            setBlocks(sanitizedBlocks);
        } catch (err: any) {
            showNotification(err.message, 'error');
            onClose();
        } finally {
            setIsLoadingData(false);
        }
    }, [editSlug, onClose, showNotification]);

    const resetState = useCallback(() => {
        setTitle('');
        setCategory('');
        setTags([]);
        setStep(1);
        setMode('edit');
        setTopped(false); // 3. 重置状态
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
                // 使用展开运算符保留所有旧字段（包括 description, url, resourceId 等）
                const updated = { ...b, [field]: value };

                // 补丁：如果更新的是 url 或 description，确保 invalid 状态解除
                if (b.type === 'download' && (field === 'url' || field === 'description')) {
                    if (updated.url?.trim()) updated.invalid = false;
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
        // 【新增】下载链接完整性强制检查
        const brokenLinks = blocks.filter(b => b.type === 'download' && (!b.url || b.url.trim() === ''));
        if (brokenLinks.length > 0) {
            // 将第一个损坏的块标记为 invalid 并滚回第三步
            setBlocks(prev => prev.map(b => b.type === 'download' && !b.url ? { ...b, invalid: true } : b));
            setStep(3);
            return showNotification('存在未填写的下载链接，请检查或删除该块后再提交', 'error');
        }

        if (!token) return showNotification('身份验证已失效，请重新登录', 'error');

        setIsSubmitting(true);
        showNotification('星火集结：正在同步资源...', 'success');

        try {
            // 1. 先处理封面 (保持不变)
            let coverData = cover.preview ? { src: cover.preview, alt: title } : undefined;
            if (cover.file) {
                const res = await apiUploadPostImage(cover.file, token);
                coverData = { src: res.url, alt: title };
            }

            const contentImages: any[] = [];
            const downloads: any[] = [];

            // 2. 预处理所有块，确保 ID 稳定，不丢失数据
            const finalBlocks = await Promise.all(blocks.map(async (b) => {
                if (b.type === 'image') {
                    if (b.file) {
                        const res = await apiUploadPostImage(b.file, token);
                        const imgObj = { _id: res.id, src: res.url, alt: b.content || `插图` };
                        contentImages.push(imgObj);
                        return { ...b, resourceId: res.id };
                    } else if (b.previewUrl) {
                        // 已经是存在的图片
                        const resId = b.resourceId || `img-${b.id}`;
                        contentImages.push({ _id: resId, src: b.previewUrl, alt: b.content || '插图' });
                        return { ...b, resourceId: resId };
                    }
                }

                if (b.type === 'download') {
                    // 【核心修复】：不要判断 b.url，只要是下载类型就必须占位
                    // 优先使用已有的 resourceId，没有就根据 block.id 生成一个固定的
                    const dlId = b.resourceId || `dl-${b.id}`;
                    downloads.push({
                        _id: dlId,
                        description: b.description || b.content || '', // 兼容 content 里的描述
                        url: b.url || ''
                    });
                    return { ...b, resourceId: dlId };
                }
                return b;
            }));

            // 3. 生成 Markdown 文本
            const mdContent = finalBlocks.map(b => {
                if (b.type === 'heading') return `### ${b.content}`;
                if (b.type === 'image' && b.resourceId) return `[image:${b.resourceId}]`;
                if (b.type === 'download' && b.resourceId) return `[download:${b.resourceId}]`;
                return b.content; // 普通文本
            }).join('\n\n');

            // 4. 组装请求模型
            const requestModel = new PostRequest({
                title,
                category,
                tags,
                coverImage: coverData,
                contentImages,
                downloads, // 这里现在包含了完整的元数据
                content: mdContent,
                excerpt: blocks.find(b => b.type === 'text')?.content?.slice(0, 150) || '',
                topped: isAdmin ? topped : undefined,
            });


            let responseData;
            if (editSlug) {
                responseData = await apiUpdatePost(editSlug, requestModel, token);
            } else {
                responseData = await apiCreatePost(requestModel, token);
            }

            const finalStatus = responseData.status;


            showNotification('文章已发布（会经过审核）', 'success', '感谢支持');


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
            // 7. 传递新增的 props 给 Layout
            isAdmin={isAdmin}
            isTopped={topped}
            setIsTopped={setTopped}
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