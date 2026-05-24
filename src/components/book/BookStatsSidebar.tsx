import React, { useMemo, useState } from 'react';
import { Layers, Globe, Users, Clock, PieChart, ChevronDown, ChevronUp, X, BarChart3 } from 'lucide-react';
import { BOOK_SORT_ORDER, BOOK_TYPE_MAP, BOOK_COUNTRIES } from '@/utils/bookApi';

type ViewMode = 'type' | 'author' | 'year';
interface StatItem { name: string; read: number; unread: number; }
interface RegionStat {
  country: string;
  totalRead: number;
  totalUnread: number;
  typeDetails: StatItem[];
  authorDetails: StatItem[];
  yearDetails: StatItem[];
}

interface Props {
  stats: RegionStat[];
  activeFilters: { country?: string; bookType?: string; author?: string; year?: string; [k: string]: any };
  onFilterChange: (f: any) => void;
}

const BookStatsSidebar: React.FC<Props> = ({ stats, activeFilters, onFilterChange }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('type');
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. 地区顺序强锁定
  const sortedStats = useMemo(() => {
    return [...stats].sort((a, b) => {
      const indexA = BOOK_COUNTRIES.indexOf(a.country);
      const indexB = BOOK_COUNTRIES.indexOf(b.country);
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    });
  }, [stats]);

  // 2. 阅读记录汇总（体裁）
  const typeSummary = useMemo(() => {
    const map: Record<string, StatItem> = {};
    stats.forEach(reg => {
      reg.typeDetails.forEach(it => {
        if (!map[it.name]) map[it.name] = { name: it.name, read: 0, unread: 0 };
        map[it.name].read += it.read; map[it.name].unread += it.unread;
      });
    });
    return Object.values(map).sort((a, b) => (BOOK_SORT_ORDER.indexOf(a.name) || 99) - (BOOK_SORT_ORDER.indexOf(b.name) || 99));
  }, [stats]);

  const handleFilter = (update: Record<string, string | undefined>) => {
    const newFilters = { ...activeFilters };
    Object.keys(update).forEach(key => {
      if (newFilters[key] === update[key]) delete newFilters[key];
      else newFilters[key] = update[key];
    });
    onFilterChange(newFilters);
  };

  const renderList = (items: StatItem[], regionName?: string, isModal = false) => {
    let sortedItems = [...items];
    if (viewMode === 'type') {
      sortedItems.sort((a, b) => (BOOK_SORT_ORDER.indexOf(a.name) || 99) - (BOOK_SORT_ORDER.indexOf(b.name) || 99));
    } else if (viewMode === 'year') {
      sortedItems.sort((a, b) => {
        const yearA = parseInt(a.name.match(/\d+/)?.[0] || '0');
        const yearB = parseInt(b.name.match(/\d+/)?.[0] || '0');
        return yearA !== yearB ? yearA - yearB : a.name.localeCompare(b.name);
      });
    } else {
      sortedItems.sort((a, b) => {
        const countA = a.read + a.unread;
        const countB = b.read + b.unread;
        return countB !== countA ? countB - countA : a.name.localeCompare(b.name);
      });
    }

    const limit = isModal ? 8 : 6;
    const shouldLimit = regionName && viewMode !== 'type' && sortedItems.length > limit;
    const isExpanded = regionName && expandedRegions[regionName];
    const displayItems = shouldLimit && !isExpanded ? sortedItems.slice(0, limit - 1) : sortedItems;

    return (
      <div className={`mt-3 ${isModal ? 'space-y-2' : 'space-y-3.5'} pl-3`}>
        {displayItems.map(item => {
          const typeKey = viewMode === 'type' ? (BOOK_TYPE_MAP[item.name] || item.name) : undefined;
          const isActive = (regionName ? activeFilters.country === regionName : !activeFilters.country) && (
            viewMode === 'type' ? activeFilters.bookType === typeKey :
            viewMode === 'author' ? activeFilters.author === item.name : activeFilters.year === item.name
          );

          return (
            <div key={item.name} onClick={() => { handleFilter({ country: regionName || undefined, bookType: viewMode === 'type' ? typeKey : undefined, author: viewMode === 'author' ? item.name : undefined, year: viewMode === 'year' ? item.name : undefined }); if(isModal) setIsModalOpen(false); }} 
              className="flex justify-between items-center group cursor-pointer">
              <span className={`text-[11px] font-bold ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-700'}`}>{item.name}</span>
              <div className="flex gap-3 text-[10px] font-black">
                <span className={isActive ? "text-emerald-500" : "text-emerald-500/40"}>{item.read}</span>
                <span className={isActive ? "text-orange-500" : "text-orange-500/40"}>{item.unread}</span>
              </div>
            </div>
          );
        })}
        {shouldLimit && (
          <button onClick={(e) => { e.stopPropagation(); setExpandedRegions(prev => ({...prev, [regionName!]: !prev[regionName!]})); }} className="text-[9px] font-black text-blue-600/40 hover:text-blue-600 pt-1">
            {isExpanded ? '收起' : `更多 ${sortedItems.length - (limit - 1)} 项`}
          </button>
        )}
      </div>
    );
  };

  // 统一的选项卡布局
  const DimensionTabs = () => (
    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl shrink-0">
      {[
        { id: 'type', label: '体裁', icon: Layers },
        { id: 'author', label: '作者', icon: Users },
        { id: 'year', label: '年代', icon: Clock }
      ].map(m => (
        <button key={m.id} onClick={() => setViewMode(m.id as ViewMode)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black transition-all ${viewMode === m.id ? 'bg-white dark:bg-white/10 shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-500'}`}>
          <m.icon size={12} /> {m.label}
        </button>
      ))}
    </div>
  );

  // 统一的滚动列表内容
  const ScrollArea = ({ isModal = false }) => (
    <div className={`flex-1 overflow-y-auto pr-1 mt-6
      [&::-webkit-scrollbar]:w-1 
      [&::-webkit-scrollbar-track]:bg-transparent 
      [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 
      [&::-webkit-scrollbar-thumb]:rounded-full
      ${isModal ? 'pb-10' : ''}`}
    >
      <div className={isModal ? "space-y-5" : "space-y-6"}>
        {viewMode === 'type' && (
          <section className="border-b border-gray-100 dark:border-white/5 pb-6 mb-6">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-3">
              <PieChart size={14} className="text-blue-600" />
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">阅读记录预览</h3>
            </div>
            {renderList(typeSummary, undefined, isModal)}
          </section>
        )}
        {sortedStats.map(region => (
          <section key={region.country}>
            <div onClick={() => { handleFilter({ country: region.country }); if(isModal) setIsModalOpen(false); }} className={`flex justify-between items-end pb-3 cursor-pointer border-b ${activeFilters.country === region.country ? 'border-blue-600' : 'border-gray-100 dark:border-white/5'}`}>
              <div className="flex items-center gap-2">
                <Globe size={14} className={activeFilters.country === region.country ? 'text-blue-600' : 'text-gray-400'} />
                <span className={`text-sm font-black ${activeFilters.country === region.country ? 'text-blue-600' : 'text-gray-600 dark:text-gray-200'}`}>{region.country}</span>
              </div>
              <div className="flex gap-2 text-[9px] font-black"><span className="text-emerald-500">{region.totalRead}</span><span className="text-orange-500">{region.totalUnread}</span></div>
            </div>
            {renderList(viewMode === 'type' ? region.typeDetails : viewMode === 'author' ? region.authorDetails : region.yearDetails, region.country, isModal)}
          </section>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. 移动端概要视图 */}
      <div className="md:hidden mb-8">
        <div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-2xl rounded-[32px] p-7 border border-white/20 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <PieChart size={14} className="text-blue-600" />
              <span className="text-[10px] font-black text-gray-400 tracking-widest">阅读记录汇总</span>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl">
              明细统计 <BarChart3 size={12} />
            </button>
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            {typeSummary.map(item => (
              <div key={item.name} className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-3 py-2 rounded-xl">
                <span className="text-[10px] font-bold text-gray-500">{item.name}</span>
                <span className="text-[10px] font-black text-emerald-500">{item.read}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 移动端悬浮卡片 */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="relative w-full max-w-lg h-[80vh] bg-[#f8f9fa] dark:bg-[#0f0f0f] rounded-[32px] shadow-2xl flex flex-col overflow-hidden p-6">
              <header className="flex items-center justify-between px-2 pb-4 shrink-0">
                <h2 className="text-base font-black">阅读统计详情</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full"><X size={18} /></button>
              </header>
              <DimensionTabs />
              <ScrollArea isModal={true} />
            </div>
          </div>
        )}
      </div>

      {/* 2. 桌面端展示：整个卡片吸顶，内部滚动 */}
      <aside className="hidden md:block w-full sticky top-6 h-[90vh]">
        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-3xl rounded-[32px] p-8 border border-white/40 dark:border-white/10 shadow-2xl h-full flex flex-col overflow-hidden">
          <DimensionTabs />
          <ScrollArea isModal={false} />
        </div>
      </aside>
    </>
  );
};

export default BookStatsSidebar;