import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const NewIcon: React.FC<IconProps> = ({ size = 18, className, ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* 渐变与阴影定义 */}
      <defs>
        <linearGradient
          id="newIconGrad"
          x1="12"
          y1="2"
          x2="12"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* 精致的四角星芒，表示“新”和“闪亮” */}
      <path
        d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z"
        fill="url(#newIconGrad)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* 辅助闪烁小粒子 */}
      <circle
        cx="18.5"
        cy="5.5"
        r="1.5"
        fill="currentColor"
        className="opacity-80"
      />
      <circle
        cx="5.5"
        cy="18.5"
        r="1"
        fill="currentColor"
        className="opacity-60"
      />
    </svg>
  );
};

export default NewIcon;
