<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Response;

class Cors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        // set allowed origin explicitly for security; adjust if needed
        $allowedOrigin = 'http://localhost:4200';

        $headers = [
            'Access-Control-Allow-Origin' => $allowedOrigin,
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, Accept',
            'Access-Control-Allow-Credentials' => 'true',
        ];

        // For preflight requests, return the headers immediately.
        // Use isMethod for better compatibility and handle any-casing.
        if ($request->isMethod('OPTIONS')) {
            return response()->json('OK', 200, $headers);
        }

        $response = $next($request);

        // Add headers to the response. If the response object doesn't
        // expose the headers property, try to use the Symfony header setter.
        if (isset($response->headers)) {
            foreach ($headers as $key => $value) {
                $response->headers->set($key, $value);
            }
        } else {
            foreach ($headers as $key => $value) {
                $response->header($key, $value);
            }
        }

        return $response;
    }
}
