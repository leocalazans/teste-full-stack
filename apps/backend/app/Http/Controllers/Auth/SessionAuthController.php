<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SessionAuthController extends Controller
{
    /**
     * Login using session auth (creates laravel session cookie)
     */
    public function login(Request $request)
    {
        $this->validate($request, [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $credentials = $request->only('email', 'password');

    $remember = (bool) $request->input('remember');

    if (Auth::attempt($credentials, $remember)) {
            // regenerate session id to prevent fixation
            $request->session()->regenerate();
            return response()->json(['message' => 'Logged in', 'user' => Auth::user()]);
        }

        return response()->json(['message' => 'Credenciais inválidas. Tente novamente.'], 401);
    }

    /**
     * Logout and invalidate session
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['message' => 'Logged out']);
    }

    /**
     * Refresh session/cookie for SPA clients.
     *
     * Frontend will POST to /api/auth/refresh withCredentials to let the server
     * re-issue a session or validate an existing remember-me cookie. If the
     * user is authenticated after this call we return 200, otherwise 401.
     */
    public function refresh(Request $request)
    {
        // If the user already has a valid session cookie, auth()->check() will be true.
        if (auth()->check()) {
            // Optionally regenerate the session id to extend validity
            $request->session()->regenerate();
            return response()->json(['message' => 'Session refreshed', 'user' => auth()->user()]);
        }

        // If not authenticated, attempt to authenticate via remember token (handled by Laravel automatically)
        // Re-check auth state after any middleware/auth listeners have run.
        if (auth()->check()) {
            $request->session()->regenerate();
            return response()->json(['message' => 'Session refreshed', 'user' => auth()->user()]);
        }

        return response()->json(['message' => 'Not authenticated'], 401);
    }
}
