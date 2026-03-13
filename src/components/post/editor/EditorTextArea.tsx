// --- START OF FILE EditorTextArea.tsx ---
import React, { useRef, useEffect, ChangeEvent, forwardRef, useImperativeHandle } from 'react';

interface EditorTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const EditorTextArea = forwardRef<HTMLTextAreaElement, EditorTextAreaProps>(
  ({ value, onChange, placeholder, className = "" }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);

    // 将内部的 textarea 暴露给父组件，用于处理文本格式化时光标的位置
    useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);

    const adjustHeight = () => {
      const node = internalRef.current;
      if (node) {
        node.style.height = 'auto';
        node.style.height = `${node.scrollHeight}px`;
      }
    };

    useEffect(() => {
      adjustHeight();
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    };

    return (
      <textarea
        ref={internalRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={1}
        className={`w-full bg-transparent border-none outline-none resize-none overflow-hidden block font-black leading-relaxed ${className}`}
      />
    );
  }
);

EditorTextArea.displayName = 'EditorTextArea';
export default EditorTextArea;