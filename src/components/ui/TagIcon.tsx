import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const TagIcon: React.FC<IconProps> = ({ size = 18, className, ...props }) => {
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
      <defs>
        <linearGradient
          id="tagIconGrad"
          x1="12"
          y1="2"
          x2="12"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>

      {/* 现代斜切角度的标签挂牌，带挂绳孔 */}
      <path
        d="M12.5 2H5C3.34315 2 2 3.34315 2 5V12.5C2 13.2956 2.31607 14.0587 2.87868 14.6213L11.8787 23.6213C12.4645 24.2071 13.4142 24.2071 14 23.6213L23.6213 14C24.2071 13.4142 24.2071 12.4645 23.6213 11.8787L14.6213 2.87868C14.0587 2.31607 13.2956 2 12.5 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="url(#tagIconGrad)"
        fillOpacity="0.1"
      />

      {/* 挂牌圆孔 */}
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  );
};

export default TagIcon;
