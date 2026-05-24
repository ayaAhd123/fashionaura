<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BoutiqueOwnerMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        if (Auth::user()->role !== 'boutique_owner') {
            return response()->json(['message' => 'Accès non autorisé. Réservé aux propriétaires de boutique.'], 403);
        }

        // Vérifier que le propriétaire a bien une boutique
        if (!Auth::user()->boutique_id) {
            return response()->json(['message' => 'Vous n\'avez pas de boutique associée.'], 403);
        }

        return $next($request);
    }
}