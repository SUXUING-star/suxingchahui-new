// src/pages/PostDetail.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useLayout } from '../context/LayoutContext';
import { getPostById } from '../utils/postUtils';

import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusPlaceholder from '../components/common/StatusPlaceholder';
import PostLayout from '../components/post/PostLayout'; // 引入视图

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const { token, user, isAuthenticated } = useAuth();
  const { openWriteModal, openAuthModal } = useModal();
  const { setHideSidebars, setCustomBg } = useLayout();
  const commentRef = useRef(null);

  // 1. 核心：获取数据函数 (支持重试)
  const fetchPostData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getPostById(id, token, true); // true 表示增加浏览量指示
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
  }, [id, token, setCustomBg]);

  // 2. 布局生命周期管理
  useEffect(() => {
    setHideSidebars(true);
    window.scrollTo(0, 0);
    return () => {
      setHideSidebars(false);
      setCustomBg(null);
    };
  }, [id, setHideSidebars, setCustomBg]);

  // 3. 初始触发
  useEffect(() => {
    fetchPostData();
  }, [fetchPostData]);

  // --- 标准化条件渲染流 ---
  if (loading) return <LoadingSpinner />;

  // 核心修正：返回标准化的 404/错误 占位符
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

  // 4. 渲染视图层
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