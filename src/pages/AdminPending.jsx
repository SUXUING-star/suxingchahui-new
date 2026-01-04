// src/pages/AdminPending.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { apiGetPendingPosts, apiReviewPost } from '../utils/postUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import UserBadge from '../components/common/UserBadge';
import { Check, X, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function AdminPending() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // 安全检查：如果不是管理员，直接踢回首页
  useEffect(() => {
    if (!loading && !user?.isAdmin) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (token) fetchPending();
  }, [token]);

  const fetchPending = async () => {
    try {
      const data = await apiGetPendingPosts(token);
      setPosts(data);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (postId, action) => {
    try {
      await apiReviewPost(postId, action, token);
      showNotification(`文章已${action === 'approve' ? '通过发布' : '锁定拒绝'}`, 'success');
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-8 flex items-center">
        <span className="w-4 h-4 bg-red-600 rounded-full mr-3 animate-pulse"></span>
        待审核列表
      </h1>

      <div className="grid gap-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-6 items-start">
            {/* 预览图 */}
            {post.coverImage && (
              <img src={post.coverImage.src} className="w-full md:w-48 h-32 object-cover rounded-xl shadow-inner" alt="" />
            )}
            
            {/* 内容详情 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <UserBadge user={post.author} size="sm" />
                <span className="text-xs text-gray-400">{new Date(post.date).toLocaleString()}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 truncate">{post.title}</h2>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">{post.excerpt}</p>
              
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">#{tag}</span>)}
              </div>
            </div>

            {/* 审核按钮 */}
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
        {posts.length === 0 && <div className="text-center py-20 text-gray-400">目前没有任何待审文章，先歇会儿吧 ☕</div>}
      </div>
    </div>
  );
}

export default AdminPending;