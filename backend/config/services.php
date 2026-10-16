<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    */

    'pixabay' => [
        'api_key' => env('PIXABAY_API_KEY', ''),
        'base_url' => 'https://pixabay.com/api/',
    ],

    'safebooru' => [
        'base_url' => 'https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1',
    ],

    'unsplash' => [
        'api_key' => env('UNSPLASH_API_KEY', ''),
        'base_url' => 'https://api.unsplash.com/',
        'access_key' => env('UNSPLASH_ACCESS_KEY', ''),
    ],

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

];
