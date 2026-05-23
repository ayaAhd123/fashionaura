<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Boutique;
use App\Models\City;

class CityController extends Controller
{
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
                    'offers_delivery', 'delivery_scope', 'delivery_note', 'is_verified',
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
        $cities = City::where('is_active', true)
            ->with('boutiques')
            ->select(['id', 'name', 'slug', 'description', 'region', 'image'])
            ->get();

        return response()->json($cities);
    }

    // Retourne une seule ville avec ses boutiques
    public function show($slug)
    {
        $city = City::where('slug', $slug)
            ->with(['boutiques' => function ($query) {
                $query->where('is_active', true)->select(['id', 'name', 'slug', 'logo', 'rating', 'city_id']);
            }])
            ->firstOrFail();

        return response()->json($city);
    }
}