<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    // POST /api/products/{productId}/favorite - Ajoute un produit aux favoris
    public function add($productId)
    {
        $product = Product::findOrFail($productId);

        $favorite = Favorite::firstOrCreate([
            'user_id' => Auth::id(),
            'product_id' => $productId,
        ]);

        return response()->json(['success' => true, 'is_favorited' => true], 201);
    }

    // DELETE /api/products/{productId}/unfavorite - Retire un produit des favoris
    public function remove($productId)
    {
        Favorite::where('user_id', Auth::id())
            ->where('product_id', $productId)
            ->delete();

        return response()->json(['success' => true, 'is_favorited' => false]);
    }

    // GET /api/favorites - Retourne les favoris de l'utilisateur
    public function list()
    {
        $favorites = Favorite::where('user_id', Auth::id())
            ->with('product:id,name,slug,price,discount_price,rating')
            ->get();

        return response()->json($favorites);
    }

    // GET /api/products/{productId}/is-favorite - Vérifie si un produit est en favori
    public function isFavorite($productId)
    {
        $isFavorite = Favorite::where('user_id', Auth::id())
            ->where('product_id', $productId)
            ->exists();

        return response()->json(['is_favorited' => $isFavorite]);
    }
}
