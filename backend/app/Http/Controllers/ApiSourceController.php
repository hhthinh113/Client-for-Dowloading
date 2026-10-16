<?php

namespace App\Http\Controllers;

use App\Models\ApiSource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ApiSourceController extends Controller
{
    public function index(Request $request)
    {
        $sources = ApiSource::query()
            ->when($request->platform, function ($q) use ($request) {
                $q->where('platform', $request->platform);
            })
            ->orderBy('name')
            ->get();

        return response()->json($sources);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'platform' => 'required|in:pixabay,safebooru,unsplash,custom',
            'base_url' => 'required|url',
            'api_key' => 'nullable|string',
            'endpoint' => 'nullable|string',
            'params' => 'nullable|array',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()
            ], 422);
        }

        $source = ApiSource::create($request->all());
        return response()->json($source, 201);
    }

    public function show($id)
    {
        $source = ApiSource::find($id);
        if (!$source) {
            return response()->json(['error' => 'API source not found'], 404);
        }
        return response()->json($source);
    }

    public function update(Request $request, $id)
    {
        $source = ApiSource::find($id);
        if (!$source) {
            return response()->json(['error' => 'API source not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'platform' => 'sometimes|in:pixabay,safebooru,unsplash,custom',
            'base_url' => 'sometimes|url',
            'api_key' => 'nullable|string',
            'endpoint' => 'nullable|string',
            'params' => 'nullable|array',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()
            ], 422);
        }

        $source->update($request->all());
        return response()->json($source);
    }

    public function destroy($id)
    {
        $source = ApiSource::find($id);
        if (!$source) {
            return response()->json(['error' => 'API source not found'], 404);
        }
        $source->delete();
        return response()->json(['message' => 'API source deleted successfully']);
    }

    public function testConnection(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'platform' => 'required|in:pixabay,safebooru,unsplash,custom',
            'api_key' => 'nullable|string',
            'base_url' => 'nullable|url',
            'endpoint' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()
            ], 422);
        }

        try {
            $platform = $request->platform;
            $apiKey = $request->api_key;
            $baseUrl = $request->base_url;
            $endpoint = $request->endpoint;

            switch ($platform) {
                case 'pixabay':
                    $response = Http::get($baseUrl ?? 'https://pixabay.com/api/', [
                        'key' => $apiKey,
                        'q' => 'test',
                        'per_page' => 1,
                    ]);
                    break;
                case 'safebooru':
                    $response = Http::get($baseUrl ?? 'https://safebooru.org/index.php', [
                        'page' => 'dapi',
                        's' => 'post',
                        'q' => 'index',
                        'json' => 1,
                        'tags' => 'test',
                        'limit' => 1,
                    ]);
                    break;
                case 'unsplash':
                    $response = Http::get($baseUrl ?? 'https://api.unsplash.com/search/photos', [
                        'query' => 'test',
                        'per_page' => 1,
                        'client_id' => $apiKey,
                    ]);
                    break;
                case 'custom':
                    $url = rtrim($baseUrl, '/') . '/' . ltrim($endpoint ?? '', '/');
                    $response = Http::get($url, ['test' => 'connection']);
                    break;
                default:
                    return response()->json(['error' => 'Unsupported platform'], 400);
            }

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'status_code' => $response->status(),
                    'message' => 'Connection successful'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'status_code' => $response->status(),
                    'message' => 'Connection failed',
                    'response' => $response->body()
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error("API connection test failed: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Connection test failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
