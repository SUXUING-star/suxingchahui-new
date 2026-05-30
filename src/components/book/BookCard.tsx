import React from 'react';
import { User, Globe, CheckCircle2, Calendar, Circle } from 'lucide-react';
import { Book } from '@/utils/bookApi';

interface BookCardProps {
    book: Book;
    isSelected: boolean;
    isSelectMode: boolean;
    onToggleSelect: (id: string) => void;
    onClick: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, isSelected, isSelectMode, onToggleSelect, onClick }) => {

    const isRead = book.status === 'read';

    // 日期格式化：2024年12月24日
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    };

    // 动态字号逻辑 - 已经调小
    const getTitleFontSize = (title: string) => {
        const len = title.length;
        if (len <= 5) return 'text-[11px] md:text-lg';    // 原来是 13px / xl
        if (len <= 10) return 'text-[10px] md:text-base';  // 原来是 11px / lg
        return 'text-[9px] md:text-[14px]';               // 原来是 10px / base
    };

    return (
        <div
            onClick={() => isSelectMode ? onToggleSelect(book._id) : onClick(book)}
            className={`group relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-3xl 
                rounded-r-xl rounded-l-sm
                border-r-[4px] md:border-r-[6px] border-b-[4px] md:border-b-[6px] 
                ${isRead
                    ? 'border-r-emerald-200/50 border-b-emerald-300/40 dark:border-r-emerald-900/30 dark:border-b-black shadow-[0_10px_20px_-10px_rgba(16,185,129,0.1)]'
                    : 'border-r-orange-200/50 border-b-orange-300/40 dark:border-r-orange-900/30 dark:border-b-black shadow-[0_10px_20px_-10px_rgba(245,158,11,0.1)]'
                }
                border-t border-l border-white/40 dark:border-white/5
                p-2.5 md:p-5 transition-all active:scale-[0.97] cursor-pointer
                ${isSelected ? 'ring-2 ring-blue-500 bg-blue-500/5' : ''}`}
            style={{
                boxShadow: isRead
                    ? 'inset 12px 0 20px -12px rgba(16,185,129,0.15)'
                    : 'inset 12px 0 20px -12px rgba(245,158,11,0.15)'
            }}
        >
            {/* 1. 右上角物理贴纸：字号加大到10px，全中文 */}
            <div className={`absolute -top-1.5 -right-1 z-10 px-2 py-0.5 rounded-sm shadow-md transform rotate-6 border border-white/20 flex items-center gap-1 ${isRead ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'
                }`}>
                {isRead ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                <span className="text-[10px] font-black tracking-tight">{isRead ? '已读' : '待读'}</span>
            </div>

            {/* 2. 书脊渐变条：模拟圆润书脊的明暗效果 */}
            <div className={`absolute top-0 left-0 bottom-0 w-[4px] md:w-[6px] rounded-l-sm ${isRead
                ? 'bg-gradient-to-b from-emerald-400 via-emerald-250 to-emerald-300'
                : 'bg-gradient-to-b from-orange-400 via-orange-250 to-orange-300'
                } opacity-80`} />

            {/* 装订压痕 */}
            <div className="absolute top-0 left-[10px] md:left-[14px] bottom-0 w-[1px] bg-black/5 dark:bg-white/5 pointer-events-none" />

            {/* 选择模式 */}
            {isSelectMode && (
                <div className="absolute top-3 right-4 z-20">
                    <div className={`w-4 h-4 md:w-6 md:h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white/50 border-gray-300'
                        }`}>
                        {isSelected && <CheckCircle2 size={10} className="text-white md:w-3.5 md:h-3.5" />}
                    </div>
                </div>
            )}

            {/* 标题 */}
            <h3 className={`${getTitleFontSize(book.title)} font-serif font-black tracking-tight line-clamp-1 uppercase mb-1 md:mb-2 group-hover:text-blue-600 transition-colors pr-8`}>
                {book.title}
            </h3>

            {/* 信息栏 */}
            <div className="flex flex-col gap-0.5 md:gap-1.5 mb-2 md:mb-4">
                <div className="flex items-center text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-tighter truncate">
                    <User size={8} className="mr-1 text-blue-500 shrink-0 md:w-3 md:h-3" />
                    <span className="truncate">{book.author}</span>
                    {book.year && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-[6px] md:text-[8px] text-purple-500 font-bold border border-purple-500/10">
                            {book.year}
                        </span>
                    )}
                </div>

                <div className="flex items-center text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-tighter truncate">
                    <Globe size={8} className="mr-1 text-emerald-500 shrink-0 md:w-3 md:h-3" />
                    <span className="truncate">{book.country}</span>

                    {book.createdAt && (
                        <div className="ml-2 flex items-center text-gray-400/80">
                            <Calendar size={8} className="mr-0.5 md:w-3 md:h-3" />
                            {/* 年月日显示 */}
                            <span>{formatDate(book.createdAt)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 简评 - 关键修复：增加 overflow-hidden 和 break-words 确保 line-clamp 生效 */}
            {book.shortReview && (
                <p className="text-[10px] md:text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 
        line-clamp-2 mb-4 font-medium opacity-90 
        border-l-2 border-gray-200 dark:border-white/10 pl-2 
        overflow-hidden text-ellipsis break-words">
                    {book.shortReview}
                </p>
            )}

            {/* 底部栏 */}
            <div className={`pt-1.5 md:pt-3 border-t flex items-center justify-between ${isRead ? 'border-emerald-100 dark:border-emerald-900/20' : 'border-orange-100 dark:border-orange-900/20'}`}>
                <span className={`flex items-center gap-1 text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${isRead
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50'
                    : 'bg-orange-500/10 text-orange-600 border-orange-200/50'
                    }`}>
                    {isRead ? '已阅' : '待读'}
                </span>

                {book.bookType === 'collection' && (
                    <span className="text-[8px] font-black text-gray-400 uppercase">
                        {book.stories?.length || 0} 篇合集
                    </span>
                )}
            </div>
        </div>
    );
};

export default BookCard;