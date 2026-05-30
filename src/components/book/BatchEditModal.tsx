import React, { useState } from 'react';
import { X, Save, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { updateBooksBatch, Book, compareBooksBatch } from '@/utils/bookApi';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
    existingBooks: Book[]; // 传进当前页面显示的书，用来做对比
}

const BatchEditModal: React.FC<Props> = ({ onClose, onSuccess, existingBooks }) => {
    const { token } = useAuth();
    const [rawJson, setRawJson] = useState('');
    const [diffs, setDiffs] = useState<any[]>([]); // 存储检测到的差异
    const [step, setStep] = useState<'input' | 'compare'>('input');
    const [loading, setLoading] = useState(false);

    // 第一步：调对比接口
    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const json = JSON.parse(rawJson);
            // 💡 用封装好的 api 函数
            const res = await compareBooksBatch(json, token);
            if (res.success) {
                setDiffs(res.diffs);
                setStep('compare');
            }
        } catch (e) {
            alert('数据格式有误或后端比对失败');
        } finally {
            setLoading(false);
        }
    };

    // 第二步：确认增量更新
    const handleConfirm = async () => {
        setLoading(true);
        try {
            // 💡 核心修复：后端 compare 返回的是 id，不是 _id
            const payload = diffs.map(d => {
                const changedFields: any = { id: d.id }; // 必须用 d.id
                Object.keys(d.changes).forEach(key => {
                    changedFields[key] = d.changes[key].new;
                });
                return changedFields;
            });

            console.log("准备提交的增量包:", payload); // 你可以开控制台看看 ID 有没有值

            const res = await updateBooksBatch(payload, token);
            if (res.success && res.modifiedCount > 0) {
                onSuccess();
                onClose();
            } else if (res.modifiedCount === 0) {
                alert('后端返回修改行数为 0，请检查数据 ID 是否匹配');
            }
        } catch (err) {
            alert('更新失败，网络或权限问题');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-white dark:bg-[#0a0a0a] rounded-[40px] shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
                <header className="p-8 pb-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black italic text-blue-600">批量修改确认</h2>
                        <p className="text-[10px] font-black text-gray-500 uppercase mt-1">
                            {step === 'input' ? '贴入你修改后的 JSON 数据' : `检测到 ${diffs.length} 条记录有改动`}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X /></button>
                </header>

                <div className="flex-1 overflow-y-auto p-8 pt-2 custom-scrollbar">
                    {step === 'input' ? (
                        <textarea
                            className="w-full h-[400px] bg-gray-100 dark:bg-white/5 rounded-3xl p-6 text-xs font-mono outline-none focus:ring-2 ring-blue-500/30"
                            placeholder="在此贴入 JSON 数据..."
                            value={rawJson}
                            onChange={e => setRawJson(e.target.value)}
                        />
                    ) : (
                        <div className="space-y-4">
                            {diffs.length === 0 ? (
                                <div className="py-20 text-center text-gray-500 font-bold">没有检测到任何变动。</div>
                            ) : (
                                diffs.map((item, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="text-[11px] font-black text-blue-500 mb-2">《{item.title}》</div>
                                        <div className="space-y-1">
                                            {Object.entries(item.changes).map(([field, val]: any) => (
                                                <div key={field} className="flex items-center gap-3 text-[10px] font-bold">
                                                    <span className="text-gray-400 w-20 uppercase">{field}</span>
                                                    <span className="text-red-400 line-through">{val.old || '(空)'}</span>
                                                    <ArrowRight size={10} />
                                                    <span className="text-emerald-500">{val.new || '(空)'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <footer className="p-8 border-t border-white/5 flex gap-3">
                    {step === 'compare' && (
                        <button onClick={() => setStep('input')} className="flex-1 py-4 rounded-2xl font-bold text-gray-500">返回重贴</button>
                    )}
                    <button
                        onClick={step === 'input' ? handleAnalyze : handleConfirm}
                        disabled={loading || (step === 'compare' && diffs.length === 0)}
                        className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20"
                    >
                        {loading ? '保存中...' : (step === 'input' ? '分析数据差异' : '确认覆盖修改')}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default BatchEditModal;