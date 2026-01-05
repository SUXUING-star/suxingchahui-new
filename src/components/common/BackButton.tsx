import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const BackButton: React.FC<{ to?: string; text?: string }> = ({ to = "/", text = "BACK TO NEXUS" }) => (
  <Link to={to} className="inline-flex items-center px-4 py-2 bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-full text-[10px] font-black text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-all shadow-lg mb-8 uppercase tracking-[0.2em]">
    <ChevronLeft size={16} className="mr-1.5" /> {text}
  </Link>
);
export default BackButton;