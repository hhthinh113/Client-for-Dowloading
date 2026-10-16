import React, { useState, useEffect } from 'react';
import PathSelector from './PathSelector';
import { getDownloadSettings, saveRecentPath } from '../services/settingsApi';

const DownloadModal = ({ isOpen, onClose, onConfirm, isConfirming, itemCount }) => {
  const [destinationPath, setDestinationPath] = useState('');
  const [namingPattern, setNamingPattern] = useState('{author}_{id}_{index}');
  const [showPathSelector, setShowPathSelector] = useState(false);
  const [defaultPath, setDefaultPath] = useState('');
  const [recentPaths, setRecentPaths] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const response = await getDownloadSettings();
      setDefaultPath(response.data.default_path || '');
      setRecentPaths(response.data.recent_paths || []);
      if (response.data.default_path) {
        setDestinationPath(response.data.default_path);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSelectPath = (path) => {
    setDestinationPath(path);
    setShowPathSelector(false);
    saveRecentPath(path).catch(console.error);
  };

  const handleUseRecentPath = (path) => {
    setDestinationPath(path);
  };

  const handleUseDefaultPath = () => {
    setDestinationPath(defaultPath);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(destinationPath, namingPattern);
  };

  if (!isOpen) return null;

  // Get common system paths
  const getSystemPaths = () => {
    const paths = [];
    
    // Try to get user home directory
    if (typeof window !== 'undefined') {
      const isWindows = navigator.userAgent.includes('Win');
      const isMac = navigator.userAgent.includes('Mac');
      
      if (isWindows) {
        paths.push(
          { name: 'Downloads', path: 'C:\\Users\\' + getWindowsUsername() + '\\Downloads' },
          { name: 'Documents', path: 'C:\\Users\\' + getWindowsUsername() + '\\Documents' },
          { name: 'Pictures', path: 'C:\\Users\\' + getWindowsUsername() + '\\Pictures' },
          { name: 'Desktop', path: 'C:\\Users\\' + getWindowsUsername() + '\\Desktop' }
        );
      } else if (isMac) {
        paths.push(
          { name: 'Downloads', path: '/Users/' + getMacUsername() + '/Downloads' },
          { name: 'Documents', path: '/Users/' + getMacUsername() + '/Documents' },
          { name: 'Pictures', path: '/Users/' + getMacUsername() + '/Pictures' },
          { name: 'Desktop', path: '/Users/' + getMacUsername() + '/Desktop' }
        );
      } else {
        // Linux/Unix
        paths.push(
          { name: 'Downloads', path: process.env.HOME + '/Downloads' },
          { name: 'Documents', path: process.env.HOME + '/Documents' },
          { name: 'Pictures', path: process.env.HOME + '/Pictures' },
          { name: 'Desktop', path: process.env.HOME + '/Desktop' }
        );
      }
    }
    
    return paths;
  };

  const getWindowsUsername = () => {
    if (typeof window !== 'undefined' && window.env && window.env.USERNAME) {
      return window.env.USERNAME;
    }
    return 'YourName';
  };

  const getMacUsername = () => {
    if (typeof window !== 'undefined' && window.process && window.process.env && window.process.env.USER) {
      return window.process.env.USER;
    }
    return 'YourName';
  };

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
            
            {/* Quick selection buttons */}
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setShowPathSelector(true)}
                className="flex items-center gap-2 btn-secondary text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Browse
              </button>
              
              {defaultPath && (
                <button
                  type="button"
                  onClick={handleUseDefaultPath}
                  className="btn-secondary text-sm"
                >
                  Default
                </button>
              )}
            </div>
            
            {/* System paths quick select */}
            <div className="mb-2">
              <div className="text-xs text-secondary-500 mb-1">Quick paths:</div>
              <div className="flex flex-wrap gap-1">
                {getSystemPaths().map((sysPath, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setDestinationPath(sysPath.path)}
                    className="px-2 py-1 bg-secondary-700 hover:bg-secondary-600 text-xs rounded transition-colors"
                    title={sysPath.path}
                  >
                    {sysPath.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Recent paths */}
            {recentPaths.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-secondary-500 mb-1">Recent paths:</div>
                <div className="flex flex-wrap gap-1">
                  {recentPaths.map((path, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleUseRecentPath(path)}
                      className="px-2 py-1 bg-secondary-700 hover:bg-secondary-600 text-xs rounded transition-colors truncate max-w-xs"
                      title={path}
                    >
                      {path.length > 30 ? '...' + path.slice(-27) : path}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <input
              type="text"
              value={destinationPath}
              onChange={(e) => setDestinationPath(e.target.value)}
              placeholder="Enter destination folder path"
              required
              className="input-field"
            />
            <p className="text-xs text-secondary-500 mt-1">
              Example: /path/to/your/folder or C:\Users\YourName\Downloads\MyMedia
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
              disabled={isConfirming || !destinationPath}
            >
              {isConfirming ? 'Starting Download...' : 'Start Download'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Path Selector Modal */}
      {showPathSelector && (
        <PathSelector
          value={destinationPath}
          onChange={handleSelectPath}
          onClose={() => setShowPathSelector(false)}
          defaultPath={defaultPath}
        />
      )}
    </div>
  );
};

export default DownloadModal;
