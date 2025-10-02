<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\User;

class ApiAuthController extends Controller
{
    /**
     * Login with email and password and return api_token
     */
    public function login(Request $request)
    {
        $this->validate($request, [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciais inválidas. Tente novamente.'], 401);
        }

    // create a token, store hashed version in DB and return raw token
    $token = bin2hex(random_bytes(40));
    $user->api_token = hash('sha256', $token);
    $user->save();

    return response()->json(['token' => $token, 'user' => $user]);
    }

    /**
     * Logout: invalidate token
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->api_token = null;
            $user->save();
        }
        return response()->json(['message' => 'Logged out']);
    }
}
