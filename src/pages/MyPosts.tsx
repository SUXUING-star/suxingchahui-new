import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useNotification } from '../context/NotificationContext';
import { apiGetMyPosts, apiDeletePost } from '../utils/postApi';
import { PostResponse } from '../models/PostResponse';

import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import StatusPlaceholder from '../components/common/StatusPlaceholder';
import { Trash2, Edit3, Plus, FileText, ChevronRight, Clock, Tag } from 'lucide-react';

interface DeleteModalState {
  isOpen: boolean;
  slug: string | null;
  title: string;
}

const MyPosts: React.FC = () => {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({ isOpen: false, slug: null, title: '' });

  const { token } = useAuth();
  const { openWriteModal } = useModal();
  const { showNotification } = useNotification();
  const isInitialized = useRef<boolean>(false);

  const fetchPosts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    try {
      const data = await apiGetMyPosts(token);
      setPosts(data || []);
    } catch (err: any) {
      setError(true);
      showNotification(err.message || '获取文章失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, showNotification]);

  useEffect(() => {
    if (!isInitialized.current && token) {
      fetchPosts();
      isInitialized.current = true;
    }
  }, [token, fetchPosts]);

  const handleConfirmDelete = async () => {
    const { slug } = deleteModal;
    if (!slug || !token) return;
    
    setDeleteModal({ isOpen: false, slug: null, title: '' });
    try {
      await apiDeletePost(slug, token);
      showNotification('文章已抹除', 'success');
      setPosts(prev => prev.filter(p => p.slug !== slug));
    } catch (err: any) {
      showNotification(err.message || '删除失败', 'error');
    }
  };

  if (loading && posts.length === 0) return <LoadingSpinner />;
  if (error) return <StatusPlaceholder type="error" title="档案库同步失败" onRetry={fetchPosts} />;
  if (!loading && posts.length === 0) return <StatusPlaceholder type="empty" title="空白卷轴" message="您尚未在星图上留下墨宝" onRetry={fetchPosts} />;

   return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* 标题和新建按钮 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12">
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/20 dark:border-white/10 shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 flex items-center tracking-tighter uppercase">
            <FileText className="mr-3 text-blue-500" size={28} />
            我的投稿
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-semibold">管理你发布的所有星火内容</p>
        </div>
        <button 
          onClick={() => openWriteModal(null, fetchPosts)} 
          className="flex-shrink-0 flex items-center px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus size={18} className="mr-2" /> 投个新稿
        </button>
      </div>

      {/* --- 核心修改：列表替换表格 --- */}
      <div className="space-y-4">
        {posts.map(post => (
          <div 
            key={post.id} 
            className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row items-stretch"
          >
            {/* 左侧内容区 */}
            <Link to={`/post/${post.slug}`} className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <StatusBadge status={post.status} />
                  <ChevronRight size={20} className="text-gray-400 sm:hidden group-hover:translate-x-1 transition-transform" />
                </div>
                <h2 className="font-black text-xl text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {post.title}
                </h2>
              </div>
              <div className="flex items-center mt-4 space-x-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                <span className="flex items-center"><Tag size={12} className="mr-1.5 text-blue-500" />{post.category}</span>
                <span className="flex items-center"><Clock size={12} className="mr-1.5" />{post.getFormattedDate()}</span>
              </div>
            </Link>

            {/* 右侧操作区 (sm屏幕以上合并到右侧) */}
            <div className="flex-shrink-0 flex sm:flex-col items-center justify-end sm:justify-center p-4 sm:px-6 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-700/50 space-x-2 sm:space-x-0 sm:space-y-2">
              <button 
                onClick={() => openWriteModal(post.slug, fetchPosts)} 
                className="p-3 text-gray-500 hover:text-blue-500 bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-all"
                aria-label="编辑"
              >
                <Edit3 size={18} />
              </button>
              <button 
                onClick={() => setDeleteModal({ isOpen: true, slug: post.slug, title: post.title })} 
                className="p-3 text-gray-500 hover:text-red-500 bg-gray-50 dark:bg-gray-800/50 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-all"
                aria-label="删除"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* --- 核心修改结束 --- */}

      <ConfirmModal 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} 
        onConfirm={handleConfirmDelete} 
        title="确认抹除？" 
        message={`文章《${deleteModal.title}》将被永久删除，此操作不可逆。`} 
      />
    </div>
  );
};

export default MyPosts;