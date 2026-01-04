// src/components/DownloadSection.jsx
import React from 'react';
import { Download, Lock } from 'lucide-react';

const DownloadSection = ({ downloads, onDecryptClick }) => {
  if (!downloads || downloads.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 pt-6 border-t dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center">
        <Download className="mr-2" />
        下载资源
      </h2>
      <div className="space-y-3">
        {downloads.map(download => (
          <div key={download._id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
            <span className="text-gray-800 dark:text-gray-200">{download.description}</span>
            <button
              onClick={() => onDecryptClick(download.encryptedUrl)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              <Lock className="w-4 h-4 mr-2" />
              解密
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DownloadSection;