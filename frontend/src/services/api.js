import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Media API
export const searchMedia = (platform, query, page = 1, perPage = 20, tags = null, category = null, orientation = null) => {
  return api.get('/media/search', {
    params: { platform, query, page, per_page: perPage, tags, category, orientation }
  });
};

export const getMedia = (platform, query, page = 1, perPage = 20) => {
  return api.get(`/media/${platform}`, {
    params: { query, page, per_page: perPage }
  });
};

export const getPreview = (url, type) => {
  return api.post('/media/preview', { url, type });
};

// API Sources API
export const getApiSources = (platform = null) => {
  return api.get('/api-sources', { params: { platform } });
};

export const createApiSource = (data) => {
  return api.post('/api-sources', data);
};

export const getApiSource = (id) => {
  return api.get(`/api-sources/${id}`);
};

export const updateApiSource = (id, data) => {
  return api.put(`/api-sources/${id}`, data);
};

export const deleteApiSource = (id) => {
  return api.delete(`/api-sources/${id}`);
};

export const testApiConnection = (data) => {
  return api.post('/api-sources/test', data);
};

// Download API
export const downloadSingle = (data) => {
  return api.post('/download/single', data);
};

export const downloadBatch = (data) => {
  return api.post('/download/batch', data);
};

export const getDownloadStatus = (jobId) => {
  return api.get(`/download/status/${jobId}`);
};

export const getDownloadProgress = (jobId) => {
  return api.get(`/download/progress/${jobId}`);
};

export const cancelDownload = (jobId) => {
  return api.post(`/download/cancel/${jobId}`);
};

// Config API
export const getConfig = () => {
  return api.get('/config');
};

export default api;
