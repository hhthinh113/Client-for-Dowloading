<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class MediaController extends Controller
{
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'platform' => 'required|in:pixabay,safebooru,unsplash',
            'query' => 'required|string|max:255',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'tags' => 'nullable|string',
            'category' => 'nullable|string',
            'orientation' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()
            ], 422);
        }

        $platform = $request->platform;
        $query = $request->query;
        $page = $request->page ?? 1;
        $perPage = $request->per_page ?? 20;
        $tags = $request->tags;
        $category = $request->category;
        $orientation = $request->orientation;

        try {
            $results = $this->searchFromPlatform($platform, $query, $page, $perPage, $tags, $category, $orientation);
            return response()->json($results);
        } catch (\Exception $e) {
            Log::error("Media search failed: " . $e->getMessage());
            return response()->json([
                'error' => 'Failed to search media',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getMedia(Request $request, $platform)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|max:255',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()
            ], 422);
        }

        try {
            $results = $this->searchFromPlatform(
                $platform,
                $request->query,
                $request->page ?? 1,
                $request->per_page ?? 20
            );
            return response()->json($results);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get media',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getPreview(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url',
            'type' => 'required|in:image,video'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()
            ], 422);
        }

        return response()->json([
            'url' => $request->url,
            'type' => $request->type,
            'preview_available' => true
        ]);
    }

    protected function searchFromPlatform($platform, $query, $page = 1, $perPage = 20, $tags = null, $category = null, $orientation = null)
    {
        switch ($platform) {
            case 'pixabay':
                return $this->searchPixabay($query, $page, $perPage, $tags, $category, $orientation);
            case 'safebooru':
                return $this->searchSafebooru($query, $page, $perPage, $tags);
            case 'unsplash':
                return $this->searchUnsplash($query, $page, $perPage);
            default:
                throw new \Exception('Unsupported platform');
        }
    }

    protected function searchPixabay($query, $page = 1, $perPage = 20, $tags = null, $category = null, $orientation = null)
    {
        $apiKey = config('services.pixabay.api_key');
        if (!$apiKey) {
            throw new \Exception('Pixabay API key not configured');
        }

        $params = [
            'key' => $apiKey,
            'q' => $query,
            'page' => $page,
            'per_page' => $perPage,
            'image_type' => 'all',
        ];

        if ($category) {
            $params['category'] = $category;
        }
        if ($orientation) {
            $params['orientation'] = $orientation;
        }
        if ($tags) {
            $params['q'] .= '+' . $tags;
        }

        $response = Http::get('https://pixabay.com/api/', $params);

        if (!$response->successful()) {
            throw new \Exception('Pixabay API request failed: ' . $response->status());
        }

        $data = $response->json();
        
        if (!isset($data['hits'])) {
            throw new \Exception('Invalid response from Pixabay API');
        }

        $results = [];
        foreach ($data['hits'] as $hit) {
            $results[] = [
                'id' => $hit['id'],
                'platform' => 'pixabay',
                'title' => $hit['tags'] ?? '',
                'author' => $hit['user'] ?? 'Unknown',
                'type' => $this->getMediaType($hit['type']),
                'url' => $hit['pageURL'] ?? '',
                'preview_url' => $hit['previewURL'] ?? '',
                'full_url' => $hit['largeImageURL'] ?? $hit['imageURL'] ?? $hit['previewURL'],
                'thumbnail_url' => $hit['previewURL'] ?? '',
                'width' => $hit['imageWidth'] ?? 0,
                'height' => $hit['imageHeight'] ?? 0,
                'size' => $hit['imageSize'] ?? 0,
                'views' => $hit['views'] ?? 0,
                'downloads' => $hit['downloads'] ?? 0,
                'likes' => $hit['likes'] ?? 0,
                'tags' => explode(', ', $hit['tags'] ?? ''),
            ];
        }

        return [
            'results' => $results,
            'total' => $data['totalHits'] ?? 0,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => ceil(($data['totalHits'] ?? 0) / $perPage),
        ];
    }

    protected function searchSafebooru($query, $page = 1, $perPage = 20, $tags = null)
    {
        $searchTags = $query;
        if ($tags) {
            $searchTags .= ' ' . $tags;
        }

        $params = [
            'page' => 'dapi',
            's' => 'post',
            'q' => 'index',
            'json' => 1,
            'tags' => $searchTags,
            'limit' => $perPage,
            'pid' => $page - 1,
        ];

        $response = Http::get('https://safebooru.org/index.php', $params);

        if (!$response->successful()) {
            throw new \Exception('Safebooru API request failed: ' . $response->status());
        }

        $data = $response->json();
        
        if (!isset($data['post'])) {
            throw new \Exception('Invalid response from Safebooru API');
        }

        $results = [];
        foreach ($data['post'] as $post) {
            $fileUrl = 'https://safebooru.org//images/' . $post['directory'] . '/' . $post['image'];
            $previewUrl = 'https://safebooru.org//thumbnails/' . $post['directory'] . '/thumbnail_' . $post['image'];

            $results[] = [
                'id' => $post['id'],
                'platform' => 'safebooru',
                'title' => $post['tags'] ?? '',
                'author' => $post['owner'] ?? 'Unknown',
                'type' => $this->getMediaTypeFromExtension($post['image']),
                'url' => $fileUrl,
                'preview_url' => $previewUrl,
                'full_url' => $fileUrl,
                'thumbnail_url' => $previewUrl,
                'width' => $post['width'] ?? 0,
                'height' => $post['height'] ?? 0,
                'size' => $post['file_size'] ?? 0,
                'views' => 0,
                'downloads' => 0,
                'likes' => $post['score'] ?? 0,
                'tags' => explode(' ', $post['tags'] ?? ''),
            ];
        }

        return [
            'results' => $results,
            'total' => count($results),
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => 1,
        ];
    }

    protected function searchUnsplash($query, $page = 1, $perPage = 20)
    {
        $apiKey = config('services.unsplash.api_key');
        if (!$apiKey) {
            throw new \Exception('Unsplash API key not configured');
        }

        $params = [
            'query' => $query,
            'page' => $page,
            'per_page' => $perPage,
            'client_id' => $apiKey,
        ];

        $response = Http::get('https://api.unsplash.com/search/photos', $params);

        if (!$response->successful()) {
            throw new \Exception('Unsplash API request failed: ' . $response->status());
        }

        $data = $response->json();
        
        if (!isset($data['results'])) {
            throw new \Exception('Invalid response from Unsplash API');
        }

        $results = [];
        foreach ($data['results'] as $photo) {
            $results[] = [
                'id' => $photo['id'],
                'platform' => 'unsplash',
                'title' => $photo['alt_description'] ?? $photo['description'] ?? '',
                'author' => $photo['user']['name'] ?? 'Unknown',
                'type' => 'image',
                'url' => $photo['links']['html'] ?? '',
                'preview_url' => $photo['urls']['small'] ?? '',
                'full_url' => $photo['urls']['raw'] ?? $photo['urls']['full'] ?? '',
                'thumbnail_url' => $photo['urls']['thumb'] ?? '',
                'width' => $photo['width'] ?? 0,
                'height' => $photo['height'] ?? 0,
                'size' => 0,
                'views' => $photo['views'] ?? 0,
                'downloads' => $photo['downloads'] ?? 0,
                'likes' => $photo['likes'] ?? 0,
                'tags' => $photo['tags'] ?? [],
            ];
        }

        return [
            'results' => $results,
            'total' => $data['total'] ?? 0,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => $data['total_pages'] ?? 1,
        ];
    }

    protected function getMediaType($type)
    {
        if (str_contains(strtolower($type), 'video')) {
            return 'video';
        }
        if (str_contains(strtolower($type), 'photo') || str_contains(strtolower($type), 'image')) {
            return 'image';
        }
        return 'unknown';
    }

    protected function getMediaTypeFromExtension($filename)
    {
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv'];
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

        if (in_array($extension, $videoExtensions)) {
            return 'video';
        }
        if (in_array($extension, $imageExtensions)) {
            return 'image';
        }
        return 'unknown';
    }
}
