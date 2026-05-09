
import React, { useMemo } from 'react';
import { PieChart, Layers, Globe } from 'lucide-react';
import { BOOK_SORT_ORDER, BOOK_TYPE_MAP } from '@/utils/bookApi';

interface StatDetail {
  name: string;
  count: number;
}

interface RegionStat {
  country: string;
  total: number;
  details: StatDetail[];
}

interface Props {
  stats: RegionStat[];
  activeFilters: { country?: string; bookType?: string };
  onFilterChange: (filters: { country?: string; bookType?: string }) => void;
}

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
  
  const globalStats = useMemo(() => {
    const totals: Record<string, number> = {};
    let grandTotal = 0;
    stats.forEach(region => {
      grandTotal += region.total;
      region.details.forEach(detail => {
        totals[detail.name] = (totals[detail.name] || 0) + detail.count;
      });
    });
    return { 
      total: grandTotal, 
      details: sortDetails(Object.entries(totals).map(([name, count]) => ({ name, count }))) 
    };
  }, [stats]);

  return (
    <div className="w-full space-y-4">
      
      {/* --- 移动端：磨砂面板 --- */}
      <div className="md:hidden p-4 rounded-[24px] bg-white/80 dark:bg-gray-900/90 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <PieChart size={16} className="text-blue-600" />
            <span className="text-xs font-black tracking-widest">筛选</span>
          </div>
          {(activeFilters.country || activeFilters.bookType) && (
            <button onClick={() => onFilterChange({})} className="text-[10px] font-black text-blue-600 border-b border-blue-600/30">重置</button>
          )}
        </div>

        {/* 地区：自动平铺换行 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange({})}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
              !activeFilters.country ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-500'
            }`}
          >
            全部 {globalStats.total}
          </button>
          {stats.map(region => (
            <button
              key={region.country}
              onClick={() => onFilterChange({ country: region.country })}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                activeFilters.country === region.country ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-white/5 text-gray-500'
              }`}
            >
              {region.country} {region.total}
            </button>
          ))}
        </div>

        {/* 类型：平铺 */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100 dark:border-white/5">
          {(!activeFilters.country ? globalStats.details : sortDetails(stats.find(s => s.country === activeFilters.country)?.details || [])).map(type => {
            const typeKey = BOOK_TYPE_MAP[type.name] || type.name;
            const isActive = activeFilters.bookType === typeKey;
            return (
              <button
                key={type.name}
                onClick={() => onFilterChange({ ...activeFilters, bookType: isActive ? undefined : typeKey })}
                className={`px-2.5 py-1 rounded-md text-[9px] font-black transition-all border ${
                  isActive 
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent shadow-sm' 
                  : 'bg-transparent text-gray-500 border-gray-200 dark:border-white/10'
                }`}
              >
                {type.name} <span className={isActive ? 'text-blue-400' : 'text-gray-400'}>{type.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- 桌面端：始终全量展开 --- */}
      <aside className="hidden md:block w-full sticky top-24 overflow-y-auto max-h-[85vh] no-scrollbar pr-2">
        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl rounded-[32px] p-7 border border-white/40 dark:border-white/10 shadow-2xl">
          
          <div className="flex items-center gap-2 mb-8">
            <PieChart size={18} className="text-blue-600" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">书单统计</h3>
          </div>

          <div className="space-y-12">
            {/* 1. 总计区域 */}
            <section className="space-y-4">
              <div 
                onClick={() => onFilterChange({})}
                className={`flex justify-between items-end pb-2 cursor-pointer border-b transition-all ${
                  (!activeFilters.country && !activeFilters.bookType) ? 'border-blue-600' : 'border-gray-200 dark:border-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-blue-600" />
                  <span className={`text-sm font-black ${(!activeFilters.country && !activeFilters.bookType) ? 'text-blue-600' : 'text-gray-800 dark:text-gray-100'}`}>总计</span>
                </div>
                <span className="text-[11px] font-black text-blue-600 bg-blue-600/10 px-2 py-0.5 rounded-lg">{globalStats.total}</span>
              </div>
              <div className="grid gap-2.5 pl-4">
                {globalStats.details.map(type => {
                  const typeKey = BOOK_TYPE_MAP[type.name] || type.name;
                  const isActive = !activeFilters.country && activeFilters.bookType === typeKey;
                  return (
                    <div key={type.name} onClick={() => onFilterChange({ bookType: typeKey })} className="flex justify-between items-center group cursor-pointer">
                      <span className={`text-xs font-bold transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`}>{type.name}</span>
                      <span className={`text-[11px] font-black ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{type.count}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 2. 地区细分 - 全量平铺 */}
            {stats.map(region => (
              <section key={region.country} className="space-y-4">
                <div 
                  onClick={() => onFilterChange({ country: region.country })}
                  className={`flex justify-between items-end pb-2 cursor-pointer border-b transition-all ${
                    activeFilters.country === region.country ? 'border-blue-600' : 'border-gray-100 dark:border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="text-gray-400" />
                    <span className={`text-sm font-black ${activeFilters.country === region.country ? 'text-blue-600' : 'text-gray-600 dark:text-gray-200'}`}>{region.country}</span>
                  </div>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg transition-all ${
                    activeFilters.country === region.country ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-600/10 text-blue-600'
                  }`}>{region.total}</span>
                </div>
                
                <div className="grid gap-2.5 pl-4">
                  {sortDetails(region.details).map(type => {
                    const typeKey = BOOK_TYPE_MAP[type.name] || type.name;
                    const isActive = activeFilters.country === region.country && activeFilters.bookType === typeKey;
                    return (
                      <div key={type.name} onClick={() => onFilterChange({ country: region.country, bookType: typeKey })} className="flex justify-between items-center group cursor-pointer">
                        <span className={`text-[11px] font-bold transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`}>{type.name}</span>
                        <span className={`text-[11px] font-black ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{type.count}</span>
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