<?php

namespace App\Jobs;

use App\Models\DownloadJob;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DownloadMediaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $job;

    public function __construct(DownloadJob $job)
    {
        $this->job = $job;
    }

    public function handle()
    {
        try {
            $this->job->update([
                'status' => DownloadJob::STATUS_PROCESSING,
                'progress' => 0,
                'completed_files' => 0,
                'failed_files' => 0,
            ]);

            $files = $this->job->files_list;
            $total = count($files);
            $completed = 0;
            $failed = 0;

            foreach ($files as $index => $file) {
                try {
                    $this->downloadFile($file, $index, $total);
                    $completed++;
                    $progress = ($completed / $total) * 100;
                    $this->job->update([
                        'progress' => $progress,
                        'completed_files' => $completed,
                    ]);
                } catch (\Exception $e) {
                    $failed++;
                    Log::error("Failed to download file: " . $e->getMessage());
                    $this->job->update([
                        'failed_files' => $failed,
                    ]);
                }
            }

            if ($failed === 0) {
                $this->job->update([
                    'status' => DownloadJob::STATUS_COMPLETED,
                    'progress' => 100,
                ]);
            } else {
                $this->job->update([
                    'status' => DownloadJob::STATUS_COMPLETED,
                    'error_message' => "Completed with $failed failed files",
                ]);
            }
        } catch (\Exception $e) {
            $this->job->update([
                'status' => DownloadJob::STATUS_FAILED,
                'error_message' => $e->getMessage(),
            ]);
            Log::error("Download job failed: " . $e->getMessage());
        }
    }

    protected function downloadFile($file, $index, $total)
    {
        $url = $file['url'];
        $type = $file['type'] ?? 'image';
        $author = $file['author'] ?? 'unknown';
        $id = $file['id'] ?? Str::random(8);
        
        $namingPattern = $this->job->naming_pattern;
        $destinationPath = $this->job->destination_path;

        $filename = $this->generateFilename($namingPattern, $author, $id, $index, $url);
        $fullPath = rtrim($destinationPath, '/') . '/' . $filename;

        $tempPath = tempnam(sys_get_temp_dir(), 'download_');

        try {
            $response = Http::withOptions(['sink' => $tempPath])->get($url);

            if (!$response->successful()) {
                throw new \Exception("Failed to download file: HTTP " . $response->status());
            }

            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }

            if (!rename($tempPath, $fullPath)) {
                copy($tempPath, $fullPath);
                unlink($tempPath);
            }

            Log::info("Downloaded file: $url -> $fullPath");
        } catch (\Exception $e) {
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }
            throw $e;
        }
    }

    protected function generateFilename($pattern, $author, $id, $index, $url)
    {
        $extension = $this->getExtensionFromUrl($url);
        $type = $this->getMediaTypeFromUrl($url);

        $replacements = [
            '{author}' => Str::slug($author),
            '{id}' => $id,
            '{index}' => $index,
            '{type}' => $type,
            '{timestamp}' => date('Ymd_His'),
            '{random}' => Str::random(8),
        ];

        $filename = $pattern;
        foreach ($replacements as $search => $replace) {
            $filename = str_replace($search, $replace, $filename);
        }

        if (!Str::endsWith(strtolower($filename), $extension)) {
            $filename .= '.' . $extension;
        }

        return $filename;
    }

    protected function getExtensionFromUrl($url)
    {
        $path = parse_url($url, PHP_URL_PATH);
        $extension = pathinfo($path, PATHINFO_EXTENSION);

        if (empty($extension)) {
            return 'jpg';
        }

        return strtolower($extension);
    }

    protected function getMediaTypeFromUrl($url)
    {
        $extension = $this->getExtensionFromUrl($url);
        $videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv'];
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

        if (in_array($extension, $videoExtensions)) {
            return 'video';
        }
        if (in_array($extension, $imageExtensions)) {
            return 'image';
        }
        return 'file';
    }
}
