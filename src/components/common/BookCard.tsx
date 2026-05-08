import React from 'react';
import { User, Globe, CheckCircle2, Bookmark } from 'lucide-react';
import { Book } from '@/utils/bookApi';

interface BookCardProps {
    book: Book;
    isSelected: boolean;
    isSelectMode: boolean;
    onToggleSelect: (id: string) => void;
    onClick: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, isSelected, isSelectMode, onToggleSelect, onClick }) => {
    return (
        <div
            onClick={() => isSelectMode ? onToggleSelect(book._id) : onClick(book)}
            className={`group relative bg-white/80 dark:bg-gray-900/85 backdrop-blur-3xl rounded-[28px] border border-white/30 dark:border-white/5 p-5 shadow-lg transition-all hover:translate-y-[-4px] cursor-pointer ${isSelected ? 'ring-2 ring-blue-500 bg-blue-500/5' : ''
                }`}
        >
            {/* 仅在管理模式下显示勾选框 */}
            {isSelectMode && (
                <div className="absolute top-4 right-4 z-10">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white/50 border-gray-300'
                        }`}>
                        {isSelected && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                </div>
            )}

            <h3 className="text-lg font-black tracking-tight line-clamp-1 uppercase mb-2 group-hover:text-blue-500 transition-colors">
                {book.title}
            </h3>

            <div className="flex flex-col gap-1.5 mb-4">
                <div className="flex items-center text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <User size={10} className="mr-1.5 text-blue-500" /> {book.author}
                </div>
                <div className="flex items-center text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <Globe size={10} className="mr-1.5 text-emerald-500" /> {book.country}
                </div>
            </div>

            {book.shortReview && (
                <p className="text-[10px] italic text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 opacity-80">
                    “{book.shortReview}”
                </p>
            )}

            <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${book.status === 'read' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                    {book.status === 'read' ? '已阅' : '待读'}
                </span>
                {/* 如果是短篇集，显示篇目数量 */}
                {book.bookType === 'collection' && (
                    <span className="text-[8px] font-black text-gray-400 uppercase">
                        {book.stories?.length || 0} STORIES
                    </span>
                )}
            </div>
        </div>
    );
};

export default BookCard;