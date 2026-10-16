<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\ApiSourceController;
use App\Http\Controllers\DownloadController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Media routes
Route::prefix('media')->group(function () {
    Route::get('/search', [MediaController::class, 'search']);
    Route::get('/{platform}', [MediaController::class, 'getMedia']);
    Route::post('/preview', [MediaController::class, 'getPreview']);
});

// API Source management
Route::prefix('api-sources')->group(function () {
    Route::get('/', [ApiSourceController::class, 'index']);
    Route::post('/', [ApiSourceController::class, 'store']);
    Route::get('/{id}', [ApiSourceController::class, 'show']);
    Route::put('/{id}', [ApiSourceController::class, 'update']);
    Route::delete('/{id}', [ApiSourceController::class, 'destroy']);
    Route::post('/test', [ApiSourceController::class, 'testConnection']);
});

// Download routes
Route::prefix('download')->group(function () {
    Route::post('/single', [DownloadController::class, 'downloadSingle']);
    Route::post('/batch', [DownloadController::class, 'downloadBatch']);
    Route::get('/status/{jobId}', [DownloadController::class, 'getStatus']);
    Route::get('/progress/{jobId}', [DownloadController::class, 'getProgress']);
    Route::post('/cancel/{jobId}', [DownloadController::class, 'cancelDownload']);
});

// Utility routes
Route::get('/config', function () {
    return response()->json([
        'pixabay_enabled' => config('services.pixabay.api_key') !== '',
        'unsplash_enabled' => config('services.unsplash.api_key') !== '',
        'safebooru_enabled' => true,
    ]);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
