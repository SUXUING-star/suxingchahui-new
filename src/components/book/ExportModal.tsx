import React, { useState } from 'react';
import { X, Download, FileJson, FileText, Filter, Database, CheckSquare, Square, Calendar } from 'lucide-react';
import { EXPORTABLE_FIELDS, getExportData } from '@/utils/bookApi';
import { useAuth } from '@/context/AuthContext';

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

  // 💡 新增：时间区间状态
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(false);

  const toggleField = (id: string) => {
    setSelectedFields(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleExecuteExport = async () => {
    if (selectedFields.length === 0) return alert('至少选择一个导出内容');
    setLoading(true);
    try {
      // 💡 构造参数时，只有有值才塞进去
      const params: any = {
        ...(scope === 'all' ? {} : currentFilters),
        format,
        fields: selectedFields.join(','),
      };

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

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
      alert('导出失败');
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
            <h2 className="text-2xl font-black italic tracking-tighter text-blue-600">数据导出</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">导出你的阅读记录存档</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </header>

        <div className="p-8 pt-4 space-y-8 overflow-y-auto custom-scrollbar">
          {/* 1. 格式选择 */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Database size={12} /> 1. 文件格式
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'text', label: '纯文本 (TXT)', icon: FileText },
                { id: 'json', label: '结构化数据 (JSON)', icon: FileJson }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFormat(item.id as any)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${format === item.id ? 'border-blue-600 bg-blue-600/5' : 'border-transparent bg-gray-100 dark:bg-white/5'
                    }`}
                >
                  <item.icon size={20} className={format === item.id ? 'text-blue-600' : 'text-gray-500'} />
                  <span className={`font-black text-xs ${format === item.id ? 'text-blue-600' : ''}`}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. 时间范围选择 - 💡 这是新增的 */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Calendar size={12} /> 2. 选择存档时间范围 (可选)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-400 ml-1">开始日期</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 ring-blue-500/20"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-400 ml-1">结束日期</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* 3. 字段选择 */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <CheckSquare size={12} /> 3. 选择导出内容
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EXPORTABLE_FIELDS.map(field => (
                <button
                  key={field.id}
                  onClick={() => toggleField(field.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-left ${selectedFields.includes(field.id)
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

          {/* 4. 范围选择 */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Filter size={12} /> 4. 导出记录范围
            </label>
            <div className="flex gap-2">
              {[
                { id: 'filtered', label: '按当前筛选' },
                { id: 'all', label: '全部记录' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setScope(item.id as any)}
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${scope === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-500'
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
              <><Download size={18} /> 确认导出</>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ExportModal;