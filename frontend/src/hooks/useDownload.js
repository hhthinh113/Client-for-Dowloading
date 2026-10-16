import { useState, useCallback, useEffect } from 'react';
import { downloadSingle, downloadBatch, getDownloadProgress, cancelDownload } from '../services/api';
import toast from 'react-hot-toast';

export const useDownload = () => {
  const [downloads, setDownloads] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const startDownload = useCallback(async (data) => {
    try {
      setIsDownloading(true);
      const response = await downloadSingle(data);
      const jobId = response.data.job_id;
      
      setDownloads(prev => [
        ...prev,
        { jobId, status: 'pending', progress: 0, ...data }
      ]);

      toast.success('Download started');
      return jobId;
    } catch (error) {
      toast.error('Failed to start download: ' + (error.response?.data?.message || error.message));
      throw error;
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const startBatchDownload = useCallback(async (data) => {
    try {
      setIsDownloading(true);
      const response = await downloadBatch(data);
      const jobId = response.data.job_id;
      
      setDownloads(prev => [
        ...prev,
        { jobId, status: 'pending', progress: 0, ...data }
      ]);

      toast.success(`Batch download started (${data.files.length} files)`);
      return jobId;
    } catch (error) {
      toast.error('Failed to start batch download: ' + (error.response?.data?.message || error.message));
      throw error;
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const checkProgress = useCallback(async (jobId) => {
    try {
      const response = await getDownloadProgress(jobId);
      return response.data;
    } catch (error) {
      console.error('Failed to check progress:', error);
      return null;
    }
  }, []);

  const stopDownload = useCallback(async (jobId) => {
    try {
      await cancelDownload(jobId);
      setDownloads(prev => prev.map(d => 
        d.jobId === jobId ? { ...d, status: 'cancelled' } : d
      ));
      toast.success('Download cancelled');
    } catch (error) {
      toast.error('Failed to cancel download');
    }
  }, []);

  const pollProgress = useCallback(async (jobId) => {
    const checkInterval = setInterval(async () => {
      const progress = await checkProgress(jobId);
      if (!progress) {
        clearInterval(checkInterval);
        return;
      }

      setDownloads(prev => prev.map(d => 
        d.jobId === jobId ? { ...d, ...progress } : d
      ));

      if (progress.status === 'completed' || progress.status === 'failed' || progress.status === 'cancelled') {
        clearInterval(checkInterval);
        if (progress.status === 'completed') {
          toast.success('Download completed');
        } else if (progress.status === 'failed') {
          toast.error('Download failed');
        }
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, [checkProgress]);

  useEffect(() => {
    downloads.forEach(download => {
      if (download.status === 'pending' || download.status === 'processing') {
        pollProgress(download.jobId);
      }
    });
  }, [downloads, pollProgress]);

  const removeDownload = useCallback((jobId) => {
    setDownloads(prev => prev.filter(d => d.jobId !== jobId));
  }, []);

  return {
    downloads,
    isDownloading,
    startDownload,
    startBatchDownload,
    stopDownload,
    removeDownload,
  };
};

export default useDownload;
