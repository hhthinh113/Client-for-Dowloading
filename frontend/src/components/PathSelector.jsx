import React, { useState, useEffect, useCallback } from 'react';
import { listDirectories, createDirectory, checkPath, saveRecentPath } from '../services/settingsApi';
import toast from 'react-hot-toast';

const PathSelector = ({ value, onChange, onClose, defaultPath }) => {
  const [currentPath, setCurrentPath] = useState(value || defaultPath || '');
  const [directories, setDirectories] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newDirName, setNewDirName] = useState('');
  const [pathHistory, setPathHistory] = useState([]);
  const [showNewDirInput, setShowNewDirInput] = useState(false);

  const loadDirectories = useCallback(async (path) => {
    try {
      setLoading(true);
      const response = await listDirectories(path);
      setDirectories(response.data.directories || []);
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Failed to load directories:', error);
      toast.error('Failed to load directories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentPath) {
      loadDirectories(currentPath);
    }
  }, [currentPath, loadDirectories]);

  // Initialize with default path
  useEffect(() => {
    if (defaultPath) {
      setCurrentPath(defaultPath);
    }
  }, [defaultPath]);

  const handlePathChange = (newPath) => {
    setCurrentPath(newPath);
    onChange(newPath);
  };

  const handleNavigate = (dir) => {
    const newPath = currentPath ? `${currentPath}/${dir.name}` : dir.name;
    setPathHistory(prev => [...prev, currentPath]);
    setCurrentPath(newPath);
    handlePathChange(newPath);
  };

  const handleGoBack = () => {
    if (pathHistory.length > 0) {
      const prevPath = pathHistory[pathHistory.length - 1];
      setPathHistory(prev => prev.slice(0, -1));
      setCurrentPath(prevPath);
      handlePathChange(prevPath);
    }
  };

  const handleGoUp = () => {
    if (currentPath) {
      const parts = currentPath.split(/[\/\\]/).filter(Boolean);
      const parentPath = parts.slice(0, -1).join('/');
      setPathHistory(prev => [...prev, currentPath]);
      setCurrentPath(parentPath);
      handlePathChange(parentPath);
    }
  };

  const handleSelectPath = () => {
    // Save to recent paths
    if (currentPath) {
      saveRecentPath(currentPath).catch(console.error);
    }
    onClose();
  };

  const handleCreateNewDir = async (e) => {
    e.preventDefault();
    if (!newDirName.trim()) return;

    try {
      const fullPath = currentPath ? `${currentPath}/${newDirName}` : newDirName;
      await createDirectory(fullPath);
      toast.success(`Created directory: ${newDirName}`);
      setNewDirName('');
      setShowNewDirInput(false);
      loadDirectories(currentPath);
    } catch (error) {
      toast.error('Failed to create directory: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleQuickSelect = (path) => {
    setCurrentPath(path);
    handlePathChange(path);
  };

  // Get common paths for quick selection
  const getQuickPaths = () => {
    return [
      { name: 'Downloads', path: getUserDownloadsPath() },
      { name: 'Documents', path: getUserDocumentsPath() },
      { name: 'Pictures', path: getUserPicturesPath() },
      { name: 'Desktop', path: getUserDesktopPath() },
    ];
  };

  // Helper functions to get common user paths
  const getUserDownloadsPath = () => {
    if (typeof window !== 'undefined') {
      return '/Users/' + (navigator.userAgent.includes('Win') ? 'C:\\Users\\' + (window.env?.USERNAME || '') + '\\Downloads' : 
               navigator.userAgent.includes('Mac') ? process.env.HOME + '/Downloads' : 
               process.env.HOME + '/Downloads');
    }
    return '';
  };

  const getUserDocumentsPath = () => {
    if (typeof window !== 'undefined') {
      return navigator.userAgent.includes('Win') ? 'C:\\Users\\' + (window.env?.USERNAME || '') + '\\Documents' :
             navigator.userAgent.includes('Mac') ? process.env.HOME + '/Documents' :
             process.env.HOME + '/Documents';
    }
    return '';
  };

  const getUserPicturesPath = () => {
    if (typeof window !== 'undefined') {
      return navigator.userAgent.includes('Win') ? 'C:\\Users\\' + (window.env?.USERNAME || '') + '\\Pictures' :
             navigator.userAgent.includes('Mac') ? process.env.HOME + '/Pictures' :
             process.env.HOME + '/Pictures';
    }
    return '';
  };

  const getUserDesktopPath = () => {
    if (typeof window !== 'undefined') {
      return navigator.userAgent.includes('Win') ? 'C:\\Users\\' + (window.env?.USERNAME || '') + '\\Desktop' :
             navigator.userAgent.includes('Mac') ? process.env.HOME + '/Desktop' :
             process.env.HOME + '/Desktop';
    }
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-secondary-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Select Download Location</h2>
          <button onClick={onClose} className="text-secondary-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Current path */}
          <div className="bg-secondary-700 rounded-md p-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleGoBack}
                disabled={pathHistory.length === 0}
                className="text-secondary-400 hover:text-white disabled:opacity-50"
              >
                ← Back
              </button>
              <button
                onClick={handleGoUp}
                disabled={!currentPath}
                className="text-secondary-400 hover:text-white disabled:opacity-50"
              >
                ↑ Up
              </button>
              <span className="text-sm text-secondary-300 truncate">
                {currentPath || 'Root'}
              </span>
            </div>
          </div>

          {/* Quick selection paths */}
          <div>
            <h3 className="text-sm font-medium text-secondary-300 mb-2">Quick Select</h3>
            <div className="flex flex-wrap gap-2">
              {getQuickPaths().map((quickPath, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSelect(quickPath.path)}
                  className="px-3 py-1 bg-secondary-700 hover:bg-secondary-600 text-sm rounded transition-colors"
                >
                  {quickPath.name}
                </button>
              ))}
            </div>
          </div>

          {/* Current directory contents */}
          <div>
            <h3 className="text-sm font-medium text-secondary-300 mb-2">Directories</h3>
            {loading ? (
              <div className="text-secondary-400">Loading...</div>
            ) : directories.length === 0 ? (
              <div className="text-secondary-500 text-sm">No subdirectories found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {directories.map((dir) => (
                  <button
                    key={dir.path}
                    onClick={() => handleNavigate(dir)}
                    className="flex items-center gap-2 px-3 py-2 bg-secondary-700 hover:bg-secondary-600 rounded text-left transition-colors"
                  >
                    <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    <span className="truncate">{dir.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create new directory */}
          <div className="border-t border-secondary-700 pt-4">
            {!showNewDirInput ? (
              <button
                onClick={() => setShowNewDirInput(true)}
                className="flex items-center gap-2 text-secondary-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Directory
              </button>
            ) : (
              <form onSubmit={handleCreateNewDir} className="flex gap-2">
                <input
                  type="text"
                  value={newDirName}
                  onChange={(e) => setNewDirName(e.target.value)}
                  placeholder="Directory name"
                  className="flex-1 input-field text-sm"
                  autoFocus
                />
                <button type="submit" className="btn-primary px-3 py-1 text-sm">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewDirInput(false);
                    setNewDirName('');
                  }}
                  className="btn-secondary px-3 py-1 text-sm"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>

          {/* Manual path input */}
          <div className="border-t border-secondary-700 pt-4">
            <h3 className="text-sm font-medium text-secondary-300 mb-2">Or enter path manually</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentPath}
                onChange={(e) => setCurrentPath(e.target.value)}
                placeholder="Enter full path (e.g., /Users/name/Downloads/MyFolder)"
                className="flex-1 input-field text-sm"
              />
              <button
                onClick={handleSelectPath}
                className="btn-primary px-4 py-1 text-sm"
              >
                Select
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 border-t border-secondary-700 pt-4">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSelectPath}
              className="btn-primary"
              disabled={!currentPath}
            >
              Select Path
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathSelector;
