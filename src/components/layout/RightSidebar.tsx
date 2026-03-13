// --- START OF FILE RightSidebar.tsx ---

import React, { useState, useEffect, useRef } from 'react';
import TagCloud from '../common/TagCloud';
import { getTagCloudData } from '../../utils/postApi';
import anime from 'animejs';
import { Hash, PanelRightClose, PanelRightOpen } from 'lucide-react';

interface TagCloudItem {
  tag: string;
  count: number;
}

const RightSidebar: React.FC = () => {
  const [tagData, setTagData] = useState<TagCloudItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const data = await getTagCloudData();
        setTagData(data || []);
      } catch (error) {
        console.error('Failed to fetch tag cloud data:', error);
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchTags();
  }, []);
    
  useEffect(() => {
    if (!isLoading && tagData.length > 0 && sidebarRef.current) {
      anime({ 
        targets: sidebarRef.current, 
        translateX: [50, 0], 
        opacity: [0, 1], 
        duration: 800, 
        easing: 'easeOutExpo' 
      });
    }
  }, [isLoading, tagData]);

  if (isLoading) return (
    <aside className="py-4 w-[clamp(200px,20vw,320px)] transition-all duration-300">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[24px] xl:rounded-[32px] p-4 xl:p-6 animate-pulse h-64"></div>
    </aside>
  );

  return (
    <aside 
      // 核心改动：用动态宽度彻底代替写死的固定宽度
      className={`py-4 transition-all duration-500 ease-in-out opacity-0 ${
        isExpanded ? 'w-[clamp(200px,20vw,320px)]' : 'w-16 xl:w-20'
      }`} 
      ref={sidebarRef}
    >
      <div className={`bg-white/85 dark:bg-gray-900/90 backdrop-blur-2xl shadow-xl border border-white/40 dark:border-white/5 transition-all duration-500 overflow-hidden flex flex-col ${
        isExpanded ? 'rounded-[24px] xl:rounded-[32px] p-4 xl:p-6' : 'rounded-[20px] xl:rounded-[24px] p-3 items-center'
      }`}>
        
        <div className={`flex items-center ${isExpanded ? 'justify-between mb-5 xl:mb-6' : 'justify-center flex-col space-y-4'}`}>
          {isExpanded && (
            <h2 className="text-lg xl:text-xl font-black text-gray-900 dark:text-gray-100 flex items-center tracking-tighter uppercase whitespace-nowrap overflow-hidden">
              <Hash size={20} className="text-blue-500 mr-2 flex-shrink-0" /> 标签索引
            </h2>
          )}
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2.5 bg-gray-50/80 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-500 hover:text-blue-500 rounded-2xl transition-all active:scale-95 shadow-sm border border-gray-100 dark:border-white/5"
            title={isExpanded ? "收起面板" : "展开标签索引"}
          >
            {isExpanded ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>

          {!isExpanded && (
            <div 
              className="flex flex-col items-center justify-center pt-4 opacity-100 transition-opacity duration-300 delay-200 cursor-pointer"
              onClick={() => setIsExpanded(true)}
            >
              <Hash size={14} className="text-blue-500/60 mb-3" />
              <span 
                className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-500 transition-colors" 
                style={{ writingMode: 'vertical-rl' }}
              >
                探索标签云
              </span>
            </div>
          )}
        </div>
        
        <div className={`transition-all duration-500 ease-in-out origin-top ${
          isExpanded ? 'opacity-100 max-h-[1000px] scale-y-100' : 'opacity-0 max-h-0 scale-y-95 pointer-events-none'
        }`}>
          {tagData.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[24px]">
               <p className="text-[10px] font-black text-gray-400 uppercase">无活跃标签</p>
            </div>
          ) : (
            <TagCloud tagData={tagData} />
          )}
        </div>
        
      </div>
    </aside>
  );
};

export default RightSidebar;