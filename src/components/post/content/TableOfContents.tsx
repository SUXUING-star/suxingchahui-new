// src/components/post/content/TableOfContents.tsx

import React from 'react';
import { List } from 'lucide-react';

// 定义标题的数据结构
export interface Heading {
    id: string;
    level: number;
    text: string;
}

interface TableOfContentsProps {
    headings: Heading[];
    activeId: string | null;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ headings, activeId }) => {
    if (headings.length === 0) {
        return null;
    }

    // 根据标题级别计算缩进
    const getIndentClass = (level: number) => {
        switch (level) {
            case 1: return 'pl-0';
            case 2: return 'pl-4';
            case 3: return 'pl-8';
            case 4: return 'pl-12';
            default: return 'pl-16';
        }
    };

    return (
        <div className="bg-white/60 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-white/10 shadow-lg">
            <h3 className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                <List size={16} className="mr-2" />
                文章导览
            </h3>
            <nav>
                <ul className="space-y-2">
                    {headings.map((heading) => (
                        <li key={heading.id}>
                            <a
                                href={`#${heading.id}`}
                                className={`
                  block text-[11px] leading-relaxed font-semibold border-l-2 transition-all duration-200
                  truncate max-w-full  /* 关键：防止文字太长换行导致目录巨丑 */
                  ${getIndentClass(heading.level)}
                  ${activeId === heading.id
                                        ? 'text-blue-600 dark:text-blue-400 border-blue-600'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                    }
                `}
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById(heading.id)?.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'start',
                                    });
                                }}
                            >
                                {heading.text}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default TableOfContents;