import React, { useState } from 'react';
import { X, Download, FileJson, FileText, Filter, Database, Check } from 'lucide-react';
import { getExportData } from '@/utils/bookApi';
import { useAuth } from '@/context/AuthContext';

interface ExportModalProps {
  currentFilters: any;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ currentFilters, onClose }) => {
  const { token } = useAuth();
  const [format, setFormat] = useState<'json' | 'text'>('text');
  const [scope, setScope] = useState<'filtered' | 'all'>('filtered');
  const [loading, setLoading] = useState(false);

  const handleExecuteExport = async () => {
    setLoading(true);
    try {
      // 如果选“全部”，则清空筛选条件参数
      const params = scope === 'all' ? { format } : { ...currentFilters, format };
      const res = await getExportData(params, token);

      if (res.success) {
        const content = format === 'json' ? JSON.stringify(res.payload, null, 2) : res.payload;
        const blob = new Blob([content], { type: res.type });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', res.filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        onClose();
      }
    } catch (err) {
      alert('导出任务失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-[#0f0f0f] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95">
        <header className="p-8 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter">DATA <span className="text-blue-600">EXPORT</span></h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">导出馆藏文献记录</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </header>

        <div className="p-8 pt-4 space-y-8">
          {/* 格式选择 */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Database size={12} /> 导出格式 / Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'text', label: '纯文本 (TXT)', icon: FileText, desc: '适合阅读与分发' },
                { id: 'json', label: '结构化 (JSON)', icon: FileJson, desc: '适合数据备份' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFormat(item.id as any)}
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all ${
                    format === item.id 
                    ? 'border-blue-600 bg-blue-600/5' 
                    : 'border-transparent bg-gray-100 dark:bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <item.icon size={20} className={format === item.id ? 'text-blue-600' : 'text-gray-500'} />
                  <span className={`font-black text-xs mt-3 ${format === item.id ? 'text-blue-600' : ''}`}>{item.label}</span>
                  <span className="text-[9px] text-gray-500 mt-1">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 范围选择 */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Filter size={12} /> 导出范围 / Scope
            </label>
            <div className="space-y-2">
              {[
                { id: 'filtered', label: '当前筛选结果', icon: Filter },
                { id: 'all', label: '全部馆藏记录', icon: Database }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setScope(item.id as any)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                    scope === item.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={16} />
                    <span className="font-black text-[11px] uppercase tracking-widest">{item.label}</span>
                  </div>
                  {scope === item.id && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleExecuteExport}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Download size={18} />
                确认导出任务
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;