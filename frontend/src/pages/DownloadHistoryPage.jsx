import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DownloadHistoryPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await axios.get('/api/download/status/all');
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch download jobs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    
    const interval = setInterval(() => {
      if (polling) {
        fetchJobs();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchJobs, polling]);

  const handleCancel = async (jobId) => {
    try {
      await axios.post(`/api/download/cancel/${jobId}`);
      toast.success('Download cancelled');
      fetchJobs();
    } catch (error) {
      toast.error('Failed to cancel download');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job from history?')) {
      return;
    }
    try {
      await axios.delete(`/api/download/history/${jobId}`);
      toast.success('Job deleted from history');
      fetchJobs();
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all download history?')) {
      return;
    }
    try {
      await axios.post('/api/download/history/clear');
      toast.success('Download history cleared');
      setJobs([]);
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 text-green-100';
      case 'processing':
        return 'bg-blue-600 text-blue-100';
      case 'pending':
        return 'bg-yellow-600 text-yellow-100';
      case 'failed':
        return 'bg-red-600 text-red-100';
      case 'cancelled':
        return 'bg-gray-600 text-gray-100';
      default:
        return 'bg-secondary-600 text-secondary-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Download History</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setPolling(!polling)}
            className="btn-secondary px-4 py-2 text-sm"
          >
            {polling ? 'Stop Auto-Refresh' : 'Start Auto-Refresh'}
          </button>
          <button
            onClick={handleClearHistory}
            className="btn-danger px-4 py-2 text-sm"
            disabled={jobs.length === 0}
          >
            Clear History
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8 text-secondary-400">
            No download jobs found. Your downloads will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-700">
                  <th className="text-left py-3 px-4 text-sm font-medium">Job ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Platform</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Query</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Files</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Progress</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Created</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.job_id || job.id} className="border-b border-secondary-800 hover:bg-secondary-700">
                    <td className="py-3 px-4 text-sm font-mono truncate max-w-xs">
                      {job.job_id || job.id}
                    </td>
                    <td className="py-3 px-4">{job.platform}</td>
                    <td className="py-3 px-4 text-sm truncate max-w-xs">
                      {job.search_query || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {job.completed_files}/{job.total_files}
                      </div>
                      {job.failed_files > 0 && (
                        <div className="text-xs text-red-400">
                          {job.failed_files} failed
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-secondary-700 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${job.progress || 0}%` }}
                        />
                      </div>
                      <div className="text-xs text-center mt-1">
                        {Math.round(job.progress || 0)}%
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(job.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {['pending', 'processing'].includes(job.status) && (
                          <button
                            onClick={() => handleCancel(job.job_id || job.id)}
                            className="text-yellow-400 hover:text-yellow-300"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(job.job_id || job.id)}
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
    </div>
  );
};

export default DownloadHistoryPage;
