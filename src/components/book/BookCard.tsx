import React from 'react';
import { User, Globe, CheckCircle2, Calendar } from 'lucide-react';
import { Book } from '@/utils/bookApi';

interface BookCardProps {
    book: Book;
    isSelected: boolean;
    isSelectMode: boolean;
    onToggleSelect: (id: string) => void;
    onClick: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, isSelected, isSelectMode, onToggleSelect, onClick }) => {
    
    // 1. 动态字号逻辑（完全保留）
    const getTitleFontSize = (title: string) => {
        const len = title.length;
        if (len <= 5) return 'text-[13px] md:text-xl';
        if (len <= 10) return 'text-[11px] md:text-lg';
        return 'text-[10px] md:text-base';
    };

    return (
        <div
            onClick={() => isSelectMode ? onToggleSelect(book._id) : onClick(book)}
            /* 
               伪3D书本构造：
               - border-r-[4px] border-b-[5px]: 模拟书页厚度（内缩，不溢出）
               - shadow-[inset_10px_0_15px_-10px_rgba(0,0,0,0.2)]: 模拟书脊翻开处的凹陷阴影
            */
            className={`group relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-3xl 
                rounded-r-xl rounded-l-sm
                border-r-[4px] md:border-r-[6px] border-b-[4px] md:border-b-[6px] 
                border-r-gray-200/80 border-b-gray-300/60 dark:border-r-gray-800 dark:border-b-black
                border-t border-l border-white/40 dark:border-white/5
                p-2.5 md:p-5 transition-all active:scale-[0.97] cursor-pointer
                ${isSelected ? 'ring-2 ring-blue-500 bg-blue-500/5' : ''}`}
            style={{
                boxShadow: 'inset 12px 0 20px -12px rgba(0,0,0,0.15)'
            }}
        >
            {/* 书脊装饰线条：模拟装订压痕 */}
            <div className="absolute top-0 left-[10px] md:left-[14px] bottom-0 w-[1px] bg-black/5 dark:bg-white/5 pointer-events-none" />

            {isSelectMode && (
                <div className="absolute top-1.5 right-1.5 z-20">
                    <div className={`w-4 h-4 md:w-6 md:h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white/50 border-gray-300'
                        }`}>
                        {isSelected && <CheckCircle2 size={10} className="text-white md:w-3.5 md:h-3.5" />}
                    </div>
                </div>
            )}

            {/* 标题：加了 font-serif 更有书卷气 */}
            <h3 className={`${getTitleFontSize(book.title)} font-serif font-black tracking-tight line-clamp-1 uppercase mb-1 md:mb-2 group-hover:text-blue-600 transition-colors pr-4 md:pr-0`}>
                {book.title}
            </h3>

            {/* 信息栏：增加了时间显示，防止底部重叠 */}
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
                    
                    {/* 时间记录挪到这里，用 Calendar 图标区分 */}
                    {book.createdAt && (
                        <div className="ml-2 flex items-center text-gray-400/80">
                            <Calendar size={8} className="mr-0.5 md:w-3 md:h-3" />
                            <span>{new Date(book.createdAt).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 简评（完全保留） */}
            {book.shortReview && (
                <p className="hidden md:block text-[10px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 font-medium opacity-90 border-l-2 border-gray-200 dark:border-white/10 pl-2">
                    {book.shortReview}
                </p>
            )}

            {/* 底部栏：现在左右绝对不会重叠了 */}
            <div className="pt-1.5 md:pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest px-1 md:px-2 py-0.5 rounded-md ${book.status === 'read' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                    {book.status === 'read' ? '已阅' : '待读'}
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