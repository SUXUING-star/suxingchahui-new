import React, { useState, ChangeEvent } from 'react';
import { MessageCircle, Send, Lock, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useModal } from '../../../context/ModalContext';
import { useNotification } from '../../../context/NotificationContext';
import { apiPostComment, apiDeleteComment } from '../../../utils/postApi';
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
      {/* 调整1: 标题区域减小 Margin 和 字体大小 */}
      <div className="mb-6 relative">
        <h3 className="text-2xl font-black dark:text-white flex items-center tracking-tighter uppercase">
          <MessageCircle className="mr-3 text-blue-600" size={24} />
          评论交流
          <span className="ml-3 text-[10px] font-black text-gray-400 bg-gray-100/50 dark:bg-white/5 px-3 py-1 rounded-full">
            {getTotalCount(comments)} 总讨论
          </span>
        </h3>
      </div>

      {/* 调整2: 输入框区域更紧凑 */}
      <div className="mb-10 relative">
        <textarea 
          rows={3} 
          value={mainContent} 
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMainContent(e.target.value)}
          placeholder={isAuthenticated ? "分享你的独到见解..." : "加入宿星茶会，参与深度讨论"}
          // 修改: text-xl -> text-base, rounded-[40px] -> rounded-3xl, p-5 -> p-4
          className={`w-full p-4 px-5 rounded-3xl bg-white/40 dark:bg-black/20 border-2 border-transparent focus:border-blue-500 outline-none transition-all font-medium text-base dark:text-white resize-none shadow-inner ${!isAuthenticated && 'cursor-not-allowed opacity-60'}`}
          readOnly={!isAuthenticated}
          onClick={() => !isAuthenticated && openAuthModal()}
        />
        {isAuthenticated ? (
          // 修改: 按钮更小一点，位置微调
          <button onClick={handlePostMain} disabled={isSubmitting || !mainContent.trim()} className="absolute bottom-2.5 right-2.5 px-5 py-2 text-xs bg-blue-600 text-white rounded-2xl shadow-lg font-black flex items-center disabled:opacity-50 hover:scale-105 active:scale-95 transition-all">
            {isSubmitting ? <Loader2 className="animate-spin mr-1.5" size={16} /> : <Send className="mr-1.5" size={16} />} 发表
          </button>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button className="flex items-center px-6 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full shadow-lg text-xs font-black uppercase text-blue-600">
              <Lock size={14} className="mr-2" /> 点击登录发评
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6"> {/* 间距从 8 减到 6 */}
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
          // 调整3: 空状态高度减半
          <div className="py-12 text-center opacity-30">
             <MessageSquare size={36} className="mx-auto mb-3" />
             <p className="font-black uppercase tracking-[0.3em] text-xs">虚位以待</p>
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