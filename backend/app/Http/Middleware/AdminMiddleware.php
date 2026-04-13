<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Accès non autorisé. Réservé aux administrateurs.'], 403);
        }

        return $next($request);
    }
}