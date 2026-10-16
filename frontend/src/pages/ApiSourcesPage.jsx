import React, { useState, useEffect, useCallback } from 'react';
import { getApiSources, createApiSource, updateApiSource, deleteApiSource, testApiConnection } from '../services/api';
import toast from 'react-hot-toast';

const PLATFORMS = [
  { value: 'pixabay', label: 'Pixabay' },
  { value: 'safebooru', label: 'Safebooru' },
  { value: 'unsplash', label: 'Unsplash' },
  { value: 'custom', label: 'Custom' },
];

const ApiSourcesPage = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'pixabay',
    api_key: '',
    base_url: '',
    endpoint: '',
    params: '',
    is_active: true,
    description: '',
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const fetchSources = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getApiSources();
      setSources(response.data);
    } catch (error) {
      toast.error('Failed to fetch API sources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleParamsChange = (e) => {
    const { value } = e.target;
    try {
      const parsed = value ? JSON.parse(value) : {};
      setFormData(prev => ({
        ...prev,
        params: value ? parsed : null,
      }));
    } catch {
      // Invalid JSON, will be handled on submit
    }
  };

  const handleOpenModal = (source = null) => {
    if (source) {
      setEditingSource(source);
      setFormData({
        name: source.name,
        platform: source.platform,
        api_key: source.api_key || '',
        base_url: source.base_url,
        endpoint: source.endpoint || '',
        params: source.params ? JSON.stringify(source.params) : '',
        is_active: source.is_active,
        description: source.description || '',
      });
    } else {
      setEditingSource(null);
      setFormData({
        name: '',
        platform: 'pixabay',
        api_key: '',
        base_url: '',
        endpoint: '',
        params: '',
        is_active: true,
        description: '',
      });
    }
    setShowModal(true);
    setTestResult(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSource(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate params JSON
    if (formData.params && formData.params.trim()) {
      try {
        JSON.parse(formData.params);
      } catch {
        toast.error('Invalid JSON in params field');
        return;
      }
    }

    try {
      const data = {
        ...formData,
        params: formData.params && formData.params.trim() ? JSON.parse(formData.params) : null,
      };

      if (editingSource) {
        await updateApiSource(editingSource.id, data);
        toast.success('API source updated successfully');
      } else {
        await createApiSource(data);
        toast.success('API source created successfully');
      }
      fetchSources();
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to save API source: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this API source?')) {
      return;
    }

    try {
      await deleteApiSource(id);
      toast.success('API source deleted successfully');
      fetchSources();
    } catch (error) {
      toast.error('Failed to delete API source');
    }
  };

  const handleTestConnection = async () => {
    if (!formData.base_url && formData.platform !== 'custom') {
      toast.error('Please select a platform or enter a base URL');
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);
      
      const testData = {
        platform: formData.platform,
        api_key: formData.api_key,
        base_url: formData.base_url,
        endpoint: formData.endpoint,
      };

      const response = await testApiConnection(testData);
      setTestResult(response.data);
      
      if (response.data.success) {
        toast.success('Connection test successful');
      } else {
        toast.error('Connection test failed');
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection test failed',
        error: error.response?.data?.message || error.message,
      });
      toast.error('Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">API Sources Management</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          Add New API Source
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : sources.length === 0 ? (
          <div className="text-center py-8 text-secondary-400">
            No API sources found. Add your first API source to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-700">
                  <th className="text-left py-3 px-4 text-sm font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Platform</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Base URL</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr key={source.id} className="border-b border-secondary-800 hover:bg-secondary-700">
                    <td className="py-3 px-4">
                      <div className="font-medium">{source.name}</div>
                      <div className="text-xs text-secondary-500">{source.description}</div>
                    </td>
                    <td className="py-3 px-4">{source.platform_label || source.platform}</td>
                    <td className="py-3 px-4 text-sm truncate max-w-xs">{source.base_url}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        source.is_active ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
                      }`}>
                        {source.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(source)}
                          className="text-secondary-400 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(source.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-secondary-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingSource ? 'Edit API Source' : 'Add New API Source'}
              </h2>
              <button onClick={handleCloseModal} className="text-secondary-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="My Pixabay API"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-1">
                    Platform *
                  </label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    {PLATFORMS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  name="api_key"
                  value={formData.api_key}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Your API key (if required)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">
                  Base URL *
                </label>
                <input
                  type="url"
                  name="base_url"
                  value={formData.base_url}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="https://pixabay.com/api/"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">
                  Endpoint (optional)
                </label>
                <input
                  type="text"
                  name="endpoint"
                  value={formData.endpoint}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="search"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">
                  Parameters (JSON)
                </label>
                <textarea
                  name="params"
                  value={formData.params}
                  onChange={handleParamsChange}
                  className="input-field min-h-[100px]"
                  placeholder='{"param1": "value1", "param2": "value2"}'
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Enter additional parameters as JSON (optional)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field min-h-[80px]"
                  placeholder="Description of this API source"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Active</span>
                </label>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  className="btn-secondary px-4 py-2 text-sm"
                  disabled={testing}
                >
                  {testing ? 'Testing...' : 'Test Connection'}
                </button>

                {testResult && (
                  <span className={`px-3 py-2 rounded text-xs ${
                    testResult.success ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
                  }`}>
                    {testResult.success ? 'Connection successful' : 'Connection failed'}
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={testing}
                >
                  {editingSource ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiSourcesPage;
