import React, { useState, useEffect, useRef } from "react";
import TagCloud from "../common/TagCloud";
import { getTagCloudData } from "../../utils/postApi";
import { animate } from "animejs";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

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
        console.error("Failed to fetch tag cloud data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    if (!isLoading && tagData.length > 0 && sidebarRef.current) {
      animate(sidebarRef.current, {
        translateX: [50, 0],
        opacity: [0, 1],
        duration: 800,
        ease: "outExpo",
      });
    }
  }, [isLoading, tagData]);

  if (isLoading)
    return (
      <aside className="py-4 w-[clamp(180px,20vw,250px)] transition-all duration-300">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[24px] p-4 animate-pulse h-64"></div>
      </aside>
    );

  return (
    <aside
      className={`py-4 transition-all duration-500 ease-in-out opacity-0 ${
        isExpanded ? "w-[clamp(180px,20vw,250px)]" : "w-16"
      }`}
      ref={sidebarRef}
    >
      <div
        className={`
          bg-white/85 dark:bg-gray-900/90
          backdrop-blur-2xl
          shadow-xl
          border border-white/40 dark:border-white/5
          transition-all duration-500 overflow-hidden flex flex-col
          ${
            isExpanded
              ? "rounded-[24px] p-4"
              : "rounded-[20px] p-3 items-center"
          }
        `}
      >
        {/* 折叠控制栏 */}
        <div
          className={`flex items-center w-full ${
            isExpanded ? "justify-end mb-3" : "justify-center"
          }`}
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-gray-50/80 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-500 rounded-xl transition-all active:scale-95 border border-gray-100 dark:border-white/5"
          >
            {isExpanded ? (
              <PanelRightClose size={16} />
            ) : (
              <PanelRightOpen size={16} />
            )}
          </button>
        </div>

        {/* 动画包裹容器 */}
        <div
          className={`transition-all duration-500 ease-in-out origin-top w-full ${
            isExpanded
              ? "opacity-100 max-h-[1000px] scale-y-100"
              : "opacity-0 max-h-0 scale-y-95 pointer-events-none"
          }`}
        >
          {tagData.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[20px]">
              <p className="text-[10px] font-black text-gray-400 uppercase">
                无活跃标签
              </p>
            </div>
          ) : (
            /*
              使用更宽裕的 max-h-[500px] 限制高度并开启溢出滚动，
              此时将直接使用我们在 index.css 里定义好的优雅全局极细滚动条。
            */
            <div className="max-h-[500px] overflow-y-auto pr-1">
              <TagCloud tagData={tagData} />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
