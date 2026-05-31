<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Boutique;
use App\Models\City;
use App\Models\Product;
use Illuminate\Support\Facades\Schema;

class CityController extends Controller
{
    private function hasBoutiquesTable(): bool
    {
        return Schema::hasTable('boutiques');
    }

    private function hasProductsTable(): bool
    {
        return Schema::hasTable('products');
    }

    // GET /api/stats — compteurs pour la landing
    public function stats()
    {
        return response()->json([
            'cities' => City::where('is_active', true)->count(),
            'boutiques' => $this->hasBoutiquesTable()
                ? Boutique::where('is_active', true)->count()
                : 0,
            'products' => $this->hasProductsTable()
                ? Product::where('is_active', true)->count()
                : 0,
        ]);
    }

    // GET /api/cities/top-boutiques — Top 3 boutiques par ville
    public function topBoutiques()
    {
        $cities = City::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'region', 'description', 'image']);

        $result = $cities->map(function (City $city) {
            $boutiques = Boutique::where('city_id', $city->id)
                ->where('is_active', true)
                ->with('city:id,name,slug')
                ->withCount('products')
                ->orderByDesc('rating')
                ->orderByDesc('followers_count')
                ->orderByDesc('reviews_count')
                ->limit(3)
                ->get([
                    'id', 'name', 'slug', 'logo', 'description', 'category',
                    'city_id', 'rating', 'reviews_count', 'followers_count',
                    'offers_delivery', 'delivery_scope', 'delivery_note', 'is_verified', 'messages_enabled',
                ]);

            return [
                'city' => $city,
                'boutiques' => $boutiques,
            ];
        })->filter(fn ($row) => $row['boutiques']->isNotEmpty())->values();

        return response()->json([
            'message' => 'Achetez partout au Maroc : les boutiques avec livraison vous livrent même hors de leur ville.',
            'cities' => $result,
        ]);
    }

    // Retourne toutes les villes
    public function index()
    {
        $query = City::where('is_active', true)
            ->select(['id', 'name', 'slug', 'description', 'region', 'image']);

        if ($this->hasBoutiquesTable()) {
            $query->withCount(['boutiques' => fn ($q) => $q->where('is_active', true)]);
        }

        return response()->json($query->get());
    }

    // Retourne une seule ville avec ses boutiques
    public function show($slug)
    {
        $query = City::where('slug', $slug);

        if ($this->hasBoutiquesTable()) {
            $query->with(['boutiques' => function ($q) {
                $q->where('is_active', true)
                  ->orderByDesc('rating')
                  ->orderByDesc('followers_count')
                  ->select(['id', 'name', 'slug', 'logo', 'rating', 'reviews_count', 'followers_count', 'city_id', 'messages_enabled']);
            }]);
        }

        $city = $query->firstOrFail();

        return response()->json($city);
    }
}