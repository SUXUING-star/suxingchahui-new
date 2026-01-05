// src/pages/MyPosts.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useNotification } from '../context/NotificationContext';
import { apiGetMyPosts, apiDeletePost } from '../utils/postUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import StatusPlaceholder from '../components/common/StatusPlaceholder';
import { Trash2, Edit3, Plus, FileText } from 'lucide-react';

function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, slug: null, title: '' });

  const { token } = useAuth();
  const { openWriteModal } = useModal();
  const { showNotification } = useNotification();
  const isInitialized = useRef(false);

  const fetchPosts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    try {
      const data = await apiGetMyPosts(token);
      setPosts(data || []);
    } catch (err) {
      setError(true);
      showNotification(err.message, 'error');
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
    const slug = deleteModal.slug;
    setDeleteModal(prev => ({ ...prev, isOpen: false }));
    try {
      await apiDeletePost(slug, token);
      showNotification('文章已抹除', 'success');
      setPosts(prev => prev.filter(p => p.slug !== slug));
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  if (loading && posts.length === 0) return <LoadingSpinner />;
  if (error) return <StatusPlaceholder type="error" title="档案库同步失败" onRetry={fetchPosts} />;
  if (!loading && posts.length === 0) return <StatusPlaceholder type="empty" title="空白卷轴" message="您尚未在星图上留下墨宝" onRetry={fetchPosts} />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl px-8 py-4 rounded-[32px] border border-white/20 shadow-xl">
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 flex items-center tracking-tighter uppercase">
            <FileText className="mr-3 text-blue-600" size={32} /> 我的投稿
          </h1>
        </div>
        <button 
          onClick={() => openWriteModal(null, fetchPosts)} 
          className="flex items-center px-8 py-4 bg-blue-600 text-white rounded-[24px] hover:bg-blue-700 transition-all font-black shadow-xl"
        >
          <Plus size={20} className="mr-2" /> 投个新稿
        </button>
      </div>

      <div className="bg-white/85 dark:bg-gray-800/90 backdrop-blur-3xl rounded-[40px] shadow-2xl border border-white/40 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/30 text-gray-400 uppercase text-[10px] tracking-[0.3em] font-black">
                  <th className="px-10 py-6">作品详情</th>
                  <th className="px-10 py-6">审核状态</th>
                  <th className="px-10 py-6 text-right">管理操作</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {posts.map(post => (
                  <tr key={post.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all">
                    <td className="px-10 py-8">
                      <Link to={`/post/${post.id}`} className="font-black text-lg text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors truncate max-w-md block">
                        {post.title}
                      </Link>
                      <div className="flex items-center mt-2 space-x-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span className="text-blue-500">{post.category}</span>
                        <span>{post.getFormattedDate()}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openWriteModal(post.slug, fetchPosts)} className="p-3 text-gray-400 hover:text-blue-500 hover:bg-white dark:hover:bg-gray-700 rounded-2xl shadow-sm transition-all"><Edit3 size={20} /></button>
                        <button onClick={() => setDeleteModal({ isOpen: true, slug: post.slug, title: post.title })} className="p-3 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-700 rounded-2xl shadow-sm transition-all"><Trash2 size={20} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

      <ConfirmModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} onConfirm={handleConfirmDelete} title="确认抹除？" message={`文章《${deleteModal.title}》将被物理删除。`} />
    </div>
  );
}

export default MyPosts;