<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as BaseVerifier;

class VerifyCsrfToken extends BaseVerifier
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        // Exempt session-based frontend endpoints that are called from
        // the SPA without a CSRF token. Prefer fetching the XSRF cookie
        // from the frontend (recommended), but exempting login/logout
        // here avoids TokenMismatchException during development.
        'api/auth/login',
        'api/auth/logout',
        'api/csrf-cookie',
        'api/auth/refresh',
        // allow debug endpoints during local development
        'api/debug/*',
    ];
}
