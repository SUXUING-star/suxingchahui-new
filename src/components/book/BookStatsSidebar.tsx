import React, { useMemo, useState } from 'react';
import { Layers, Globe, Users, Clock, PieChart, X, BarChart3, MapPin } from 'lucide-react';
import { BOOK_SORT_ORDER, BOOK_TYPE_MAP, BOOK_COUNTRIES } from '@/utils/bookApi';

// 维度定义
type ViewMode = 'type' | 'specificCountry' | 'author' | 'year';

interface StatItem { name: string; read: number; unread: number; }
interface RegionStat {
  country: string;
  totalRead: number;
  totalUnread: number;
  typeDetails: StatItem[];
  authorDetails: StatItem[];
  yearDetails: StatItem[];
  specificCountryDetails: StatItem[]; // 后端新增的细分国家数据
}

interface Props {
  stats: RegionStat[];
  activeFilters: { country?: string; bookType?: string; author?: string; year?: string; specificCountry?: string };
  onFilterChange: (f: any) => void;
}

const BookStatsSidebar: React.FC<Props> = ({ stats, activeFilters, onFilterChange }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('type');
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- 1. 数据预处理 ---
  
  // 按内定顺序对大类（地区）排序
  const sortedStats = useMemo(() => {
    return [...stats].sort((a, b) => {
      const indexA = BOOK_COUNTRIES.indexOf(a.country);
      const indexB = BOOK_COUNTRIES.indexOf(b.country);
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    });
  }, [stats]);

  // 全局汇总（仅用于“体裁”维度的顶部展示）
  const typeSummary = useMemo(() => {
    const map: Record<string, StatItem> = {};
    stats.forEach(reg => {
      reg.typeDetails.forEach(it => {
        if (!map[it.name]) map[it.name] = { name: it.name, read: 0, unread: 0 };
        map[it.name].read += it.read;
        map[it.name].unread += it.unread;
      });
    });
    return Object.values(map).sort((a, b) => (BOOK_SORT_ORDER.indexOf(a.name) || 99) - (BOOK_SORT_ORDER.indexOf(b.name) || 99));
  }, [stats]);

  // --- 2. 交互逻辑 ---

  const handleFilter = (update: Record<string, string | undefined>) => {
    const newFilters = { ...activeFilters };
    Object.keys(update).forEach(key => {
      if (newFilters[key as keyof typeof activeFilters] === update[key]) {
        delete newFilters[key as keyof typeof activeFilters];
      } else {
        (newFilters as any)[key] = update[key];
      }
    });
    onFilterChange(newFilters);
  };

  // --- 3. 内部渲染件 ---

  const renderItemsList = (items: StatItem[], regionName?: string, isModal = false) => {
    // 排序逻辑：体裁按内定顺序，年代按数字，其他按数量
    const sortedItems = [...items].sort((a, b) => {
      if (viewMode === 'type') return (BOOK_SORT_ORDER.indexOf(a.name) || 99) - (BOOK_SORT_ORDER.indexOf(b.name) || 99);
      if (viewMode === 'year') return parseInt(a.name) - parseInt(b.name);
      return (b.read + b.unread) - (a.read + a.unread);
    });

    const limit = isModal ? 12 : 6;
    const isExpanded = regionName && expandedRegions[regionName];
    const displayItems = (regionName && viewMode !== 'type' && !isExpanded) ? sortedItems.slice(0, limit - 1) : sortedItems;

    return (
      <div className="mt-3 space-y-3 pl-3">
        {displayItems.map(item => {
          const typeKey = viewMode === 'type' ? (BOOK_TYPE_MAP[item.name] || item.name) : undefined;
          
          // 选中状态判断
          const isActive = (regionName ? activeFilters.country === regionName : !activeFilters.country) && (
            viewMode === 'type' ? activeFilters.bookType === typeKey :
            viewMode === 'author' ? activeFilters.author === item.name :
            viewMode === 'year' ? activeFilters.year === item.name :
            activeFilters.specificCountry === item.name
          );

          return (
            <div 
              key={item.name} 
              onClick={() => {
                handleFilter({ 
                  country: regionName, 
                  bookType: viewMode === 'type' ? typeKey : undefined,
                  author: viewMode === 'author' ? item.name : undefined,
                  year: viewMode === 'year' ? item.name : undefined,
                  specificCountry: viewMode === 'specificCountry' ? item.name : undefined
                });
                if(isModal) setIsModalOpen(false);
              }}
              className="flex justify-between items-center group cursor-pointer"
            >
              <span className={`text-[11px] font-bold transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}>
                {item.name}
              </span>
              <div className="flex gap-2.5 text-[10px] font-black">
                <span className={isActive ? "text-emerald-500" : "text-emerald-500/40"}>{item.read}</span>
                <span className={isActive ? "text-orange-500" : "text-orange-500/40"}>{item.unread}</span>
              </div>
            </div>
          );
        })}
        
        {/* 展开/收起按钮 */}
        {regionName && viewMode !== 'type' && sortedItems.length > limit && (
          <button 
            onClick={() => setExpandedRegions(p => ({...p, [regionName]: !p[regionName]}))}
            className="text-[9px] font-black text-blue-600/40 hover:text-blue-600 pt-1"
          >
            {isExpanded ? '收起' : `更多 ${sortedItems.length - limit + 1} 项`}
          </button>
        )}
      </div>
    );
  };

  const renderTabs = () => (
    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl shrink-0">
      {[
        { id: 'type', label: '体裁', icon: Layers },
        { id: 'specificCountry', label: '国家', icon: MapPin },
        { id: 'author', label: '作者', icon: Users },
        { id: 'year', label: '年代', icon: Clock }
      ].map(tab => (
        <button 
          key={tab.id}
          onClick={() => setViewMode(tab.id as ViewMode)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black transition-all ${viewMode === tab.id ? 'bg-white dark:bg-white/10 shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <tab.icon size={12} /> <span className="hidden lg:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );

  const renderMainList = (isModal: boolean) => (
    <div className="flex-1 overflow-y-auto pr-1 mt-6 custom-scrollbar">
      <div className="space-y-9">
        {/* 1. 只有体裁模式下显示总计 */}
        {viewMode === 'type' && (
          <section className="border-b border-gray-100 dark:border-white/5 pb-8">
            <div className="flex items-center gap-2 mb-4 opacity-50">
              <PieChart size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">全站统计</span>
            </div>
            {renderItemsList(typeSummary, undefined, isModal)}
          </section>
        )}

        {/* 2. 各地区明细 */}
        {sortedStats.map(region => (
          <section key={region.country}>
            <div 
              onClick={() => { handleFilter({ country: region.country }); if(isModal) setIsModalOpen(false); }}
              className={`flex justify-between items-end pb-3 cursor-pointer border-b transition-all ${activeFilters.country === region.country ? 'border-blue-600' : 'border-gray-100 dark:border-white/5'}`}
            >
              <div className="flex items-center gap-2">
                <Globe size={14} className={activeFilters.country === region.country ? 'text-blue-600' : 'text-gray-400'} />
                <span className={`text-sm font-black ${activeFilters.country === region.country ? 'text-blue-600' : 'text-gray-600 dark:text-gray-200'}`}>{region.country}</span>
              </div>
              <div className="flex gap-2 text-[10px] font-black">
                <span className="text-emerald-500">{region.totalRead}</span>
                <span className="text-orange-500">{region.totalUnread}</span>
              </div>
            </div>
            {renderItemsList(
              viewMode === 'type' ? region.typeDetails : 
              viewMode === 'author' ? region.authorDetails : 
              viewMode === 'year' ? region.yearDetails : 
              region.specificCountryDetails,
              region.country,
              isModal
            )}
          </section>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* 桌面端 */}
      <aside className="hidden md:flex flex-col w-full sticky top-6 h-[calc(100vh-120px)] bg-white/70 dark:bg-white/5 backdrop-blur-3xl rounded-[32px] p-8 border border-white/40 dark:border-white/10 shadow-2xl">
        {renderTabs()}
        {renderMainList(false)}
      </aside>

      {/* 移动端入口 */}
      <div className="md:hidden mb-8 bg-white/80 dark:bg-gray-900/90 backdrop-blur-2xl rounded-[32px] p-6 border border-white/20 shadow-xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BarChart3 size={18} className="text-blue-600" />
          <span className="text-sm font-black italic">阅读数据看板</span>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="text-[10px] font-black text-blue-600 bg-blue-600/10 px-4 py-2 rounded-xl">查看明细</button>
      </div>

      {/* 移动端 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg h-[80vh] bg-gray-50 dark:bg-[#0a0a0a] rounded-t-[40px] sm:rounded-[40px] shadow-2xl flex flex-col p-8 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black italic">数据明细</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-200 dark:bg-white/10 rounded-full"><X size={20} /></button>
            </div>
            {renderTabs()}
            {renderMainList(true)}
          </div>
        </div>
      )}
    </>
  );
};

export default BookStatsSidebar;