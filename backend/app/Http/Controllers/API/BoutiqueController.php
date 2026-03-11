<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Boutique;

class BoutiqueController extends Controller
{
    // Retourne toutes les boutiques
    public function index()
    {
        $boutiques = Boutique::with('city')->get();
        return response()->json($boutiques);
    }

    // Retourne une seule boutique avec ses produits
    public function show($id)
    {
        $boutique = Boutique::with(['city', 'products'])->findOrFail($id);
        return response()->json($boutique);
    }

    // Retourne les boutiques d'une ville spécifique
    public function byCity($cityId)
    {
        $boutiques = Boutique::with('city')
            ->where('city_id', $cityId)
            ->get();
        return response()->json($boutiques);
    }
}