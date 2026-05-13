import React, { useState } from 'react';
import { X, Download, FileJson, FileText, Filter, Database, Check, CheckSquare, Square } from 'lucide-react';
import { getExportData } from '@/utils/bookApi';
import { useAuth } from '@/context/AuthContext';

// 可选字段配置
const EXPORTABLE_FIELDS = [
  { id: 'title', label: '书名', default: true },
  { id: 'author', label: '作者', default: true },
  { id: 'year', label: '年代/年份', default: true },
  { id: 'country', label: '地区', default: true },
  { id: 'bookType', label: '体裁', default: true },
  { id: 'status', label: '阅读状态', default: true },
  { id: 'stories', label: '收录篇目', default: true },
  { id: 'shortReview', label: '阅读随笔', default: true },
  { id: 'longReview', label: '详细长评', default: false },
];

interface ExportModalProps {
  currentFilters: any;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ currentFilters, onClose }) => {
  const { token } = useAuth();
  const [format, setFormat] = useState<'json' | 'text'>('text');
  const [scope, setScope] = useState<'filtered' | 'all'>('filtered');
  const [selectedFields, setSelectedFields] = useState<string[]>(
    EXPORTABLE_FIELDS.filter(f => f.default).map(f => f.id)
  );
  const [loading, setLoading] = useState(false);

  const toggleField = (id: string) => {
    setSelectedFields(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleExecuteExport = async () => {
    if (selectedFields.length === 0) return alert('至少选择一个导出字段');
    setLoading(true);
    try {
      const params = {
        ...(scope === 'all' ? {} : currentFilters),
        format,
        fields: selectedFields.join(',') // 传给后端的字段串
      };
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
      
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0f0f0f] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        <header className="p-8 pb-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter">DATA <span className="text-blue-600">EXPORT</span></h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">定制化馆藏导出</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </header>

        <div className="p-8 pt-4 space-y-8 overflow-y-auto custom-scrollbar">
          {/* 格式选择 */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Database size={12} /> 1. 导出格式
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'text', label: '纯文本 (TXT)', icon: FileText },
                { id: 'json', label: '结构化 (JSON)', icon: FileJson }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFormat(item.id as any)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    format === item.id ? 'border-blue-600 bg-blue-600/5' : 'border-transparent bg-gray-100 dark:bg-white/5'
                  }`}
                >
                  <item.icon size={20} className={format === item.id ? 'text-blue-600' : 'text-gray-500'} />
                  <span className={`font-black text-xs ${format === item.id ? 'text-blue-600' : ''}`}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 字段选择 - 新增 */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <CheckSquare size={12} /> 2. 选择导出字段
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EXPORTABLE_FIELDS.map(field => (
                <button
                  key={field.id}
                  onClick={() => toggleField(field.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-left ${
                    selectedFields.includes(field.id)
                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-600'
                    : 'border-transparent bg-gray-100 dark:bg-white/5 text-gray-500'
                  }`}
                >
                  {selectedFields.includes(field.id) ? <CheckSquare size={14} /> : <Square size={14} />}
                  <span className="text-[11px] font-bold">{field.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 范围选择 */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Filter size={12} /> 3. 导出范围
            </label>
            <div className="flex gap-2">
              {[
                { id: 'filtered', label: '当前结果' },
                { id: 'all', label: '全部馆藏' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setScope(item.id as any)}
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    scope === item.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="p-8 shrink-0">
          <button
            onClick={handleExecuteExport}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Download size={18} /> 确认导出任务</>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ExportModal;