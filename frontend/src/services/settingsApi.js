import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Download settings
export const getDownloadSettings = () => {
  return api.get('/settings/download');
};

export const saveDownloadSettings = (data) => {
  return api.post('/settings/download', data);
};

export const saveRecentPath = (path) => {
  return api.post('/settings/download/recent', { path });
};

// Directory management
export const listDirectories = (path) => {
  return api.post('/settings/directories', { path });
};

export const createDirectory = (path) => {
  return api.post('/settings/directories/create', { path });
};

export const checkPath = (path) => {
  return api.post('/settings/path/check', { path });
};

export default {
  getDownloadSettings,
  saveDownloadSettings,
  saveRecentPath,
  listDirectories,
  createDirectory,
  checkPath,
};
