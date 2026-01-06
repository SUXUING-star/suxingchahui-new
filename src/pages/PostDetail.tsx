import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useLayout } from '../context/LayoutContext';
import { getPostById } from '../utils/postApi';
import { PostResponse } from '../models/PostResponse';

import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusPlaceholder from '../components/common/StatusPlaceholder';
import PostLayout from '../components/post/content/PostLayout';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  
  const { token, user, isAuthenticated } = useAuth();
  const { openWriteModal, openAuthModal } = useModal();
  const { setHideSidebars, setCustomBg } = useLayout();
  const commentRef = useRef<HTMLDivElement>(null);

  const fetchPostData = useCallback(async (): Promise<void> => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const data = await getPostById(id, token, true);
      if (data) {
        setPost(data);
        if (data.coverImage?.src) setCustomBg(data.coverImage.src);
      } else {
        setPost(null); // Explicitly set to null if no data found
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id, setCustomBg]);

  useEffect(() => {
    setHideSidebars(true);
    window.scrollTo(0, 0);
    return () => {
      setHideSidebars(false);
      setCustomBg(null);
    };
  }, [id, setHideSidebars, setCustomBg]);

  useEffect(() => {
    fetchPostData();
  }, [fetchPostData]);

  if (loading) return <LoadingSpinner />;

  if (error || !post) {
    return (
      <StatusPlaceholder 
        type="error" 
        title="星火链路断开" 
        message="该文章可能已坠入深空黑洞，或者您的访问权限已被枢纽拦截。" 
        showHome={true} 
        onRetry={fetchPostData} 
      />
    );
  }

  return (
    <PostLayout 
      post={post}
      isAuthenticated={isAuthenticated}
      user={user}
      openWriteModal={openWriteModal}
      openAuthModal={openAuthModal}
      onRefresh={fetchPostData}
      commentRef={commentRef}
    />
  );
};

export default PostDetail;