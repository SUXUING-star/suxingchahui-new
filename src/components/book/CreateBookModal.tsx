import React, { useState, useEffect, useRef } from "react";
// 1. 改为具名引入
import { animate } from "animejs";
import {
  X,
  Save,
  Type,
  Globe2,
  History,
  MessageSquare,
  PlusCircle,
  Circle,
  CheckCircle2,
  ListPlus,
  Trash2,
  Copy,
  Check,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createBook, createBooksBatch } from "@/utils/bookApi";
import { BOOK_COUNTRIES, BOOK_TYPE_MAP, BOOK_TYPES } from "@/models/BookType";
import { INITIAL_BOOK_FORM } from "@/models/BookRequest";

interface CreateBookModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateBookModal: React.FC<CreateBookModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState(INITIAL_BOOK_FORM);
  const [rawText, setRawText] = useState("");
  const [batchPreview, setBatchPreview] = useState<any[]>([]);

  // 2. 显式声明 Ref 类型，避免 null 类型报错
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const EXAMPLE_TEXT =
    "百年孤独 - 马尔克斯 - 1967 - 美洲 - 中长篇 - 哥伦比亚, 围城 - 钱锺书 - 1947 - 中国 - 中长篇 - 中国";

  useEffect(() => {
    if (backdropRef.current) {
      animate(backdropRef.current, {
        opacity: [0, 1],
        duration: 300,
        ease: "linear",
      });
    }
    if (modalRef.current) {
      animate(modalRef.current, {
        scale: [0.9, 1],
        translateY: [40, 0],
        opacity: [0, 1],
        duration: 800,
        ease: "outElastic(1, .8)",
      });
    }
  }, []);

  const handleClose = () => {
    // 3. 过滤并排除 null 节点，确保类型安全
    const targets = [modalRef.current, backdropRef.current].filter(
      Boolean,
    ) as HTMLElement[];
    if (targets.length > 0) {
      animate(targets, {
        opacity: 0,
        scale: 0.9,
        duration: 200,
        ease: "inQuad",
        onComplete: onClose, // 4. complete 改为 onComplete
      });
    } else {
      onClose();
    }
  };

  const handleParse = () => {
    const records = rawText
      .split(/[,，\n]+/)
      .map((r) => r.trim())
      .filter((r) => r);

    const parsed = records.map((record) => {
      const parts = record.split(/[-——;；/\s]+/).map((p) => p.trim());
      const rawType = parts[4] || "novel";
      const matchedType =
        Object.entries(BOOK_TYPE_MAP).find(([label]) =>
          rawType.includes(label),
        )?.[1] || "novel";

      return {
        title: parts[0] || "",
        author: parts[1] || "未知",
        year: parts[2] || "",
        country: parts[3] || "中国",
        specificCountry: parts[5] || "",
        bookType: matchedType,
        status: "unread",
        stories: [],
        shortReview: "",
      };
    });
    setBatchPreview(parsed);
  };

  const copyExample = () => {
    navigator.clipboard.writeText(EXAMPLE_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBatchUpdate = (index: number, field: string, val: any) => {
    const updated = [...batchPreview];
    updated[index][field] = val;
    setBatchPreview(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isBatchMode) {
        if (batchPreview.length === 0) {
          alert("请先识别内容");
          setLoading(false);
          return;
        }
        await createBooksBatch(batchPreview, token);
      } else {
        if (!formData.title || !formData.author) {
          alert("书名和作者是必填项");
          setLoading(false);
          return;
        }
        await createBook(formData, token);
      }
      onSuccess();
      handleClose();
    } catch (err) {
      alert("保存记录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={handleClose}
      />

      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white dark:bg-[#121212] rounded-[32px] shadow-2xl border border-white/10 flex flex-col max-h-[90vh]"
      >
        <header className="p-6 pb-2 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-xl font-black tracking-tight">
              {isBatchMode ? "批量导入" : "记录新书"}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsBatchMode(!isBatchMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${isBatchMode ? "bg-blue-600 text-white shadow-lg" : "bg-gray-100 dark:bg-white/5 text-gray-400"}`}
            >
              <ListPlus size={14} /> {isBatchMode ? "单条模式" : "批量记录"}
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:bg-white/5 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
          {isBatchMode ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase">
                    贴入记录 (书名-作者-年份-地区-体裁-国家)
                  </label>
                  <button
                    type="button"
                    onClick={copyExample}
                    className="text-[9px] font-black text-blue-600 flex items-center gap-1 hover:underline"
                  >
                    {copied ? (
                      <>
                        <Check size={10} /> 已复制
                      </>
                    ) : (
                      <>
                        <Copy size={10} /> 复制示例格式
                      </>
                    )}
                  </button>
                </div>

                <div
                  onClick={() => setRawText(EXAMPLE_TEXT)}
                  className="bg-blue-50/50 dark:bg-blue-600/5 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 cursor-pointer hover:bg-blue-100/50 transition-all"
                >
                  <p className="text-[10px] text-blue-600/70 font-mono leading-relaxed break-all">
                    {EXAMPLE_TEXT}
                  </p>
                </div>

                <textarea
                  className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-2xl px-4 py-4 text-sm font-medium min-h-[140px] focus:ring-2 ring-blue-500/20 outline-none resize-none"
                  placeholder="书名 - 作者 - 年代 - 地区 - 体裁 - 具体国家..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleParse}
                  className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-black text-xs shadow-lg active:scale-95 transition-all"
                >
                  识别并预览记录
                </button>
              </div>

              {batchPreview.length > 0 && (
                <div className="space-y-4 pb-4">
                  <label className="text-[10px] font-black uppercase text-blue-600 px-1">
                    识别预览 ({batchPreview.length} 条)
                  </label>
                  <div className="space-y-3">
                    {batchPreview.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 dark:bg-white/3 p-5 rounded-[24px] border border-gray-100 dark:border-white/5 space-y-4 relative"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setBatchPreview((p) =>
                              p.filter((_, i) => i !== idx),
                            )
                          }
                          className="absolute top-4 right-4 text-gray-300 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-xs font-bold outline-none focus:border-blue-500"
                            value={item.title}
                            onChange={(e) =>
                              handleBatchUpdate(idx, "title", e.target.value)
                            }
                            placeholder="书名"
                          />
                          <input
                            className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-xs font-bold outline-none focus:border-blue-500"
                            value={item.author}
                            onChange={(e) =>
                              handleBatchUpdate(idx, "author", e.target.value)
                            }
                            placeholder="作者"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <input
                            className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-[10px] font-bold outline-none focus:border-blue-500"
                            value={item.year}
                            onChange={(e) =>
                              handleBatchUpdate(idx, "year", e.target.value)
                            }
                            placeholder="年代"
                          />
                          <input
                            className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-[10px] font-bold outline-none focus:border-blue-500"
                            value={item.specificCountry}
                            onChange={(e) =>
                              handleBatchUpdate(
                                idx,
                                "specificCountry",
                                e.target.value,
                              )
                            }
                            placeholder="具体国家"
                          />
                          <select
                            className="bg-transparent border-b border-gray-200 dark:border-white/10 text-[10px] font-bold outline-none cursor-pointer"
                            value={item.country}
                            onChange={(e) =>
                              handleBatchUpdate(idx, "country", e.target.value)
                            }
                          >
                            {BOOK_COUNTRIES.map((c) => (
                              <option key={c} value={c.trim()}>
                                {c.trim()}
                              </option>
                            ))}
                          </select>
                          <select
                            className="bg-transparent border-b border-gray-200 dark:border-white/10 text-[10px] font-bold outline-none cursor-pointer"
                            value={item.bookType}
                            onChange={(e) =>
                              handleBatchUpdate(idx, "bookType", e.target.value)
                            }
                          >
                            {BOOK_TYPES.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* --- 单条录入 --- */
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 px-1">
                    <Type size={12} className="text-blue-600" /> 书籍名称
                  </label>
                  <input
                    required
                    className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 ring-blue-500/30 outline-none transition-all"
                    placeholder="书名"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 px-1">
                    <Globe2 size={12} className="text-blue-600" /> 作者
                  </label>
                  <input
                    required
                    className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 ring-blue-500/30 outline-none transition-all"
                    placeholder="作者"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 px-1">
                    <History size={12} className="text-blue-600" /> 年代 / 年份
                  </label>
                  <input
                    className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 ring-blue-500/30 transition-all"
                    placeholder="例如：1967"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 px-1">
                    <MapPin size={12} className="text-blue-600" /> 具体国家
                  </label>
                  <input
                    className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 ring-blue-500/30 transition-all"
                    placeholder="如：法国"
                    value={formData.specificCountry}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specificCountry: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 px-1">
                  阅读状态
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "read" })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${formData.status === "read" ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 shadow-sm" : "border-transparent bg-gray-100 dark:bg-white/5 text-gray-400"}`}
                  >
                    <CheckCircle2 size={16} />{" "}
                    <span className="font-bold text-xs">已读记录</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, status: "unread" })
                    }
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${formData.status === "unread" ? "border-orange-500 bg-orange-500/5 text-orange-600 shadow-sm" : "border-transparent bg-gray-100 dark:bg-white/5 text-gray-400"}`}
                  >
                    <Circle size={16} />{" "}
                    <span className="font-bold text-xs">加入待读</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 px-1">
                  作品体裁
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BOOK_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, bookType: type.id })
                      }
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${formData.bookType === type.id ? "border-blue-600 bg-blue-600/5 text-blue-600 shadow-sm" : "border-transparent bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"}`}
                    >
                      <type.icon size={16} />{" "}
                      <span className="font-bold text-xs">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 px-1">
                  作者所属地区 (大类)
                </label>
                <div className="flex flex-wrap gap-2">
                  {BOOK_COUNTRIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, country: c.trim() })
                      }
                      className={`px-4 py-1.5 rounded-lg font-bold text-[10px] transition-all border ${formData.country === c.trim() ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/5 text-gray-500 hover:border-blue-300"}`}
                    >
                      {c.trim()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pb-4">
                <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 px-1">
                  <MessageSquare size={12} className="text-blue-600" /> 阅读随笔
                </label>
                <textarea
                  className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-3 font-medium text-sm min-h-[80px] focus:ring-2 ring-blue-500/30 transition-all resize-none outline-none"
                  placeholder="记录一些心得..."
                  value={formData.shortReview}
                  onChange={(e) =>
                    setFormData({ ...formData, shortReview: e.target.value })
                  }
                />
              </div>
            </div>
          )}
        </div>

        <footer className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 rounded-b-[32px] flex gap-3 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-3.5 rounded-xl font-bold text-xs text-gray-500 hover:bg-gray-100"
          >
            取消
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] bg-blue-600 text-white px-8 py-3.5 rounded-xl font-black text-xs tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isBatchMode ? `保存这 ${batchPreview.length} 条记录` : "完成记录"}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CreateBookModal;
