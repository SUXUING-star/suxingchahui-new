// --- components/book/BookCard.tsx ---

import React from 'react';
import { User, Globe, CheckCircle2 } from 'lucide-react';
import { Book } from '@/utils/bookApi';

interface BookCardProps {
    book: Book;
    isSelected: boolean;
    isSelectMode: boolean;
    onToggleSelect: (id: string) => void;
    onClick: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, isSelected, isSelectMode, onToggleSelect, onClick }) => {
    
    // 1. 根据字数动态计算标题字号逻辑
    const getTitleFontSize = (title: string) => {
        const len = title.length;
        if (len <= 5) return 'text-[13px] md:text-xl';       // 短标题：特大
        if (len <= 10) return 'text-[11px] md:text-lg';     // 中等标题：标准
        return 'text-[10px] md:text-base';                 // 长标题：缩小
    };

    return (
        <div
            onClick={() => isSelectMode ? onToggleSelect(book._id) : onClick(book)}
            className={`group relative bg-white/80 dark:bg-gray-900/85 backdrop-blur-3xl rounded-xl md:rounded-[28px] border border-white/30 dark:border-white/5 p-2.5 md:p-5 shadow-lg transition-all active:scale-95 cursor-pointer ${isSelected ? 'ring-2 ring-blue-500 bg-blue-500/5' : ''
                }`}
        >
            {isSelectMode && (
                <div className="absolute top-1.5 right-1.5 z-10">
                    <div className={`w-4 h-4 md:w-6 md:h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white/50 border-gray-300'
                        }`}>
                        {isSelected && <CheckCircle2 size={10} className="text-white md:w-3.5 md:h-3.5" />}
                    </div>
                </div>
            )}

            {/* 2. 动态字号标题 */}
            <h3 className={`${getTitleFontSize(book.title)} font-black tracking-tight line-clamp-1 uppercase mb-1 md:mb-2 group-hover:text-blue-600 transition-colors pr-4 md:pr-0`}>
                {book.title}
            </h3>

            <div className="flex flex-col gap-0.5 md:gap-1.5 mb-2 md:mb-4">
                <div className="flex items-center text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-tighter md:tracking-widest truncate">
                    <User size={8} className="mr-1 text-blue-500 shrink-0 md:w-3 md:h-3" /> 
                    <span className="truncate">{book.author}</span>
                    {/* 年代显示 */}
                    {book.year && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-[6px] md:text-[8px] text-purple-500 font-bold border border-purple-500/10">
                            {book.year}
                        </span>
                    )}
                </div>
                <div className="flex items-center text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-tighter md:tracking-widest truncate">
                    <Globe size={8} className="mr-1 text-emerald-500 shrink-0 md:w-3 md:h-3" /> {book.country}
                </div>
            </div>

            {/* 3. 简评：去掉斜体和引号，增加阅读感 */}
            {book.shortReview && (
                <p className="hidden md:block text-[10px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 font-medium opacity-90 border-l-2 border-gray-200 dark:border-white/10 pl-2">
                    {book.shortReview}
                </p>
            )}

            <div className="pt-1.5 md:pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest px-1 md:px-2 py-0.5 rounded-md ${book.status === 'read' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                    {book.status === 'read' ? '已阅' : '待读'}
                </span>
                
                {book.bookType === 'collection' && (
                    <span className="hidden sm:block text-[8px] font-black text-gray-400 uppercase">
                        {book.stories?.length || 0} ITEMS
                    </span>
                )}
            </div>
        </div>
    );
};

export default BookCard;