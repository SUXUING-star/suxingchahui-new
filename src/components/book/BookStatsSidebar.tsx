// --- components/book/BookStatsSidebar.tsx ---

import React, { useMemo } from 'react';
import { PieChart, Layers } from 'lucide-react';
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


// 2. 抽离通用的排序函数
const sortDetails = (details: StatDetail[]) => {
  return [...details].sort((a, b) => {
    let indexA = BOOK_SORT_ORDER.indexOf(a.name);
    let indexB = BOOK_SORT_ORDER.indexOf(b.name);
    
    // 如果不在定义列表里，排在最后
    if (indexA === -1) indexA = 99;
    if (indexB === -1) indexB = 99;
    
    return indexA - indexB;
  });
};

const BookStatsSidebar: React.FC<Props> = ({ stats, activeFilters, onFilterChange }) => {
  
  // --- 计算全馆总计 (增加强制排序) ---
  const globalStats = useMemo(() => {
    const totals: Record<string, number> = {};
    let grandTotal = 0;
    
    stats.forEach(region => {
      grandTotal += region.total;
      region.details.forEach(detail => {
        totals[detail.name] = (totals[detail.name] || 0) + detail.count;
      });
    });

    const combinedDetails = Object.entries(totals).map(([name, count]) => ({ name, count }));

    return {
      total: grandTotal,
      details: sortDetails(combinedDetails) // <--- 强制排序
    };
  }, [stats]);

  const handleGlobalTypeClick = (typeName: string) => {
    const typeKey = BOOK_TYPE_MAP[typeName] || typeName;
    if (!activeFilters.country && activeFilters.bookType === typeKey) {
      onFilterChange({});
    } else {
      onFilterChange({ bookType: typeKey });
    }
  };

  return (
    <aside className="w-full h-full">
      <div className="bg-white/80 dark:bg-gray-900/85 backdrop-blur-3xl rounded-xl md:rounded-[32px] p-2 md:p-7 shadow-2xl border border-white/30 dark:border-white/5 sticky top-16 md:top-24 overflow-y-auto max-h-[85vh] no-scrollbar">
        
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <div className="flex items-center gap-1 md:gap-2">
            <PieChart size={14} className="text-blue-500 md:w-[18px] md:h-[18px]" />
            <h3 className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-gray-400 hidden sm:block">统计</h3>
          </div>
          {(activeFilters.country || activeFilters.bookType) && (
            <button 
              onClick={() => onFilterChange({})}
              className="text-[8px] md:text-[9px] font-black text-blue-500 uppercase border-b border-blue-500/30"
            >
              RESET
            </button>
          )}
        </div>

        <div className="space-y-6 md:space-y-12">
          
          {/* --- 1. 全馆总计 --- */}
          <div className="space-y-2 md:space-y-4">
            <div 
              onClick={() => onFilterChange({})}
              className={`flex flex-col md:flex-row justify-between items-start md:items-end pb-1 md:pb-2 cursor-pointer transition-all border-b ${
                (!activeFilters.country && !activeFilters.bookType) 
                ? 'border-blue-500' 
                : 'border-gray-200 dark:border-white/10'
              }`}
            >
              <div className="flex items-center gap-1 md:gap-2">
                <Layers size={12} className="text-blue-500 hidden md:block" />
                <span className={`text-[10px] md:text-[14px] font-black italic uppercase ${
                  (!activeFilters.country && !activeFilters.bookType) ? 'text-blue-500' : 'text-gray-800 dark:text-gray-100'
                }`}>
                  ALL
                </span>
              </div>
              <span className="text-[8px] md:text-[10px] font-black text-blue-500 bg-blue-500/10 px-1 md:px-2 py-0.5 rounded-md">
                {globalStats.total}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 md:gap-2.5 pl-1">
              {globalStats.details.map((type) => {
                const typeKey = BOOK_TYPE_MAP[type.name] || type.name;
                const isActive = !activeFilters.country && activeFilters.bookType === typeKey;

                return (
                  <div 
                    key={`global-${type.name}`}
                    onClick={() => handleGlobalTypeClick(type.name)}
                    className="flex justify-between items-center group cursor-pointer"
                  >
                    <div className="flex items-center gap-1 overflow-hidden">
                      <div className={`w-1 h-1 rounded-full shrink-0 ${isActive ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
                      <span className={`text-[8px] md:text-[11px] font-bold truncate ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-300'}`}>
                        {type.name}
                      </span>
                    </div>
                    <span className={`text-[8px] md:text-[11px] font-black ${isActive ? 'text-blue-500' : 'text-gray-500/30'}`}>
                      {type.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- 2. 分地区统计 --- */}
          {stats.map((region) => {
            const isCountryActive = activeFilters.country === region.country;
            const isSpecificCountryOnly = isCountryActive && !activeFilters.bookType;
            
            // 对每个地区的 details 也执行强制排序
            const sortedRegionDetails = sortDetails(region.details);

            return (
              <div key={region.country} className="space-y-2 md:space-y-4">
                <div 
                  onClick={() => onFilterChange({ country: region.country })}
                  className={`flex flex-col md:flex-row justify-between items-start md:items-end pb-1 md:pb-2 cursor-pointer transition-all border-b ${
                    isSpecificCountryOnly ? 'border-blue-500' : 'border-gray-100 dark:border-white/5'
                  }`}
                >
                  <span className={`text-[10px] md:text-[14px] font-black italic ${isCountryActive ? 'text-blue-500' : 'text-gray-600 dark:text-gray-200'}`}>
                    {region.country}
                  </span>
                  <span className={`text-[8px] md:text-[10px] font-black px-1 md:px-2 py-0.5 rounded-md ${
                    isSpecificCountryOnly ? 'bg-blue-600 text-white' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {region.total}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-1.5 md:gap-2.5 pl-1">
                  {sortedRegionDetails.map((type) => {
                    const typeKey = BOOK_TYPE_MAP[type.name] || type.name;
                    const isTypeActive = isCountryActive && activeFilters.bookType === typeKey;

                    return (
                      <div 
                        key={`${region.country}-${type.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onFilterChange({ country: region.country, bookType: typeKey });
                        }}
                        className="flex justify-between items-center group cursor-pointer"
                      >
                        <div className="flex items-center gap-1 overflow-hidden">
                          <div className={`w-1 h-1 rounded-full shrink-0 ${isTypeActive ? 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]' : 'bg-gray-300 dark:bg-gray-700'}`} />
                          <span className={`text-[8px] md:text-[11px] font-bold truncate ${isTypeActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-300'}`}>
                            {type.name}
                          </span>
                        </div>
                        <span className={`text-[8px] md:text-[11px] font-black ${isTypeActive ? 'text-blue-500' : 'text-gray-500/30'}`}>
                          {type.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default BookStatsSidebar;