// src/components/post/comment/CommentItem.jsx
import React from 'react';
import ReplyItem from './ReplyItem';

const CommentItem = ({ comment, slug, onRefresh, onOpenDeleteModal }) => {
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