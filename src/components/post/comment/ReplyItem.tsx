import React, { useState, ChangeEvent } from 'react';
import { Reply, Trash2, CornerDownRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useModal } from '../../../context/ModalContext';
import { useNotification } from '../../../context/NotificationContext';
import { apiPostComment } from '../../../utils/postUtils';
import UserBadge from '../../common/UserBadge';
import { Comment } from '../../../models/PostResponse';

interface ReplyItemProps {
  comment: Comment;
  slug: string;
  onRefresh: () => void;
  onOpenDeleteModal: (comment: Comment) => void;
  depth?: number;
}

const ReplyItem: React.FC<ReplyItemProps> = ({ comment, slug, onRefresh, onOpenDeleteModal, depth = 0 }) => {
  const { user, token, isAuthenticated } = useAuth();
  const { openAuthModal } = useModal();
  const { showNotification } = useNotification();
  
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [replyContent, setReplyContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleReply = async () => {
    if (!replyContent.trim() || !token) return;
    setIsSubmitting(true);
    try {
      await apiPostComment({ slug, content: replyContent, parentId: comment._id }, token);
      showNotification('回复已发射', 'success');
      setReplyContent('');
      setIsReplying(false);
      onRefresh(); 
    } catch (err: any) {
      showNotification(err.message || '回复失败', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canDelete = isAuthenticated && user && (user.isAdmin || user.nickname === comment.user.nickname);

  return (
    <div className={`mt-6 ${depth > 0 ? 'ml-4 sm:ml-12 border-l-2 border-gray-100 dark:border-white/5 pl-4 sm:pl-8' : ''}`}>
      <div className="flex items-start space-x-4">
        <UserBadge user={comment.user} size="sm" className="flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {comment.getFormattedDate()}
            </span>
            {depth > 0 && <CornerDownRight size={12} className="text-gray-300" />}
          </div>

          <p className="text-gray-800 dark:text-gray-100 leading-relaxed font-bold break-words text-[15px]">
            {comment.content}
          </p>
          
          <div className="flex items-center space-x-5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => isAuthenticated ? setIsReplying(!isReplying) : openAuthModal()}
              className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-600 flex items-center"
            >
              <Reply size={12} className="mr-1" /> 回复
            </button>
            {canDelete && (
              <button 
                onClick={() => onOpenDeleteModal(comment)} 
                className="text-[10px] font-black uppercase text-red-400 hover:text-red-500 flex items-center"
              >
                <Trash2 size={12} className="mr-1" /> 删除
              </button>
            )}
          </div>

          {isReplying && (
            <div className="mt-4 flex flex-col space-y-2 animate-in slide-in-from-top-2">
              <textarea 
                autoFocus 
                value={replyContent} 
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setReplyContent(e.target.value)}
                placeholder={`回复 ${comment.user.nickname}...`} 
                rows={2}
                className="w-full bg-white/40 dark:bg-black/20 p-4 rounded-2xl text-sm font-bold outline-none border-2 border-transparent focus:border-blue-500 dark:text-white transition-all resize-none shadow-inner"
              />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setIsReplying(false)} className="px-4 py-1.5 text-[10px] font-black text-gray-400">取消</button>
                <button 
                    onClick={handleReply} 
                    disabled={isSubmitting || !replyContent.trim()}
                    className="px-6 py-1.5 bg-blue-600 text-white rounded-xl font-black text-[10px] shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : '发送'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-1">
          {comment.replies.map(reply => (
            <ReplyItem 
                key={reply._id} 
                comment={reply} 
                slug={slug} 
                onRefresh={onRefresh} 
                depth={depth + 1} 
                onOpenDeleteModal={onOpenDeleteModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReplyItem;