// File: PostDetail.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { useLayout } from "../context/LayoutContext";
import { getPostBySlug } from "../utils/postApi"; // 💡 引入更名后的 getPostBySlug
import { PostResponse } from "../models/PostResponse";

import LoadingSpinner from "../components/common/LoadingSpinner";
import StatusPlaceholder from "../components/common/StatusPlaceholder";
import PostLayout from "../components/post/content/PostLayout";

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>(); // 💡 从路由捕获 slug
  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const { token, user, isAuthenticated } = useAuth();
  const { openWriteModal, openAuthModal } = useModal();
  const { setHideSidebars, setCustomBg } = useLayout();
  const commentRef = useRef<HTMLDivElement>(null);

  const fetchPostData = useCallback(async (): Promise<void> => {
    if (!slug) {
      setError(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const data = await getPostBySlug(slug, token, true); // 💡 使用 getPostBySlug 传输 slug
      if (data) {
        setPost(data);
        if (data.coverImage?.src) setCustomBg(data.coverImage.src);
      } else {
        setPost(null);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [slug, token, setCustomBg]);

  useEffect(() => {
    setHideSidebars(true);
    window.scrollTo(0, 0);
    return () => {
      setHideSidebars(false);
      setCustomBg(null);
    };
  }, [slug, setHideSidebars, setCustomBg]);

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
      token={token}
      openWriteModal={openWriteModal}
      openAuthModal={openAuthModal}
      onRefresh={fetchPostData}
      commentRef={commentRef}
    />
  );
};

export default PostDetail;
