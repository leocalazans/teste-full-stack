<?php

use Illuminate\Http\Request;

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

// Handle CORS preflight requests for any API route
Route::options('{any}', function () {
    return response()->json('OK', 200);
})->where('any', '.*');

// Token-based API endpoints (use hashed token middleware)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth.hashed');

// login with throttling
Route::post('/login', 'Auth\\ApiAuthController@login')->middleware('throttle:10,1');

Route::post('/logout', 'Auth\\ApiAuthController@logout')->middleware('auth.hashed');

// Session-based CSRF + auth endpoints for SPA clients that use cookies/sessions.
// These routes are exposed under /api/* but use the 'web' middleware so
// sessions, cookies and CSRF protection are available.
// Frontend should call GET /api/csrf-cookie (withCredentials) before POST login.
Route::get('/csrf-cookie', function () {
    return response()->json('OK', 204)->cookie('XSRF-TOKEN', csrf_token(), 0, '/', null, false, false);
})->middleware('web');

// session-based login (uses SessionAuthController)
Route::post('/auth/login', 'Auth\\SessionAuthController@login')->middleware(['web', 'throttle:10,1']);

// attempt to refresh session/cookie for SPA clients (frontend will POST /api/auth/refresh)
// does not require the 'auth' middleware because the frontend will call this when
// it receives a 401 and wants the server to attempt to re-establish a session
// (cookies/remember-me are available via the 'web' middleware).
Route::post('/auth/refresh', 'Auth\\SessionAuthController@refresh')->middleware('web');

// protected session-based routes
Route::middleware(['web', 'auth'])->prefix('auth')->group(function () {
    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', 'Auth\\SessionAuthController@logout');
});

// Temporary debug route (development only): show request headers, cookies,
// session id and auth state so we can debug cookie/session issues from the SPA.
Route::get('/debug/request', function (Request $request) {
    return response()->json([
        'headers' => $request->headers->all(),
        'cookies' => $request->cookies->all(),
        'session_id' => $request->session()->getId(),
        'auth_check' => auth()->check(),
        'user' => auth()->user(),
    ]);
})->middleware('web');

// Temporary: try to authenticate using the seeded user credentials to debug
Route::post('/debug/login-test', function (Request $request) {
    $credentials = [
        'email' => 'test@example.com',
        'password' => 'password',
    ];

    $attempt = auth()->attempt($credentials);

    if ($attempt) {
        $request->session()->regenerate();
    }

    return response()->json([
        'attempt' => $attempt,
        'session_id' => $request->session()->getId(),
        'auth_check' => auth()->check(),
        'user' => auth()->user(),
        'headers' => $request->headers->all(),
        'cookies' => $request->cookies->all(),
    ]);
})->middleware('web');
