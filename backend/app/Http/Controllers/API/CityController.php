<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\City;

class CityController extends Controller
{
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