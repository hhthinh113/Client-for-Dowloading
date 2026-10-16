<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    public function getDownloadSettings(Request $request)
    {
        $defaultPath = Storage::get('default_download_path') ?? '';
        $recentPaths = Storage::get('recent_download_paths') ?? [];

        return response()->json([
            'default_path' => $defaultPath,
            'recent_paths' => $recentPaths,
        ]);
    }

    public function saveDownloadSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'default_path' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()
            ], 422);
        }

        if ($request->has('default_path')) {
            Storage::put('default_download_path', $request->default_path);
        }

        return response()->json(['message' => 'Settings saved successfully']);
    }

    public function saveRecentPath(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()
            ], 422);
        }

        $recentPaths = Storage::get('recent_download_paths') ?? [];
        
        if (!in_array($request->path, $recentPaths)) {
            array_unshift($recentPaths, $request->path);
            $recentPaths = array_slice($recentPaths, 0, 10);
            Storage::put('recent_download_paths', $recentPaths);
        }

        return response()->json(['message' => 'Recent path saved']);
    }

    public function listDirectories(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()
            ], 422);
        }

        $path = rtrim($request->path, '/\\');
        
        if (!is_dir($path)) {
            return response()->json([
                'error' => 'Directory does not exist',
                'directories' => [],
                'files' => [],
            ]);
        }

        $items = scandir($path);
        $directories = [];
        $files = [];

        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }

            $fullPath = $path . DIRECTORY_SEPARATOR . $item;
            
            if (is_dir($fullPath)) {
                $directories[] = [
                    'name' => $item,
                    'path' => $fullPath,
                    'type' => 'directory',
                ];
            } elseif (is_file($fullPath)) {
                $files[] = [
                    'name' => $item,
                    'path' => $fullPath,
                    'type' => 'file',
                    'size' => filesize($fullPath),
                ];
            }
        }

        return response()->json([
            'path' => $path,
            'directories' => $directories,
            'files' => $files,
        ]);
    }

    public function createDirectory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()
            ], 422);
        }

        $path = $request->path;
        
        if (is_dir($path)) {
            return response()->json([
                'error' => 'Directory already exists',
                'path' => $path,
                'exists' => true,
            ]);
        }

        try {
            if (mkdir($path, 0755, true)) {
                return response()->json([
                    'message' => 'Directory created successfully',
                    'path' => $path,
                    'exists' => true,
                ]);
            }
            return response()->json([
                'error' => 'Failed to create directory',
                'path' => $path,
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'path' => $path,
            ], 500);
        }
    }

    public function checkPath(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()
            ], 422);
        }

        $path = $request->path;
        
        return response()->json([
            'exists' => is_dir($path) || is_file($path),
            'is_directory' => is_dir($path),
            'is_writable' => is_writable(dirname($path)),
            'path' => $path,
        ]);
    }
}
