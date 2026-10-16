<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApiSource extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'platform',
        'api_key',
        'base_url',
        'endpoint',
        'params',
        'is_active',
        'description',
    ];

    protected $casts = [
        'params' => 'array',
        'is_active' => 'boolean',
    ];

    public static $platforms = ['pixabay', 'safebooru', 'unsplash', 'custom'];

    public function getPlatformLabelAttribute()
    {
        $labels = [
            'pixabay' => 'Pixabay',
            'safebooru' => 'Safebooru',
            'unsplash' => 'Unsplash',
            'custom' => 'Custom',
        ];
        return $labels[$this->platform] ?? $this->platform;
    }
}
