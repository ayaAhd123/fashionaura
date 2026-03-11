<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\City;

class CityController extends Controller
{
    // Retourne toutes les villes
    public function index()
    {
        $cities = City::all();
        return response()->json($cities);
    }

    // Retourne une seule ville avec ses boutiques
    public function show($id)
    {
        $city = City::with('boutiques')->findOrFail($id);
        return response()->json($city);
    }
}