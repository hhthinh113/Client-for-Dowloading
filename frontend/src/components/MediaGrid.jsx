import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const MediaGrid = ({ items, selectedItems, onSelect, onPreview, onDownload }) => {
  const isSelected = (item) => {
    return selectedItems.some(i => i.id === item.id && i.platform === item.platform);
  };

  const handleSelect = (item, e) => {
    e.stopPropagation();
    onSelect(item);
  };

  const handlePreview = (item, e) => {
    e.stopPropagation();
    onPreview(item.preview_url || item.full_url, item.type);
  };

  const handleDownload = (item, e) => {
    e.stopPropagation();
    onDownload(item);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {items.map((item) => (
        <div
          key={`${item.platform}-${item.id}`}
          className="card group cursor-pointer hover:bg-secondary-700 transition-colors"
        >
          <div className="relative aspect-square overflow-hidden rounded-md mb-3">
            {item.type === 'video' ? (
              <video
                src={item.preview_url || item.full_url}
                className="w-full h-full object-cover"
                onClick={() => handlePreview(item)}
              />
            ) : (
              <img
                src={item.preview_url || item.full_url}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onClick={() => handlePreview(item)}
              />
            )}
            <div className="absolute top-2 left-2">
              <input
                type="checkbox"
                checked={isSelected(item)}
                onChange={(e) => handleSelect(item, e)}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5"
              />
            </div>
            <div className="absolute top-2 right-2 flex gap-1">
              <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                {item.platform}
              </span>
              {item.type && (
                <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                  {item.type}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="text-sm font-medium truncate">{item.title || 'Untitled'}</h3>
            <p className="text-xs text-secondary-400 truncate">By: {item.author || 'Unknown'}</p>
            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-2">
                <button
                  onClick={(e) => handleDownload(item, e)}
                  className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-2 py-1 rounded"
                >
                  Download
                </button>
              </div>
              <div className="flex gap-2 text-xs text-secondary-400">
                <span>📥 {item.downloads || 0}</span>
                <span>❤️ {item.likes || 0}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaGrid;
