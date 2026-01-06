import React, { useRef, useEffect, ChangeEvent } from 'react';

interface EditorTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const EditorTextArea: React.FC<EditorTextAreaProps> = ({ value, onChange, placeholder, className = "" }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      rows={1}
      className={`w-full bg-transparent border-none outline-none resize-none overflow-hidden block font-black leading-relaxed ${className}`}
    />
  );
};

export default EditorTextArea;