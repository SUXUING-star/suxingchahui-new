import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { apiGetPendingPosts, apiReviewPost } from '../utils/postApi';
import StatusPlaceholder from '../components/common/StatusPlaceholder';
import LoadingSpinner from '../components/common/LoadingSpinner';
import UserBadge from '../components/common/UserBadge';
import { Check, X, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PostResponse } from '../models/PostResponse';

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
    if (!loading && user && !user.isAdmin) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleReview = async (postId: string | null, action: ReviewAction) => {
    if (!postId || !token) return;
    try {
      await apiReviewPost(postId, action, token);
      showNotification(`文章已${action === 'approve' ? '通过发布' : '锁定拒绝'}`, 'success');
      setPosts(prevPosts => prevPosts.filter(p => (p._id || p.id) !== postId));
    } catch (err: any) {
      showNotification(err.message || '审核操作失败', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

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
    // 宽屏容器自适应
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 flex items-center">
          <span className="w-3 h-3 sm:w-4 sm:h-4 bg-red-600 rounded-full mr-3 animate-pulse"></span>
          待审核列表
          <span className="ml-3 text-sm font-normal text-gray-400">({posts.length})</span>
        </h1>
      </div>

      {/* 2-5 列自适应网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
        {posts.map(post => (
          <div key={post.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col hover:shadow-md transition-all">
            
            {/* 封面图区域 - 缩小比例 */}
            <div className="relative aspect-[16/10] w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
              {post.coverImage ? (
                <img src={post.coverImage.src} className="w-full h-full object-cover" alt={post.title} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">无封面</div>
              )}
              <div className="absolute top-2 left-2 scale-[0.8] origin-top-left">
                <UserBadge user={post.author} size="sm" />
              </div>
            </div>

            {/* 内容区 */}
            <div className="p-3 flex-1 flex flex-col">
              <h2 className="text-[13px] sm:text-[15px] font-bold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1 min-h-[2.4em]">
                {post.title}
              </h2>
              
              {/* 手机端隐藏摘要以节省垂直空间 */}
              <p className="hidden sm:line-clamp-2 text-[11px] text-gray-400 mb-3">
                {post.excerpt}
              </p>

              <div className="mt-auto space-y-2">
                {/* 预览按钮 - 变成次要样式 */}
                <Link 
                  to={`/post/${post.id}`} 
                  className="flex items-center justify-center w-full py-1.5 text-[11px] font-bold bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Eye size={12} className="mr-1" /> 详情预览
                </Link>

                {/* 审核操作组 - 并排显示 */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleReview(post._id || post.id, 'approve')} 
                    className="flex-1 flex items-center justify-center py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all shadow-sm shadow-emerald-200 dark:shadow-none"
                    title="通过"
                  >
                    <Check size={16} />
                  </button>
                  <button 
                    onClick={() => handleReview(post._id || post.id, 'reject')} 
                    className="flex-1 flex items-center justify-center py-2 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all"
                    title="拒绝"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPending;