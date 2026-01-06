import React from 'react';
import ReplyItem from './ReplyItem';
import { Comment } from '../../../models/PostResponse';

interface CommentItemProps {
  comment: Comment;
  slug: string;
  onRefresh: () => void;
  onOpenDeleteModal: (comment: Comment) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, slug, onRefresh, onOpenDeleteModal }) => {
  return (
    <div className="group relative bg-white/30 dark:bg-black/10 rounded-[32px] p-2 transition-all hover:bg-white/40">
      <ReplyItem 
        comment={comment} 
        slug={slug} 
        onRefresh={onRefresh} 
        onOpenDeleteModal={onOpenDeleteModal}
        depth={0} 
      />
    </div>
  );
};

export default CommentItem;