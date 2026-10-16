import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import MediaSearchPage from './pages/MediaSearchPage';
import ApiSourcesPage from './pages/ApiSourcesPage';
import DownloadHistoryPage from './pages/DownloadHistoryPage';

function App() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get('/api/config');
        setConfig(response.data);
      } catch (error) {
        console.error('Failed to fetch config:', error);
        toast.error('Failed to load application configuration');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-900">
      <nav className="bg-secondary-800 border-b border-secondary-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-xl font-bold text-white hover:text-primary-400 transition-colors">
              Media Downloader
            </Link>
            <div className="flex space-x-4">
              <Link to="/" className="text-secondary-300 hover:text-white transition-colors">
                Search
              </Link>
              <Link to="/api-sources" className="text-secondary-300 hover:text-white transition-colors">
                API Sources
              </Link>
              <Link to="/history" className="text-secondary-300 hover:text-white transition-colors">
                History
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {config && (
              <>
                {config.pixabay_enabled && (
                  <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Pixabay</span>
                )}
                {config.unsplash_enabled && (
                  <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Unsplash</span>
                )}
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Safebooru</span>
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Danbooru</span>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<MediaSearchPage config={config} />} />
          <Route path="/api-sources" element={<ApiSourcesPage />} />
          <Route path="/history" element={<DownloadHistoryPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
