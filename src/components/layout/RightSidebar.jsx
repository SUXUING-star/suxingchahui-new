// src/components/layout/RightSidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import TagCloud from '../common/TagCloud';
import { getTagCloudData } from '../../utils/postUtils';
import anime from 'animejs';

function RightSidebar() {
  const [tagData, setTagData] = useState([]);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await getTagCloudData();
        setTagData(data); // 直接存入对象数组 [{tag, count}, ...]
      } catch (error) {
        console.error('Error fetching tag cloud data:', error);
      }
    };
    fetchTags();
  }, []);
    
  useEffect(() => {
    if (tagData.length > 0 && sidebarRef.current) {
      anime({
        targets: sidebarRef.current,
        translateX: [50, 0], // 改小位移，更丝滑
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutExpo'
      });
    }
  }, [tagData]);

  return (
    <aside className="p-4 opacity-0" ref={sidebarRef}>
      <div className="space-y-4">
        <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center px-2">
          <span className="w-2 h-6 bg-blue-600 rounded-full mr-3"></span>
          标签云
        </h2>
        
        {/* 核心改动：容器不再带边框和阴影，让 TagCloud 的晶体感自己发挥 */}
        <div className="p-2">
          {tagData.length > 0 ? (
            <TagCloud tagData={tagData} />
          ) : (
            <div className="animate-pulse flex flex-wrap gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default RightSidebar;