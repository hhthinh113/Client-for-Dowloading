import React, { useState, useEffect, useCallback } from 'react';
import { searchMedia } from '../services/api';
import toast from 'react-hot-toast';
import MediaGrid from '../components/MediaGrid';
import DownloadModal from '../components/DownloadModal';
import { useDownload } from '../hooks/useDownload';

const PLATFORMS = [
  { value: 'pixabay', label: 'Pixabay' },
  { value: 'safebooru', label: 'Safebooru' },
  { value: 'danbooru', label: 'Danbooru' },
  { value: 'unsplash', label: 'Unsplash' },
];

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'photo', label: 'Photos' },
  { value: 'illustration', label: 'Illustrations' },
  { value: 'vector', label: 'Vectors' },
  { value: 'video', label: 'Videos' },
];

const ORIENTATIONS = [
  { value: '', label: 'All' },
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
];

const MediaSearchPage = ({ config }) => {
  const [platform, setPlatform] = useState('pixabay');
  const [query, setQuery] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [orientation, setOrientation] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  const { startDownload, startBatchDownload, isDownloading, downloads } = useDownload();
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const fetchMedia = useCallback(async () => {
    if (!query.trim() && !tags.trim()) {
      toast.error('Please enter a search query or tag');
      return;
    }

    try {
      setLoading(true);
      const searchQuery = query || tags;
      const response = await searchMedia(
        platform,
        searchQuery,
        page,
        perPage,
        tags || null,
        category || null,
        orientation || null
      );

      setResults(response.data.results || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to search media: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [platform, query, tags, category, orientation, page, perPage]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (page === 1) {
        fetchMedia();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [platform, query, tags, category, orientation, fetchMedia]);

  useEffect(() => {
    if (page > 1) {
      fetchMedia();
    }
  }, [page, fetchMedia]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMedia();
  };

  const handlePlatformChange = (e) => {
    setPlatform(e.target.value);
    setPage(1);
  };

  const handleSelectItem = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id && i.platform === item.platform);
      if (exists) {
        return prev.filter(i => !(i.id === item.id && i.platform === item.platform));
      }
      return [...prev, item];
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === results.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(results.map(item => ({ ...item })));
    }
  };

  const handlePreview = (url, type) => {
    setPreviewUrl(url);
    setPreviewType(type);
  };

  const handleClosePreview = () => {
    setPreviewUrl(null);
    setPreviewType(null);
  };

  const handleDownloadSelected = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item');
      return;
    }
    setShowDownloadModal(true);
  };

  const handleDownloadSingle = (item) => {
    setSelectedItems([item]);
    setShowDownloadModal(true);
  };

  const confirmDownload = async (destinationPath, namingPattern) => {
    try {
      if (selectedItems.length === 1) {
        const item = selectedItems[0];
        await startDownload({
          url: item.full_url,
          destination_path: destinationPath,
          naming_pattern: namingPattern,
          platform: item.platform,
          author: item.author,
          id: item.id,
          index: 0,
          type: item.type,
        });
      } else {
        await startBatchDownload({
          files: selectedItems.map((item, index) => ({
            url: item.full_url,
            author: item.author,
            id: item.id,
            index,
            type: item.type,
          })),
          destination_path: destinationPath,
          naming_pattern: namingPattern,
          platform: selectedItems[0].platform,
          search_query: query,
        });
      }
      setShowDownloadModal(false);
      setSelectedItems([]);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Search Media</h2>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">Platform</label>
              <select
                value={platform}
                onChange={handlePlatformChange}
                className="input-field"
                disabled={!config}
              >
                {PLATFORMS.map(p => (
                  <option key={p.value} value={p.value} disabled={!config?.[`${p.value}_enabled`] && p.value !== 'safebooru'}>{
                    p.label
                  }</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">Search Query</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter search term"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags (comma separated)"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">Orientation</label>
              <select value={orientation} onChange={(e) => setOrientation(e.target.value)} className="input-field">
                {ORIENTATIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-1">Per Page</label>
              <select value={perPage} onChange={(e) => setPerPage(parseInt(e.target.value))} className="input-field">
                {[10, 20, 30, 50].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {results.length > 0 && (
        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="text-sm text-secondary-400">
              Found {total} results (Page {page} of {totalPages})
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="btn-secondary px-3 py-1 text-sm"
              >
                {selectedItems.length === results.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handleDownloadSelected}
                className="btn-success px-4 py-1 text-sm"
                disabled={selectedItems.length === 0 || isDownloading}
              >
                Download Selected ({selectedItems.length})
              </button>
            </div>
          </div>

          <MediaGrid
            items={results}
            selectedItems={selectedItems}
            onSelect={handleSelectItem}
            onPreview={handlePreview}
            onDownload={handleDownloadSingle}
          />

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary px-3 py-1 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-secondary-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary px-3 py-1 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      )}

      {previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={handleClosePreview}>
          <div className="relative max-w-4xl max-h-[80vh]" onClick={e => e.stopPropagation()}>
            {previewType === 'video' ? (
              <video src={previewUrl} controls className="w-full h-full object-contain" />
            ) : (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
            )}
            <button
              onClick={handleClosePreview}
              className="absolute -top-10 -right-10 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onConfirm={confirmDownload}
        isConfirming={isDownloading}
        itemCount={selectedItems.length}
      />
    </div>
  );
};

export default MediaSearchPage;
