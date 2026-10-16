<?php

namespace App\Http\Controllers;

use App\Jobs\DownloadMediaJob;
use App\Models\DownloadJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Bus;

class DownloadController extends Controller
{
    public function downloadSingle(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url',
            'destination_path' => 'required|string',
            'naming_pattern' => 'required|string',
            'platform' => 'required|string',
            'author' => 'nullable|string',
            'id' => 'nullable|string',
            'index' => 'nullable|integer',
            'type' => 'required|in:image,video',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()
            ], 422);
        }

        try {
            $jobId = Str::uuid();
            $job = DownloadJob::create([
                'job_id' => $jobId,
                'user_id' => auth()->id() ?? null,
                'status' => DownloadJob::STATUS_PENDING,
                'total_files' => 1,
                'completed_files' => 0,
                'failed_files' => 0,
                'destination_path' => $request->destination_path,
                'naming_pattern' => $request->naming_pattern,
                'platform' => $request->platform,
                'search_query' => '',
                'progress' => 0,
                'files_list' => [[
                    'url' => $request->url,
                    'author' => $request->author,
                    'id' => $request->id,
                    'index' => $request->index ?? 0,
                    'type' => $request->type,
                ]],
            ]);

            $this->dispatchDownloadJob($job);

            return response()->json([
                'job_id' => $jobId,
                'message' => 'Download started',
                'status' => 'pending'
            ]);
        } catch (\Exception $e) {
            Log::error("Single download failed: " . $e->getMessage());
            return response()->json([
                'error' => 'Download failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadBatch(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'files' => 'required|array|min:1',
            'files.*.url' => 'required|url',
            'files.*.type' => 'required|in:image,video',
            'destination_path' => 'required|string',
            'naming_pattern' => 'required|string',
            'platform' => 'required|string',
            'search_query' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()
            ], 422);
        }

        try {
            $jobId = Str::uuid();
            $files = $request->files;

            $job = DownloadJob::create([
                'job_id' => $jobId,
                'user_id' => auth()->id() ?? null,
                'status' => DownloadJob::STATUS_PENDING,
                'total_files' => count($files),
                'completed_files' => 0,
                'failed_files' => 0,
                'destination_path' => $request->destination_path,
                'naming_pattern' => $request->naming_pattern,
                'platform' => $request->platform,
                'search_query' => $request->search_query ?? '',
                'progress' => 0,
                'files_list' => $files,
            ]);

            $this->dispatchDownloadJob($job);

            return response()->json([
                'job_id' => $jobId,
                'message' => 'Batch download started',
                'total_files' => count($files),
                'status' => 'pending'
            ]);
        } catch (\Exception $e) {
            Log::error("Batch download failed: " . $e->getMessage());
            return response()->json([
                'error' => 'Batch download failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getStatus($jobId)
    {
        $job = DownloadJob::where('job_id', $jobId)->first();
        if (!$job) {
            return response()->json(['error' => 'Job not found'], 404);
        }
        return response()->json($job);
    }

    public function getProgress($jobId)
    {
        $job = DownloadJob::where('job_id', $jobId)->first();
        if (!$job) {
            return response()->json(['error' => 'Job not found'], 404);
        }

        return response()->json([
            'progress' => $job->progress,
            'completed' => $job->completed_files,
            'total' => $job->total_files,
            'status' => $job->status,
            'failed' => $job->failed_files,
        ]);
    }

    public function cancelDownload($jobId)
    {
        $job = DownloadJob::where('job_id', $jobId)->first();
        if (!$job) {
            return response()->json(['error' => 'Job not found'], 404);
        }

        if ($job->status === DownloadJob::STATUS_PROCESSING) {
            $job->update([
                'status' => DownloadJob::STATUS_CANCELLED,
                'error_message' => 'Download cancelled by user'
            ]);
            return response()->json(['message' => 'Download cancelled']);
        }

        return response()->json(['message' => 'Job cannot be cancelled', 'status' => $job->status]);
    }

    protected function dispatchDownloadJob(DownloadJob $job)
    {
        try {
            $job->update(['status' => DownloadJob::STATUS_PROCESSING]);
            DownloadMediaJob::dispatch($job)->onQueue('downloads');
        } catch (\Exception $e) {
            $job->update([
                'status' => DownloadJob::STATUS_FAILED,
                'error_message' => $e->getMessage()
            ]);
            Log::error("Failed to dispatch download job: " . $e->getMessage());
        }
    }
}
