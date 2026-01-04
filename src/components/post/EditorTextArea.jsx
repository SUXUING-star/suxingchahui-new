import React, { useRef, useEffect } from 'react';

const EditorTextArea = ({ value, onChange, placeholder, className = "" }) => {
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const node = textareaRef.current;
    if (node) {
      node.style.height = 'auto';
      node.style.height = `${node.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className={`w-full bg-transparent border-none outline-none resize-none overflow-hidden block font-black leading-relaxed ${className}`}
    />
  );
};

export default EditorTextArea;