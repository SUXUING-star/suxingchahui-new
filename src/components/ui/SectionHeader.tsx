import React from "react";
import { Pin, Sparkles } from "lucide-react";

interface SectionHeaderProps {
  type: "latest" | "pinned";
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ type, title }) => {
  // 还原舒展的 Padding 比例，保留毛玻璃和克制的边框阴影
  const containerClass =
    "inline-flex items-center gap-3 px-6 py-2.5 mb-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-full border border-white/40 dark:border-white/10 shadow-sm select-none";

  // 文字样式，增加微调(mt-[1px])使大字距英文在视觉上绝对垂直居中
  const textClass =
    "text-sm font-black text-gray-800 dark:text-white uppercase tracking-[0.4em] leading-none mt-[1px]";

  if (type === "pinned") {
    return (
      <div className={containerClass}>
        {/* 使用带有淡填充的图钉图标，比单纯的颜色圆点高级得多 */}
        <Pin
          size={16}
          strokeWidth={2.5}
          className="text-blue-600 dark:text-blue-500 fill-blue-500/20"
        />
        <h2 className={textClass}>{title}</h2>
      </div>
    );
  }

  // 默认最新（Latest）样式
  return (
    <div className={containerClass}>
      {/* 使用星芒图标代表“最新/新鲜”，干净利落 */}
      <Sparkles
        size={16}
        strokeWidth={2.5}
        className="text-gray-500 dark:text-gray-400"
      />
      <h2 className={textClass}>{title}</h2>
    </div>
  );
};

export default SectionHeader;
