import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
// 1. 引入最新的 v4 具名导出
import { animate } from "animejs";

const Broadcast: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setIsVisible(true);

      if (containerRef.current) {
        animate(containerRef.current, {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 500,
          ease: "outQuart",
        });
      }
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("hasVisited", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;
  return (
    <div
      ref={containerRef}
      className="fixed bottom-24 left-0 right-0 px-4 z-50"
    >
      {/* 渲染逻辑... */}
      <button onClick={handleClose}>
        <X />
      </button>
    </div>
  );
};
export default Broadcast;
