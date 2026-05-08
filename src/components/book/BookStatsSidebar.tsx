import React, { useMemo } from 'react';
import { PieChart, Layers } from 'lucide-react';

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

const TYPE_MAP: Record<string, string> = { 
  '中长篇': 'novel', 
  '短篇集': 'collection', 
  '短篇/散文': 'short', 
  '诗歌': 'poetry' 
};

const BookStatsSidebar: React.FC<Props> = ({ stats, activeFilters, onFilterChange }) => {
  
  // --- 计算全馆总计 ---
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
      details: Object.entries(totals).map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    };
  }, [stats]);

  const handleGlobalTypeClick = (typeName: string) => {
    const typeKey = TYPE_MAP[typeName] || typeName;
    // 仅筛选体裁，不限国家
    if (!activeFilters.country && activeFilters.bookType === typeKey) {
      onFilterChange({});
    } else {
      onFilterChange({ bookType: typeKey });
    }
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="bg-white/80 dark:bg-gray-900/85 backdrop-blur-3xl rounded-[32px] p-7 shadow-2xl border border-white/30 dark:border-white/5 sticky top-24 overflow-y-auto max-h-[85vh] no-scrollbar">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <PieChart size={18} className="text-blue-500" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">文献分布统计</h3>
          </div>
          {(activeFilters.country || activeFilters.bookType) && (
            <button 
              onClick={() => onFilterChange({})}
              className="text-[9px] font-black text-blue-500 uppercase border-b border-blue-500/30 hover:border-blue-500 transition-all"
            >
              重置
            </button>
          )}
        </div>

        <div className="space-y-12">
          
          {/* --- 1. 全馆总计 (Global Total) --- */}
          <div className="space-y-4">
            <div 
              onClick={() => onFilterChange({})}
              className={`flex justify-between items-end pb-2 cursor-pointer transition-all border-b ${
                (!activeFilters.country && !activeFilters.bookType) 
                ? 'border-blue-500' 
                : 'border-gray-200 dark:border-white/10 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-blue-500" />
                <span className={`text-[14px] font-black italic transition-colors ${
                  (!activeFilters.country && !activeFilters.bookType) ? 'text-blue-500' : 'text-gray-800 dark:text-gray-100'
                }`}>
                  总计
                </span>
              </div>
              <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">
                共 {globalStats.total} 本
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pl-2">
              {globalStats.details.map((type) => {
                const typeKey = TYPE_MAP[type.name] || type.name;
                const isActive = !activeFilters.country && activeFilters.bookType === typeKey;

                return (
                  <div 
                    key={`global-${type.name}`}
                    onClick={() => handleGlobalTypeClick(type.name)}
                    className={`flex justify-between items-center group cursor-pointer transition-all ${isActive ? 'translate-x-1' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-1 h-1 rounded-full transition-all ${isActive ? 'bg-blue-500 scale-150' : 'bg-gray-300 dark:bg-gray-700 group-hover:bg-blue-400'}`} />
                      <span className={`text-[11px] font-bold transition-colors ${isActive ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300'}`}>
                        {type.name}
                      </span>
                    </div>
                    <span className={`text-[11px] font-black transition-colors ${isActive ? 'text-blue-500' : 'text-gray-500/30'}`}>
                      {type.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- 2. 分地区统计 (By Country) --- */}
          {stats.map((region) => {
            const isCountryActive = activeFilters.country === region.country;
            const isSpecificCountryOnly = isCountryActive && !activeFilters.bookType;

            return (
              <div key={region.country} className="space-y-4">
                <div 
                  onClick={() => onFilterChange({ country: region.country })}
                  className={`flex justify-between items-end pb-2 cursor-pointer transition-all border-b ${
                    isSpecificCountryOnly ? 'border-blue-500' : 'border-gray-100 dark:border-white/5 hover:border-gray-300'
                  }`}
                >
                  <span className={`text-[14px] font-black italic transition-colors ${isCountryActive ? 'text-blue-500' : 'text-gray-600 dark:text-gray-200'}`}>
                    {region.country}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md transition-all ${
                    isSpecificCountryOnly ? 'bg-blue-600 text-white' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {region.total}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pl-2">
                  {region.details.map((type) => {
                    const typeKey = TYPE_MAP[type.name] || type.name;
                    const isTypeActive = isCountryActive && activeFilters.bookType === typeKey;

                    return (
                      <div 
                        key={`${region.country}-${type.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onFilterChange({ country: region.country, bookType: typeKey });
                        }}
                        className={`flex justify-between items-center group cursor-pointer transition-all ${isTypeActive ? 'translate-x-1' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-1 h-1 rounded-full transition-all ${isTypeActive ? 'bg-blue-500 scale-150 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-gray-300 dark:bg-gray-700 group-hover:bg-blue-400'}`} />
                          <span className={`text-[11px] font-bold transition-colors ${isTypeActive ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300'}`}>
                            {type.name}
                          </span>
                        </div>
                        <span className={`text-[11px] font-black transition-colors ${isTypeActive ? 'text-blue-500' : 'text-gray-500/30'}`}>
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