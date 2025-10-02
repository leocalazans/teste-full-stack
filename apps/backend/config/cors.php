<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'auth/*', 'api/auth/*'],

    'allowed_methods' => ['*'],

    // adjust to your frontend origin(s). Include both localhost and 127.0.0.1
    // to cover different dev server addresses.
    'allowed_origins' => [
        'http://localhost:4200',
        'http://127.0.0.1:4200',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
