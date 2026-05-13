import React, { useMemo } from 'react';
import { PieChart, Layers, Globe, CheckCircle2, Circle } from 'lucide-react';
import { BOOK_SORT_ORDER, BOOK_TYPE_MAP } from '@/utils/bookApi';

interface StatDetail {
  name: string;
  read: number;
  unread: number;
}

interface RegionStat {
  country: string;
  totalRead: number;
  totalUnread: number;
  details: StatDetail[];
}

interface Props {
  stats: RegionStat[];
  activeFilters: { country?: string; bookType?: string };
  onFilterChange: (filters: { country?: string; bookType?: string }) => void;
}

// 排序函数：确保 中长篇 -> 短篇集 -> 诗歌 的顺序
const sortDetails = (details: StatDetail[]) => {
  return [...details].sort((a, b) => {
    let indexA = BOOK_SORT_ORDER.indexOf(a.name);
    let indexB = BOOK_SORT_ORDER.indexOf(b.name);
    if (indexA === -1) indexA = 99;
    if (indexB === -1) indexB = 99;
    return indexA - indexB;
  });
};

const BookStatsSidebar: React.FC<Props> = ({ stats, activeFilters, onFilterChange }) => {
  
  // 计算全库总计
  const globalStats = useMemo(() => {
    const totals: Record<string, { read: number; unread: number }> = {};
    let grandRead = 0;
    let grandUnread = 0;

    stats.forEach(region => {
      grandRead += region.totalRead;
      grandUnread += region.totalUnread;
      region.details.forEach(detail => {
        if (!totals[detail.name]) totals[detail.name] = { read: 0, unread: 0 };
        totals[detail.name].read += detail.read;
        totals[detail.name].unread += detail.unread;
      });
    });

    return { 
      totalRead: grandRead, 
      totalUnread: grandUnread,
      details: sortDetails(Object.entries(totals).map(([name, val]) => ({ name, ...val }))) 
    };
  }, [stats]);


  

  return (
    <div className="w-full space-y-4">
      
      {/* --- 移动端：磨砂面板 (md 以下显示) --- */}
      <div className="md:hidden p-5 rounded-[28px] bg-white/80 dark:bg-gray-900/90 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <PieChart size={16} className="text-blue-600" />
            <span className="text-[10px] font-black tracking-widest uppercase">筛选统计</span>
          </div>
          {(activeFilters.country || activeFilters.bookType) && (
            <button onClick={() => onFilterChange({})} className="text-[10px] font-black text-blue-600 border-b border-blue-600/30">清除全部</button>
          )}
        </div>

        {/* 地区选择：加入已读/未读数字展示 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange({})}
            className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center gap-2 ${
              !activeFilters.country ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-500'
            }`}
          >
            全部 <span className="opacity-60">{globalStats.totalRead}/{globalStats.totalUnread}</span>
          </button>
          {stats.map(region => (
            <button
              key={region.country}
              onClick={() => onFilterChange({ country: region.country })}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center gap-2 ${
                activeFilters.country === region.country ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-500'
              }`}
            >
              {region.country} 
              <span className={`text-[9px] ${activeFilters.country === region.country ? 'text-white/70' : 'text-gray-400'}`}>
                {region.totalRead}/{region.totalUnread}
              </span>
            </button>
          ))}
        </div>

        {/* 体裁选择：平铺按钮 */}
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-100 dark:border-white/5">
          {(!activeFilters.country ? globalStats.details : sortDetails(stats.find(s => s.country === activeFilters.country)?.details || [])).map(type => {
            const typeKey = BOOK_TYPE_MAP[type.name] || type.name;
            const isActive = activeFilters.bookType === typeKey;
            return (
              <button
                key={type.name}
                onClick={() => onFilterChange({ ...activeFilters, bookType: isActive ? undefined : typeKey })}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all border flex items-center gap-2 ${
                  isActive 
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent' 
                  : 'bg-transparent text-gray-500 border-gray-200 dark:border-white/10'
                }`}
              >
                {type.name}
                <div className="flex gap-1.5">
                  <span className="text-emerald-500">{type.read}</span>
                  <span className="text-orange-500">{type.unread}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- 桌面端：始终全量展开 --- */}
      <aside className="hidden md:block w-full sticky top-24 overflow-y-auto max-h-[85vh] no-scrollbar pr-2">
        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl rounded-[32px] p-8 border border-white/40 dark:border-white/10 shadow-2xl">
          
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              <PieChart size={18} className="text-blue-600" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">阅读库统计</h3>
            </div>
            {(activeFilters.country || activeFilters.bookType) && (
              <button onClick={() => onFilterChange({})} className="text-[10px] font-black text-blue-600 hover:underline">RESET</button>
            )}
          </div>

          <div className="space-y-12">
            {/* 1. 总计区域 */}
            <section className="space-y-5">
              <div 
                onClick={() => onFilterChange({})}
                className={`flex justify-between items-end pb-3 cursor-pointer border-b transition-all group ${
                  (!activeFilters.country && !activeFilters.bookType) ? 'border-blue-600' : 'border-gray-200 dark:border-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-blue-600" />
                  <span className={`text-sm font-black transition-colors ${(!activeFilters.country && !activeFilters.bookType) ? 'text-blue-600' : 'text-gray-800 dark:text-gray-100 group-hover:text-blue-500'}`}>全库总览</span>
                </div>
                <div className="flex gap-2 text-[10px] font-black">
                  <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">已读 {globalStats.totalRead}</span>
                  <span className="text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-md">待读 {globalStats.totalUnread}</span>
                </div>
              </div>

              <div className="grid gap-3.5 pl-4">
                {globalStats.details.map(type => {
                  const typeKey = BOOK_TYPE_MAP[type.name] || type.name;
                  const isActive = !activeFilters.country && activeFilters.bookType === typeKey;
                  return (
                    <div key={type.name} onClick={() => onFilterChange({ bookType: typeKey })} className="flex justify-between items-center group cursor-pointer">
                      <span className={`text-[11px] font-bold transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`}>{type.name}</span>
                      <div className="flex gap-3 text-[10px] font-black">
                        <span className={`transition-opacity ${isActive ? 'text-emerald-500' : 'text-emerald-500/50 group-hover:opacity-100'}`}>{type.read}</span>
                        <span className={`transition-opacity ${isActive ? 'text-orange-500' : 'text-orange-500/50 group-hover:opacity-100'}`}>{type.unread}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 2. 地区细分 - 全量平铺 */}
            {stats.map(region => (
              <section key={region.country} className="space-y-5">
                <div 
                  onClick={() => onFilterChange({ country: region.country })}
                  className={`flex justify-between items-end pb-3 cursor-pointer border-b transition-all group ${
                    activeFilters.country === region.country ? 'border-blue-600' : 'border-gray-100 dark:border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="text-gray-400 group-hover:text-blue-500" />
                    <span className={`text-sm font-black transition-colors ${activeFilters.country === region.country ? 'text-blue-600' : 'text-gray-600 dark:text-gray-200 group-hover:text-blue-500'}`}>{region.country}</span>
                  </div>
                  <div className="flex gap-2 text-[9px] font-black">
                    <span className={activeFilters.country === region.country ? 'text-emerald-500' : 'text-emerald-500/60'}>{region.totalRead}</span>
                    <span className="text-gray-300 dark:text-white/10">/</span>
                    <span className={activeFilters.country === region.country ? 'text-orange-500' : 'text-orange-500/60'}>{region.totalUnread}</span>
                  </div>
                </div>
                
                <div className="grid gap-3.5 pl-4">
                  {sortDetails(region.details).map(type => {
                    const typeKey = BOOK_TYPE_MAP[type.name] || type.name;
                    const isActive = activeFilters.country === region.country && activeFilters.bookType === typeKey;
                    return (
                      <div key={type.name} onClick={() => onFilterChange({ country: region.country, bookType: typeKey })} className="flex justify-between items-center group cursor-pointer">
                        <span className={`text-[11px] font-bold transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`}>{type.name}</span>
                        <div className="flex gap-3 text-[10px] font-black opacity-40 group-hover:opacity-100 transition-opacity">
                          <span className={isActive ? 'text-emerald-500 opacity-100' : 'text-emerald-500'}>{type.read}</span>
                          <span className={isActive ? 'text-orange-500 opacity-100' : 'text-orange-500'}>{type.unread}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default BookStatsSidebar;