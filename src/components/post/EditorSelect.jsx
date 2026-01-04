// src/components/post/EditorSelect.jsx
import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const EditorSelect = ({ value, onChange, options, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative min-w-[200px]">
      <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2 block">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white dark:bg-gray-800 px-5 py-3 rounded-2xl font-black shadow-lg hover:shadow-xl transition-all dark:text-white"
      >
        <span>{value || "点击选择"}</span>
        <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[210]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-3 w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-[220] animate-in fade-in slide-in-from-top-2">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-blue-500 hover:text-white transition-colors text-left font-bold"
              >
                {opt}
                {value === opt && <Check size={16} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default EditorSelect;