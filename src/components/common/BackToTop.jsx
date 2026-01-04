// components/common/BackToTop.jsx
import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 rounded-full bg-blue-600 text-white shadow-lg 
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                   dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200 z-50"
          aria-label="Back to top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </>
  );
}

export default BackToTop;