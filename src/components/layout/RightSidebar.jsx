// src/components/layout/RightSidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import TagCloud from '../common/TagCloud';
import { getTagCloudData } from '../../utils/postUtils';
import anime from 'animejs';
import { Hash } from 'lucide-react';

function RightSidebar() {
  const [tagData, setTagData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const data = await getTagCloudData();
        setTagData(data || []);
      } catch (error) {} finally { setIsLoading(false); }
    };
    fetchTags();
  }, []);
    
  useEffect(() => {
    if (!isLoading && tagData.length > 0 && sidebarRef.current) {
      anime({ targets: sidebarRef.current, translateX: [50, 0], opacity: [0, 1], duration: 800, easing: 'easeOutExpo' });
    }
  }, [isLoading, tagData]);

  if (isLoading) return (
    <aside className="w-full p-4">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[32px] p-6 animate-pulse h-64"></div>
    </aside>
  );

  return (
    <aside className="w-full p-4 opacity-0" ref={sidebarRef}>
      <div className="bg-white/85 dark:bg-gray-900/90 backdrop-blur-2xl rounded-[32px] p-6 shadow-xl border border-white/40 dark:border-white/5">
        <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center mb-6 tracking-tighter uppercase">
          <Hash size={20} className="text-blue-500 mr-2" /> 标签索引
        </h2>
        
        {tagData.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[24px]">
             <p className="text-[10px] font-black text-gray-400 uppercase">无活跃标签</p>
          </div>
        ) : (
          <TagCloud tagData={tagData} />
        )}
      </div>
    </aside>
  );
}

export default RightSidebar;