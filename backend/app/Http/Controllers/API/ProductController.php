<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;

class ProductController extends Controller
{
    // Retourne tous les produits
    public function index()
    {
        $products = Product::with('boutique')->get();
        return response()->json($products);
    }

    // Retourne un seul produit
    public function show($id)
    {
        $product = Product::with('boutique.city')->findOrFail($id);
        return response()->json($product);
    }

    // Retourne les produits d'une boutique spécifique
    public function byBoutique($boutiqueId)
    {
        $products = Product::where('boutique_id', $boutiqueId)->get();
        return response()->json($products);
    }
}