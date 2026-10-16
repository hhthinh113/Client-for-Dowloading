import React, { useState } from 'react';

const DownloadModal = ({ isOpen, onClose, onConfirm, isConfirming, itemCount }) => {
  const [destinationPath, setDestinationPath] = useState('');
  const [namingPattern, setNamingPattern] = useState('{author}_{id}_{index}');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(destinationPath, namingPattern);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-secondary-800 rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Download Settings</h2>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-white"
            disabled={isConfirming}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-1">
              Destination Folder
            </label>
            <input
              type="text"
              value={destinationPath}
              onChange={(e) => setDestinationPath(e.target.value)}
              placeholder="Enter destination folder path"
              required
              className="input-field"
            />
            <p className="text-xs text-secondary-500 mt-1">
              Example: /path/to/your/folder or C:\\Users\\YourName\\Downloads
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-1">
              File Naming Pattern
            </label>
            <input
              type="text"
              value={namingPattern}
              onChange={(e) => setNamingPattern(e.target.value)}
              placeholder="Enter naming pattern"
              required
              className="input-field"
            />
            <div className="text-xs text-secondary-500 mt-1 space-y-1">
              <p>Available placeholders:</p>
              <div className="grid grid-cols-2 gap-2">
                <span className="bg-secondary-700 px-2 py-1 rounded">{'{author}'}</span>
                <span className="bg-secondary-700 px-2 py-1 rounded">{'{id}'}</span>
                <span className="bg-secondary-700 px-2 py-1 rounded">{'{index}'}</span>
                <span className="bg-secondary-700 px-2 py-1 rounded">{'{type}'}</span>
                <span className="bg-secondary-700 px-2 py-1 rounded">{'{timestamp}'}</span>
                <span className="bg-secondary-700 px-2 py-1 rounded">{'{random}'}</span>
              </div>
              <p className="mt-2">Example: {'{author}_{id}_{index}'} -> user123_456_0.jpg</p>
            </div>
          </div>

          <div className="text-sm text-secondary-400">
            Downloading {itemCount} file{itemCount > 1 ? 's' : ''}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isConfirming}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-success"
              disabled={isConfirming}
            >
              {isConfirming ? 'Starting Download...' : 'Start Download'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DownloadModal;
