import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { apiGetPendingPosts, apiReviewPost } from '../utils/postApi';
import StatusPlaceholder from '../components/common/StatusPlaceholder';
import LoadingSpinner from '../components/common/LoadingSpinner';
import UserBadge from '../components/common/UserBadge';
import { Check, X, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PostResponse } from '../models/PostResponse'; // 导入 PostResponse 类型

type ReviewAction = 'approve' | 'reject';

const AdminPending: React.FC = () => {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { token, user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const fetchPending = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiGetPendingPosts(token);
      setPosts(data);
    } catch (err: any) {
      showNotification(err.message || '获取待审列表失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, showNotification]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  useEffect(() => {
    // 等待数据加载完毕再判断权限，防止在 loading 状态下就跳转
    if (!loading && user && !user.isAdmin) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleReview = async (postId: string | null, action: ReviewAction) => {
    if (!postId || !token) return;
    try {
      await apiReviewPost(postId, action, token);
      showNotification(`文章已${action === 'approve' ? '通过发布' : '锁定拒绝'}`, 'success');
      setPosts(prevPosts => prevPosts.filter(p => p._id !== postId));
    } catch (err: any) {
      showNotification(err.message || '审核操作失败', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // 权限判断应该在数据判断之前，更安全
  if (!user?.isAdmin) {
    return (
      <StatusPlaceholder 
        type="denied" 
        title="禁止通行" 
        message="此处为核心管理区，您的当前身份无法调取数据" 
        showHome={true}
      />
    );
  }

  if (posts.length === 0) {
    return (
      <StatusPlaceholder 
        type="empty" 
        title="清空完毕" 
        message="所有待审星火均已处理完成" 
        onRetry={fetchPending}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-8 flex items-center">
        <span className="w-4 h-4 bg-red-600 rounded-full mr-3 animate-pulse"></span>
        待审核列表
      </h1>

      <div className="grid gap-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-6 items-start">
            {post.coverImage && (
              <img src={post.coverImage.src} className="w-full md:w-48 h-32 object-cover rounded-xl shadow-inner" alt={post.title} />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <UserBadge user={post.author} size="sm" />
                <span className="text-xs text-gray-400">{new Date(post.createTime).toLocaleString()}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 truncate">{post.title}</h2>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">{post.excerpt}</p>
              
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">#{tag}</span>)}
              </div>
            </div>

            <div className="flex md:flex-col gap-2 w-full md:w-auto">
              <Link to={`/post/${post.id}`} className="flex-1 md:w-32 flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 transition-colors">
                <Eye size={16} className="mr-2" /> 预览
              </Link>
              <button onClick={() => handleReview(post._id, 'approve')} className="flex-1 md:w-32 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Check size={16} className="mr-2" /> 通过
              </button>
              <button onClick={() => handleReview(post._id, 'reject')} className="flex-1 md:w-32 flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-bold">
                <X size={16} className="mr-2" /> 拒绝
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPending;