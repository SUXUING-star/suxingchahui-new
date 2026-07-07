import React, { useMemo } from "react";
import { Link } from "react-router-dom";

interface TagItem {
  tag: string;
  count: number;
}

interface TagCloudProps {
  tagData: TagItem[];
}

// 基于文本的经典字符串哈希算法
const getHashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const TagCloud: React.FC<TagCloudProps> = ({ tagData }) => {
  if (!tagData || tagData.length === 0) return null;

  // 1. 动态计算数量层级（高频、中频、低频），维持排版上的大小错落
  const processedTags = useMemo(() => {
    const counts = tagData.map((t) => t.count);
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    const range = max - min || 1;

    return tagData.map((item) => {
      const weight = (item.count - min) / range;
      let level: "high" | "medium" | "low" = "medium";

      if (weight >= 0.6) {
        level = "high";
      } else if (weight <= 0.2) {
        level = "low";
      }
      return { ...item, level };
    });
  }, [tagData]);

  // 2. 层级排版样式
  const getHierarchyStyle = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return {
          wrapper:
            "text-[12px] md:text-[13px] px-3.5 py-2 font-black tracking-wide border-2 hover:scale-110 hover:-translate-y-0.5",
          badge:
            "bg-black/10 dark:bg-white/20 text-[10px] font-bold px-1.5 py-0.5",
        };
      case "medium":
        return {
          wrapper:
            "text-[11px] px-3 py-1.5 font-extrabold tracking-wider border hover:scale-105 hover:-translate-y-0.5",
          badge:
            "bg-black/5 dark:bg-white/10 text-[9px] font-semibold px-1 py-0.5",
        };
      case "low":
      default:
        return {
          wrapper:
            "text-[10px] px-2.5 py-1 font-medium border border-dashed opacity-80 hover:opacity-100 hover:scale-102",
          badge: "bg-black/5 dark:bg-white/5 text-[8px] opacity-60 px-1 py-0",
        };
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {processedTags.map((item) => {
        const hash = getHashCode(item.tag);

        // 映射出 0 - 360 度的唯一色相 Hue
        const hue = hash % 360;

        // 锁定高饱和度，确保多巴胺果汁感；微调亮暗模式的亮度（Lightness）以保障对比度
        const customColorStyles = {
          "--tag-bg-light": `hsl(${hue}, 92%, 96%)`,
          "--tag-bg-hover-light": `hsl(${hue}, 92%, 91%)`,
          "--tag-border-light": `hsl(${hue}, 75%, 85%)`,
          "--tag-text-light": `hsl(${hue}, 85%, 35%)`,

          "--tag-bg-dark": `hsla(${hue}, 80%, 12%, 0.25)`,
          "--tag-bg-hover-dark": `hsla(${hue}, 80%, 20%, 0.4)`,
          "--tag-border-dark": `hsla(${hue}, 60%, 40%, 0.35)`,
          "--tag-text-dark": `hsl(${hue}, 85%, 72%)`,

          "--tag-shadow-color": `hsla(${hue}, 85%, 50%, 0.15)`,
        } as React.CSSProperties;

        const layout = getHierarchyStyle(item.level);

        return (
          <Link
            key={item.tag}
            to={`/tags#${item.tag}`}
            style={customColorStyles}
            className={`
              inline-flex items-center rounded-xl transition-all duration-300 ease-out

              /* 亮色模式样式引用 */
              bg-[var(--tag-bg-light)] hover:bg-[var(--tag-bg-hover-light)]
              border-[var(--tag-border-light)] text-[var(--tag-text-light)]
              hover:shadow-lg hover:shadow-[var(--tag-shadow-color)]

              /* 暗色模式样式引用 */
              dark:bg-[var(--tag-bg-dark)] dark:hover:bg-[var(--tag-bg-hover-dark)]
              dark:border-[var(--tag-border-dark)] dark:text-[var(--tag-text-dark)]
              dark:hover:shadow-none

              ${layout.wrapper}
            `}
          >
            <span className="opacity-40 mr-1 font-normal">#</span>
            <span className="truncate max-w-[120px]">{item.tag}</span>
            <span className={`ml-1.5 rounded-md ${layout.badge}`}>
              {item.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default TagCloud;
