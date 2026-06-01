<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BoutiqueFollower;
use App\Models\Boutique;
use Illuminate\Support\Facades\Auth;

class BoutiqueFollowerController extends Controller
{
    // POST /api/boutiques/{boutiqueId}/follow - Suit une boutique
    public function follow($boutiqueId)
    {
        $boutique = Boutique::findOrFail($boutiqueId);
        $follower = BoutiqueFollower::firstOrCreate([
            'user_id' => Auth::id(),
            'boutique_id' => $boutiqueId,
        ]);
        $follower->save();

        // Incrémenter le count
        $boutique->increment('followers_count');

        return response()->json(['success' => true, 'is_following' => true], 201);
    }

    // DELETE /api/boutiques/{boutiqueId}/unfollow - Arrête de suivre une boutique
    public function unfollow($boutiqueId)
    {
        $boutique = Boutique::findOrFail($boutiqueId);
        BoutiqueFollower::where('user_id', Auth::id())
            ->where('boutique_id', $boutiqueId)
            ->delete();

        // Décrémenter le count
        $boutique->decrement('followers_count');

        return response()->json(['success' => true, 'is_following' => false]);
    }

        // GET /api/boutiques/{boutiqueId}/is-following - Vérifie si on suit une boutique
        public function isFollowing($boutiqueId)
        {
            $isFollowing = BoutiqueFollower::where('user_id', Auth::id())
                ->where('boutique_id', $boutiqueId)
                ->exists();
    
            return response()->json(['is_following' => $isFollowing]);
        }

        // GET /api/my/following - Boutiques suivies par l'utilisateur connecté
        public function following()
        {
            $boutiques = Boutique::whereIn(
                'id',
                BoutiqueFollower::where('user_id', Auth::id())->pluck('boutique_id')
            )
                ->withCount('products')
                ->get(['id', 'name', 'slug', 'logo', 'category', 'rating', 'followers_count', 'is_active', 'messages_enabled']);

            return response()->json($boutiques);
        }
    }

