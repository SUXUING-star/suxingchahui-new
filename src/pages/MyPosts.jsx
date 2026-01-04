// src/pages/MyPosts.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext'; // <-- 引入新指挥部
import { useNotification } from '../context/NotificationContext';
import { apiGetMyPosts, apiDeletePost } from '../utils/postUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import { Trash2, Edit3, ExternalLink, Plus, FileText } from 'lucide-react';

function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, slug: null, title: '' });

  const { token } = useAuth();
  const { openWriteModal } = useModal(); // 从全局弹窗上下文获取方法
  const { showNotification } = useNotification();

  useEffect(() => {
    if (token) fetchPosts();
  }, [token]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await apiGetMyPosts(token);
      setPosts(data);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    const slug = deleteModal.slug;
    setDeleteModal(prev => ({ ...prev, isOpen: false }));
    try {
      await apiDeletePost(slug, token);
      showNotification('文章已永久删除', 'success');
      setPosts(prev => prev.filter(p => p.slug !== slug));
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 顶部状态与操作 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 flex items-center tracking-tighter uppercase">
            <FileText className="mr-3 text-blue-600" size={32} /> 我的投稿
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-bold">已同步云端 {posts.length} 篇创作</p>
        </div>
        <button 
          onClick={() => openWriteModal(null, fetchPosts)} 
          className="flex items-center px-8 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black shadow-xl shadow-blue-500/20 active:scale-95"
        >
          <Plus size={20} className="mr-2" /> 投个新稿
        </button>
      </div>

      {/* 列表区域 */}
      <div className="bg-white dark:bg-gray-800 rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {posts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/30 text-gray-400 uppercase text-[10px] tracking-[0.3em] font-black">
                  <th className="px-10 py-6">作品详情</th>
                  <th className="px-10 py-6">当前状态</th>
                  <th className="px-10 py-6 text-right">管理操作</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {posts.map(post => (
                  <tr key={post.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all">
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <Link to={`/post/${post.id}`} className="font-black text-lg text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors truncate max-w-md">
                          {post.title}
                        </Link>
                        <div className="flex items-center mt-2 space-x-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span className="text-blue-500">{post.category}</span>
                            <span>{post.getFormattedDate()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openWriteModal(post.slug, fetchPosts)} // 编辑成功后刷列表
                          className="p-3 text-gray-400 hover:text-blue-500 hover:bg-white dark:hover:bg-gray-700 rounded-2xl shadow-sm transition-all"
                          title="修改文章"
                        >
                          <Edit3 size={20} />
                        </button>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, slug: post.slug, title: post.title })}
                          className="p-3 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-700 rounded-2xl shadow-sm transition-all"
                          title="永久删除"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-32 text-center text-gray-400 font-black uppercase tracking-[0.5em] text-sm">草稿箱空空如也</div>
        )}
      </div>

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="确认抹除星火？"
        message={`文章《${deleteModal.title}》将被永久从宿星服务器删除。`}
      />
    </div>
  );
}

export default MyPosts;