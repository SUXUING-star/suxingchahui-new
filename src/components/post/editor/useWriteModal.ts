import { useState, useEffect, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import anime from 'animejs';
import { useAuth } from '../../../context/AuthContext';
import { useModal } from '../../../context/ModalContext';
import { useNotification } from '../../../context/NotificationContext';
import { PostRequest } from '../../../models/PostRequest';
import {
    apiCreatePost,
    apiUpdatePost,
    apiUploadPostImage,
    getCategories,
    getPostById
} from '../../../utils/postUtils';
import { parseMDToBlocks, ContentBlock } from '../../../utils/mdParser';

// --- 类型定义 ---
type BlockType = 'text' | 'heading' | 'image' | 'download';

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

interface UseWriteModalProps {
    isOpen: boolean;
    editSlug: string | null;
    onClose: () => void;
}

export const useWriteModal = ({ isOpen, editSlug, onClose }: UseWriteModalProps) => {
    const { token } = useAuth();
    const { showNotification } = useNotification();
    const { onWriteSuccess } = useModal();
    
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

    // 错误修正 #1: isMetaDone 的判断，把 string 转为 boolean
    const isMetaDone = title.trim().length > 0 && !!category;
    const isCoverDone = !!cover.preview;
    const isContentDone = blocks.some(b =>
        (b.type === 'text' && b.content.trim() !== '') ||
        (b.type === 'heading' && b.content.trim() !== '') ||
        (b.type === 'image' && (b.previewUrl || b.file)) ||
        (b.type === 'download' && b.url && b.url.trim() !== '')
    );

    const resetState = useCallback(() => {
        setTitle(''); setCategory(''); setTags([]); setStep(1); setMode('edit');
        setCover({ file: null, preview: '' });
        setBlocks([{ id: Date.now(), type: 'text', content: '', invalid: false }]);
    }, []);

    const loadExistingPost = useCallback(async () => {
        if (!editSlug) return;
        setIsLoadingData(true);
        try {
            const post = await getPostById(editSlug);
            setTitle(post.title);
            setCategory(post.category);
            setTags(post.tags);
            setCover({ file: null, preview: post.coverImage?.src || '' });
            const restoredFromParser: ContentBlock[] = parseMDToBlocks(post.content, post.contentImages, post.downloads);
            const sanitizedBlocks: Block[] = restoredFromParser.map(b => ({
                ...b,
                content: b.content || '',
                invalid: b.invalid || false,
            }));
            setBlocks(sanitizedBlocks);
        } catch (err: any) {
            showNotification(err.message, 'error');
            onClose();
        } finally {
            setIsLoadingData(false);
        }
    }, [editSlug, onClose, showNotification]);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const cats = await getCategories();
                setAllCategories(cats.map((c: { _id: string }) => c._id));
            } catch (err) {}
        };
        
        if (isOpen) {
            fetchMetadata();
            if (editSlug) {
                loadExistingPost();
            } else {
                resetState();
            }
            anime({
                targets: '.modal-canvas',
                opacity: [0, 1],
                scale: [0.95, 1],
                duration: 800,
                easing: 'easeOutExpo'
            });
        }
    }, [isOpen, editSlug, resetState, loadExistingPost]);

    // --- Block Manipulation ---
    const insertBlock = (index: number, type: BlockType) => {
        const newBlock: Block = { id: Date.now(), type, content: '', invalid: false, description: '', url: '' };
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
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, [field]: value, invalid: (field === 'url' && value.trim() === '') ? b.invalid : false } : b));
    };

    const removeBlock = (id: number) => {
        setBlocks(prev => {
            const filtered = prev.filter(b => b.id !== id);
            return filtered.length === 0 ? [{ id: Date.now(), type: 'text', content: '', invalid: false }] : filtered;
        });
    };
    
    const handleImageSelect = (e: ChangeEvent<HTMLInputElement>, blockId: number) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, file, previewUrl: URL.createObjectURL(file), invalid: false } : b));
    };

    // --- Form Handlers ---
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

    const handleFinalPublish = async () => {
        if (!token) return showNotification('认证失效，请重新登录', 'error');

        setIsSubmitting(true);
        try {
            let coverData = cover.preview ? { src: cover.preview, alt: title } : undefined;
            if (cover.file) {
                const res = await apiUploadPostImage(cover.file, token);
                coverData = { src: res.url, alt: title };
            }

            const contentImages: any[] = [];
            const downloads: any[] = [];
            
            const finalBlocks = await Promise.all(blocks.map(async (b) => {
                if (b.type === 'image' && b.file) {
                    const res = await apiUploadPostImage(b.file, token);
                    contentImages.push({ _id: res.id, src: res.url, alt: `插图` });
                    return { ...b, resourceId: res.id };
                }
                if (b.type === 'download' && b.url) {
                    const dlId = b.resourceId || `dl_${Date.now()}`;
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

            const requestModel = new PostRequest({ title, category, tags, coverImage: coverData, contentImages, downloads, content: mdContent, excerpt: blocks.find(b => b.type === 'text')?.content?.slice(0, 150) || '' });
            const responseData = editSlug ? await apiUpdatePost(editSlug, requestModel, token) : await apiCreatePost(requestModel, token);

            showNotification(responseData.status === 'published' ? '星火已点燃：文章已实时发布' : '已送入审核：内容需管理员审批', 'success');

            if (onWriteSuccess) onWriteSuccess();
            onClose();
        } catch (err: any) {
            showNotification(err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        step, setStep,
        mode, setMode,
        title, setTitle,
        category, setCategory,
        tags, setTags,
        cover, setCover,
        blocks,
        allCategories,
        isSubmitting,
        isLoadingData,
        isSelectOpen, setIsSelectOpen,
        isMetaDone, isCoverDone, isContentDone,
        insertBlock, moveBlock, updateBlock, removeBlock,
        handleImageSelect, handleTagKeyDown, handleNewCategoryKeyDown, handleFinalPublish
    };
};