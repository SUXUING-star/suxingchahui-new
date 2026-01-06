import React, { useState, ChangeEvent } from 'react';
import { MessageCircle, Send, Lock, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useModal } from '../../../context/ModalContext';
import { useNotification } from '../../../context/NotificationContext';
import { apiPostComment, apiDeleteComment } from '../../../utils/postUtils';
import ConfirmModal from '../../common/ConfirmModal';
import CommentItem from './CommentItem';
import { Comment } from '../../../models/PostResponse';

interface DeleteConfig {
  isOpen: boolean;
  comment: Comment | null;
}

interface CommentSectionProps {
  comments: Comment[];
  slug: string;
  onRefresh: () => void;
}

const getTotalCount = (list: Comment[]): number => {
  return list.reduce((count, item) => {
    return count + 1 + (item.replies ? getTotalCount(item.replies) : 0);
  }, 0);
};

const CommentSection: React.FC<CommentSectionProps> = ({ comments, slug, onRefresh }) => {
  const { isAuthenticated, token } = useAuth();
  const { openAuthModal } = useModal();
  const { showNotification } = useNotification();
  
  const [mainContent, setMainContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deleteConfig, setDeleteConfig] = useState<DeleteConfig>({ isOpen: false, comment: null });

  const handlePostMain = async () => {
    if (!mainContent.trim() || !token) return;
    setIsSubmitting(true);
    try {
      await apiPostComment({ slug, content: mainContent }, token);
      showNotification('想法已发布', 'success');
      setMainContent('');
      onRefresh();
    } catch (err: any) { 
      showNotification(err.message || '发布失败', 'error'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const executeDelete = async () => {
    const commentId = deleteConfig.comment?._id;
    if (!commentId || !token) return;

    setDeleteConfig({ isOpen: false, comment: null });
    try {
      await apiDeleteComment({ slug, commentId }, token);
      showNotification('评论已永久删除', 'success');
      onRefresh();
    } catch (err: any) { 
      showNotification(err.message || '删除失败', 'error'); 
    }
  };

  const handleOpenDeleteModal = (comment: Comment) => {
    setDeleteConfig({ isOpen: true, comment });
  };

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-12 px-2">
        <h3 className="text-3xl font-black dark:text-white flex items-center tracking-tighter uppercase">
          <MessageCircle className="mr-4 text-blue-600" size={32} />
          评论交流
          <span className="ml-4 text-xs font-black text-gray-400 bg-gray-100/50 dark:bg-white/5 px-4 py-1.5 rounded-full">
            {getTotalCount(comments)} 总讨论
          </span>
        </h3>
      </div>

      <div className="mb-16 relative">
        <textarea 
          rows={4} 
          value={mainContent} 
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMainContent(e.target.value)}
          placeholder={isAuthenticated ? "分享你的独到见解..." : "加入宿星茶会，参与深度讨论"}
          className={`w-full p-8 rounded-[40px] bg-white/40 dark:bg-black/20 border-2 border-transparent focus:border-blue-500 outline-none transition-all font-bold text-xl dark:text-white resize-none shadow-inner ${!isAuthenticated && 'cursor-not-allowed opacity-60'}`}
          readOnly={!isAuthenticated}
          onClick={() => !isAuthenticated && openAuthModal()}
        />
        {isAuthenticated ? (
          <button onClick={handlePostMain} disabled={isSubmitting || !mainContent.trim()} className="absolute bottom-6 right-6 px-10 py-4 bg-blue-600 text-white rounded-[24px] shadow-2xl font-black flex items-center disabled:opacity-50 hover:scale-105 active:scale-95 transition-all">
            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={20} /> : <Send className="mr-2" size={20} />} 发表
          </button>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button className="flex items-center px-8 py-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full shadow-2xl text-sm font-black uppercase text-blue-600">
              <Lock size={16} className="mr-2" /> 点击登录发评
            </button>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {comments && comments.length > 0 ? (
          comments.map(c => (
            <CommentItem 
              key={c._id} 
              comment={c} 
              slug={slug} 
              onRefresh={onRefresh} 
              onOpenDeleteModal={handleOpenDeleteModal} 
            />
          ))
        ) : (
          <div className="py-24 text-center opacity-30">
             <MessageSquare size={48} className="mx-auto mb-4" />
             <p className="font-black uppercase tracking-[0.4em] text-sm">虚位以待</p>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={deleteConfig.isOpen}
        onClose={() => setDeleteConfig({ isOpen: false, comment: null })}
        onConfirm={executeDelete}
        title="确认撤回？"
        message="此操作将永久抹除该讨论及所有关联回复。"
        confirmText="彻底删除"
      />
    </section>
  );
};

export default CommentSection;