<?php

namespace App\Http\Middleware;

use Closure;
use App\User;

class AuthenticateHashedToken
{
    /**
     * Check Authorization Bearer <token> header and authenticate user by hashed token
     */
    public function handle($request, Closure $next)
    {
        $auth = $request->header('Authorization');
        if (! $auth || ! preg_match('/Bearer\s+(\S+)/', $auth, $m)) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $token = $m[1];
        $hashed = hash('sha256', $token);

        $user = User::where('api_token', $hashed)->first();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // set the authenticated user for the request
        auth()->setUser($user);

        return $next($request);
    }
}
