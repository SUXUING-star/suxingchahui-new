import React, { useEffect, useRef } from "react";
import {
  X,
  Send,
  Loader2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  Bookmark,
  Eye,
  Edit3,
} from "lucide-react";
import { animate } from "animejs";

import EditorTextArea from "./EditorTextArea";
import EditorCover from "./EditorCover";
import ConfirmModal from "../../common/ConfirmModal";
import { Block, BlockType } from "./WriteModal";
import EditorStepContent from "./EditorStepContent";

interface WriteModalLayoutProps {
  onClose: () => void;
  editSlug?: string | null;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  mode: "edit" | "preview";
  setMode: React.Dispatch<React.SetStateAction<"edit" | "preview">>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  cover: { file: File | null; preview: string };
  setCover: React.Dispatch<
    React.SetStateAction<{ file: File | null; preview: string }>
  >;
  blocks: Block[];
  allCategories: string[];
  isSubmitting: boolean;
  isLoadingData: boolean;
  isSelectOpen: boolean;
  setIsSelectOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDeleteConfirmOpen: boolean;
  setIsDeleteConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMetaDone: boolean;
  isCoverDone: boolean;
  isContentDone: boolean;
  isAdmin: boolean;
  isTopped: boolean;
  setIsTopped: (val: boolean) => void;
  insertBlock: (index: number, type: BlockType) => void;
  moveBlock: (index: number, direction: "up" | "down") => void;
  updateBlock: (id: number, field: keyof Block, value: any) => void;
  removeBlock: (id: number) => void;
  handleImageSelect: (
    e: React.ChangeEvent<HTMLInputElement>,
    blockId: number,
  ) => void;
  handleCoverSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleNewCategoryKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleFinalPublish: () => void;
  handleDeletePost: () => void;
}

