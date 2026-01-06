import React from 'react';
import { Twitter, Facebook, Linkedin, Link as LinkIcon, LucideIcon } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

interface ShareLink {
  name: string;
  icon: LucideIcon;
  url: string;
  color: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks: ShareLink[] = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'bg-[#1DA1F2] hover:bg-[#1a91da]'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-[#4267B2] hover:bg-[#365899]'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      color: 'bg-[#0077B5] hover:bg-[#006399]'
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('链接已复制到剪贴板！');
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="flex items-center space-x-4 my-6">
      <span className="text-sm text-gray-600 dark:text-gray-400">分享:</span>
      {shareLinks.map(({ name, icon: Icon, url, color }) => (
        <a
          key={name}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`
            ${color} text-white p-2 rounded-full
            transition-transform duration-200 hover:scale-110
          `}
          aria-label={`Share on ${name}`}
        >
          <Icon size={16} />
        </a>
      ))}
      <button
        onClick={copyToClipboard}
        className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-full
                 transition-transform duration-200 hover:scale-110"
        aria-label="Copy link"
      >
        <LinkIcon size={16} />
      </button>
    </div>
  );
};

export default ShareButtons;