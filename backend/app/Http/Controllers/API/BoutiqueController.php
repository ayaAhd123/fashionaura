<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Boutique;

class BoutiqueController extends Controller
{
    // GET /api/boutiques - Retourne toutes les boutiques avec filtres
    public function index()
    {
        $query = Boutique::where('is_active', true);

        // Filtre par ville
        if (request('city')) {
            $query->whereHas('city', function ($q) {
                $q->where('slug', request('city'));
            });
        }

        // Filtre par rating
        if (request('rating')) {
            $query->where('rating', '>=', request('rating'));
        }

        // Recherche par nom
        if (request('search')) {
            $query->where('name', 'like', '%' . request('search') . '%');
        }

        $boutiques = $query
            ->with('city:id,name,slug')
            ->withCount('products')
            ->select(['id', 'name', 'slug', 'logo', 'description', 'category', 'city_id', 'rating', 'reviews_count', 'followers_count', 'offers_delivery', 'delivery_scope', 'delivery_note'])
            ->paginate(12);

        return response()->json($boutiques);
    }

    // GET /api/boutiques/{slug} - Retourne une boutique par slug avec ses détails
    public function show($slug)
    {
        $boutique = Boutique::where('slug', $slug)
            ->with([
                'city:id,name,slug',
                'products' => function ($q) {
                    $q->where('is_active', true)
                      ->with('images:id,product_id,image_url,is_primary')
                      ->select(['id', 'boutique_id', 'name', 'slug', 'price', 'discount_price', 'rating', 'stock_quantity', 'reviews_count']);
                },
                'reviews:id,boutique_id,user_id,rating,comment,created_at'
            ])
            ->firstOrFail();

        return response()->json($boutique);
    }

    // GET /api/boutiques-reviews/{id} - Retourne les avis d'une boutique
    public function reviews($id)
    {
        $reviews = Boutique::findOrFail($id)
            ->reviews()
            ->with('user:id,name')
            ->latest()
            ->get();

        return response()->json($reviews);
    }

    // GET /api/cities/{cityId}/boutiques - Retourne les boutiques d'une ville
    public function byCity($cityId)
    {
        $boutiques = Boutique::where('city_id', $cityId)
            ->where('is_active', true)
            ->with('city:id,name,slug')
            ->withCount('products')
            ->select(['id', 'name', 'slug', 'logo', 'description', 'category', 'rating', 'followers_count'])
            ->get();

        return response()->json($boutiques);
    }
}