const WriteModalLayout: React.FC<WriteModalLayoutProps> = ({
  onClose,
  editSlug,
  step,
  setStep,
  mode,
  setMode,
  title,
  setTitle,
  category,
  setCategory,
  tags,
  setTags,
  cover,
  setCover,
  blocks,
  allCategories,
  isSubmitting,
  isLoadingData,
  isSelectOpen,
  setIsSelectOpen,
  isDeleteConfirmOpen,
  setIsDeleteConfirmOpen,
  isMetaDone,
  isCoverDone,
  isContentDone,
  isAdmin,
  isTopped,
  setIsTopped,
  insertBlock,
  moveBlock,
  updateBlock,
  removeBlock,
  handleImageSelect,
  handleCoverSelect,
  handleTagKeyDown,
  handleNewCategoryKeyDown,
  handleFinalPublish,
  handleDeletePost,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // 进场动画
  useEffect(() => {
    if (modalRef.current) {
      animate(modalRef.current, {
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 600,
        ease: "outExpo",
      });
    }
  }, []);

  // 退出动画并关闭
  const handleClose = () => {
    if (modalRef.current) {
      animate(modalRef.current, {
        opacity: [1, 0],
        scale: [1, 0.95],
        duration: 400,
        ease: "inExpo",
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  const steps = [
    { id: 1, title: "核心元数据", isDone: isMetaDone },
    { id: 2, title: "视觉封面", isDone: isCoverDone },
    { id: 3, title: "内容创作", isDone: isContentDone },
  ];

  return (
    // 手机端及桌面端均保留 p-4 的外部边距，使模态框在手机上以优雅卡片呈现，不贴死边缘
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 overflow-hidden">
      <div
        className="absolute inset-0 bg-white/10 dark:bg-black/40 backdrop-blur-[50px]"
        onClick={handleClose}
      />

      {/*
        保持 h-[95vh] 高度，宽度优化为最大 max-w-5xl。
        圆角恢复为极致的 rounded-[32px] 强化视觉质感。
      */}
      <div
        ref={modalRef}
        className="modal-canvas relative w-full max-w-5xl h-[95vh] flex flex-col bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl rounded-[24px] sm:rounded-[32px] shadow-2xl border border-white/40 dark:border-white/5 overflow-hidden opacity-0"
      >
        {isLoadingData ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="font-bold text-gray-400 text-xs tracking-[0.4em] uppercase">
              载入数据...
            </p>
          </div>
        ) : (
          <>
            {/* 顶部导航 */}
            <div className="px-4 sm:px-10 py-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-white/50 dark:bg-black/20 flex-shrink-0 gap-2">
              <div className="flex items-center space-x-1 sm:space-x-3">
                {steps.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStep(s.id)}
                    className={`flex items-center space-x-1 sm:space-x-2 px-2.5 py-1.5 rounded-lg transition-all ${step === s.id ? "bg-blue-50 dark:bg-blue-900/30" : "hover:bg-gray-50 dark:hover:bg-white/5"}`}
                  >
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-sm transition-all ${
                        s.isDone
                          ? "bg-green-500 text-white"
                          : step === s.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                      }`}
                    >
                      {s.isDone && step !== s.id ? (
                        <Check
                          size={12}
                          strokeWidth={3}
                          className="sm:w-[14px] sm:h-[14px]"
                        />
                      ) : (
                        s.id
                      )}
                    </div>
                    {/* 手机端隐藏文本，防止挤压变形 */}
                    <span
                      className={`font-bold text-xs hidden sm:inline ${step === s.id ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}
                    >
                      {s.title}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                {isAdmin && (
                  <button
                    onClick={() => setIsTopped(!isTopped)}
                    className={`flex items-center px-2.5 sm:px-4 py-2 rounded-xl font-bold text-xs transition-all border ${
                      isTopped
                        ? "bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200 dark:border-red-800 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        : "bg-white dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 hover:border-red-400"
                    }`}
                  >
                    <Bookmark
                      size={14}
                      className={`transition-all ${isTopped ? "fill-red-600 scale-110" : ""}`}
                    />
                    <span className="hidden sm:inline ml-1.5">
                      {isTopped ? "已置顶" : "设为置顶"}
                    </span>
                  </button>
                )}

                {editSlug && (
                  <button
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="flex items-center px-2.5 sm:px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 font-bold text-xs hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline ml-1.5">抹除</span>
                  </button>
                )}

                <button
                  onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
                  className="flex items-center px-2.5 sm:px-4 py-2 rounded-xl bg-white dark:bg-gray-800 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  {mode === "edit" ? (
                    <>
                      <Eye size={14} className="text-blue-500" />
                      <span className="hidden sm:inline ml-1.5">预览</span>
                    </>
                  ) : (
                    <>
                      <Edit3 size={14} className="text-green-500" />
                      <span className="hidden sm:inline ml-1.5">编辑</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleClose}
                  className="p-2 bg-gray-100 dark:bg-white/10 text-gray-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/*
              主内容区域：
              - 左右边距大幅拓宽：手机端 px-6，平板 sm:px-24，中等屏幕 md:px-32，大屏 lg:px-40。
              - 上下内边距设为 py-10 保证通透。
            */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-24 md:px-32 lg:px-40 py-10 custom-scrollbar relative">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
                {step === 1 && (
                  <div className="space-y-8">
                    <EditorTextArea
                      value={title}
                      onChange={(v: string) => setTitle(v)}
                      placeholder="输入文章标题..."
                      className="text-2xl sm:text-3xl font-bold dark:text-white placeholder-gray-300 dark:placeholder-gray-700 leading-tight bg-transparent"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="relative z-20">
                        <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2 block ml-1">
                          文章分类
                        </label>
                        <button
                          onClick={() => setIsSelectOpen(!isSelectOpen)}
                          className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl font-bold dark:text-white border border-gray-100 dark:border-gray-700 hover:border-blue-400 transition-colors"
                        >
                          <span>{category || "选择分类"}</span>
                          <ChevronDown
                            size={18}
                            className={
                              isSelectOpen
                                ? "rotate-180 transition-transform"
                                : "transition-transform"
                            }
                          />
                        </button>
                        {isSelectOpen && (
                          <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95">
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                              {allCategories.map((c) => (
                                <button
                                  key={c}
                                  onClick={() => {
                                    setCategory(c);
                                    setIsSelectOpen(false);
                                  }}
                                  className="w-full p-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-left font-bold text-sm dark:text-gray-200"
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                            <div className="p-2 border-t border-gray-100 dark:border-white/5">
                              <input
                                placeholder="输入新分类回车..."
                                className="w-full p-2 bg-gray-50 dark:bg-gray-900 rounded-lg outline-none dark:text-white font-bold text-xs"
                                onKeyDown={handleNewCategoryKeyDown}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2 block ml-1">
                          文章标签
                        </label>
                        <input
                          className="w-full bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl font-bold dark:text-white outline-none border border-gray-100 dark:border-gray-700 focus:border-emerald-400 transition-colors"
                          placeholder="输入标签按回车"
                          onKeyDown={handleTagKeyDown}
                        />
                        <div className="flex flex-wrap gap-2 mt-3">
                          {tags.map((t) => (
                            <span
                              key={t}
                              className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="max-w-2xl mx-auto">
                    <EditorCover
                      preview={cover.preview}
                      onSelect={handleCoverSelect}
                      onRemove={() => setCover({ file: null, preview: "" })}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="max-w-5xl mx-auto">
                    <EditorStepContent
                      mode={mode}
                      title={title}
                      blocks={blocks}
                      insertBlock={insertBlock}
                      moveBlock={moveBlock}
                      updateBlock={updateBlock}
                      removeBlock={removeBlock}
                      handleImageSelect={handleImageSelect}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 底部导航 */}
            <div className="px-6 sm:px-10 py-5 sm:py-6 bg-white/80 dark:bg-black/40 border-t border-gray-100 dark:border-white/5 flex items-center justify-between flex-shrink-0 backdrop-blur-md">
              <button
                onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                disabled={step === 1}
                className="flex items-center gap-2 font-bold text-gray-400 hover:text-blue-500 text-xs disabled:opacity-0 transition-all"
              >
                <ChevronUp size={18} /> <span>上一步</span>
              </button>
              <div className="flex gap-2.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? "bg-blue-600 w-8" : "bg-gray-200 dark:bg-gray-700 w-2"}`}
                  />
                ))}
              </div>
              {step < 3 ? (
                <button
                  onClick={() => setStep((prev) => Math.min(3, prev + 1))}
                  className="flex items-center gap-2 font-bold text-gray-400 hover:text-blue-500 text-xs transition-all"
                >
                  <span>下一步</span> <ChevronDown size={18} />
                </button>
              ) : (
                <button
                  onClick={handleFinalPublish}
                  disabled={isSubmitting}
                  className="px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                  ) : (
                    <Send className="mr-2" size={16} />
                  )}{" "}
                  {editSlug ? "保存更改" : "发布文章"}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeletePost}
        title="确认删除"
        message={`文章《${title}》将被删除且无法恢复。`}
        confirmText="彻底删除"
        type="danger"
      />
    </div>
  );
};

export default WriteModalLayout;
