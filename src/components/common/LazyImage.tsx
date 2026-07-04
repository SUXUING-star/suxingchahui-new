import React, { useState, useEffect } from "react";
import { ImageIcon, Loader2, RefreshCw } from "lucide-react";

/**
 * 格式化 R2 资源的公网 URL
 */
export const normalizeR2Url = (url: string): string => {
  if (!url) return "";
  const publicUrl = (import.meta.env.VITE_R2_PUBLIC_URL || "").replace(
    /\/$/,
    "",
  );

  // 1. 如果是相对路径
  if (url.startsWith("custom_app/") || url.startsWith("assets/")) {
    return `${publicUrl}/${url}`;
  }

  // 2. 如果是绝对路径且包含 R2 特征
  if (url.startsWith("http://") || url.startsWith("https://")) {
    const customAppIdx = url.indexOf("/custom_app/");
    if (customAppIdx !== -1) {
      return `${publicUrl}/${url.slice(customAppIdx + 1)}`;
    }
    const assetsIdx = url.indexOf("/assets/");
    if (assetsIdx !== -1) {
      return `${publicUrl}/${url.slice(assetsIdx + 1)}`;
    }
  }

  return url;
};

// 继承原生图片的所有合法属性
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  objectFit?: "object-cover" | "object-contain" | "object-fill";
  fullHeight?: boolean; // 👈 补回缺少的类型属性
  simple?: boolean; // 极简模式（微缩图/头像场景，去除所有文字溢出可能）
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = "",
  wrapperClassName = "",
  objectFit = "object-cover",
  fullHeight = true, // 👈 补回缺少的默认值
  simple = false,
  ...props
}) => {
  const normalizedSrc = normalizeR2Url(src);

  // 单一状态机
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const [retryKey, setRetryKey] = useState<number>(0);

  // 每次地址发生变化，初始化状态
  useEffect(() => {
    if (!normalizedSrc) {
      setStatus("error");
      return;
    }
    setStatus("loading");
  }, [normalizedSrc]);

  const handleLoad = () => {
    setStatus("loaded");
  };

  const handleError = () => {
    setStatus("error");
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus("loading");
    setRetryKey((prev) => prev + 1);
  };

  // 生成最终带有击穿缓存参数的地址
  const finalSrc =
    retryKey > 0
      ? `${normalizedSrc}${normalizedSrc.includes("?") ? "&" : "?"}retry=${retryKey}`
      : normalizedSrc;

  return (
    <div
      className={`relative overflow-hidden bg-gray-50 dark:bg-gray-800/40 select-none ${wrapperClassName} ${fullHeight ? "h-full" : ""}`}
    >
      {/* 1. 载入状态骨架屏 (状态为 loading 时展示) */}
      {status === "loading" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-100/90 dark:bg-gray-800/90">
          <Loader2
            className={`${simple ? "w-4 h-4" : "w-6 h-6"} text-blue-500 animate-spin opacity-75`}
          />
          {!simple && (
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1.5">
              Loading...
            </span>
          )}
        </div>
      )}

      {/* 2. 异常重试面板 (状态为 error 时覆盖其上) */}
      {status === "error" && (
        <button
          type="button"
          onClick={handleRetry}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-50/95 dark:bg-gray-800/95 hover:bg-gray-100 dark:hover:bg-gray-700/80 text-gray-400 hover:text-blue-500 transition-colors group"
        >
          <div className="relative flex items-center justify-center">
            <ImageIcon
              size={simple ? 16 : 24}
              className="group-hover:opacity-10 transition-opacity duration-200"
            />
            <RefreshCw
              size={simple ? 12 : 16}
              className="absolute opacity-0 group-hover:opacity-100 animate-spin transition-opacity duration-200"
            />
          </div>
          {!simple && (
            <span className="text-[10px] font-bold mt-1.5 uppercase tracking-tighter">
              Failed, Retry
            </span>
          )}
        </button>
      )}

      {/* 3. 真实图片元素 */}
      {normalizedSrc && (
        <img
          src={finalSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          className={`
            transition-all duration-500 ease-out
            ${objectFit}
            ${fullHeight ? "w-full h-full" : "w-full h-auto block"}
            ${status === "loaded" ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-102 blur-sm"}
            ${className}
          `}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
