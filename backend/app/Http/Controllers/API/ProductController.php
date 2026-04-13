<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;

class ProductController extends Controller
{
    // GET /api/products - Retourne tous les produits avec filtres
    public function index()
    {
        $query = Product::where('is_active', true);

        // Filtre par catégorie
        if (request('category')) {
            $query->whereHas('category', function ($q) {
                $q->where('slug', request('category'));
            });
        }

        // Filtre par boutique
        if (request('boutique')) {
            $query->whereHas('boutique', function ($q) {
                $q->where('slug', request('boutique'));
            });
        }

        // Filtre par prix
        if (request('min_price')) {
            $query->where('price', '>=', request('min_price'));
        }
        if (request('max_price')) {
            $query->where('price', '<=', request('max_price'));
        }

        // Recherche par nom
        if (request('search')) {
            $query->where('name', 'like', '%' . request('search') . '%');
        }

        $products = $query
            ->with('boutique:id,name,slug', 'images:id,product_id,image_url,is_primary')
            ->select(['id', 'name', 'slug', 'price', 'discount_price', 'rating', 'stock_quantity', 'boutique_id'])
            ->paginate(12);

        return response()->json($products);
    }

    // GET /api/products/{slug} - Retourne un produit avec tous les détails
    public function show($slug)
    {
        $product = Product::where('slug', $slug)
            ->with([
                'boutique:id,name,slug,logo,description',
                'category:id,name,slug',
                'images:id,product_id,image_url,is_primary,sort_order',
                'variants:id,product_id,size,color,stock_quantity,price_override',
                'reviews:id,user_id,product_id,rating,comment,created_at'
            ])
            ->firstOrFail();

        return response()->json($product);
    }

    // GET /api/products-reviews/{id} - Retourne les avis d'un produit
    public function reviews($id)
    {
        $reviews = Product::findOrFail($id)
            ->reviews()
            ->with('user:id,name')
            ->latest()
            ->get();

        return response()->json($reviews);
    }

    // GET /api/products-similar/{id} - Retourne les produits similaires
    public function similar($id)
    {
        $product = Product::findOrFail($id);

        $similar = Product::where('is_active', true)
            ->where('id', '!=', $id)
            ->where(function ($query) use ($product) {
                $query->where('category_id', $product->category_id)
                    ->orWhere('boutique_id', $product->boutique_id);
            })
            ->with('images:id,product_id,image_url,is_primary')
            ->limit(6)
            ->get();

        return response()->json($similar);
    }

    // GET /api/boutiques/{boutiqueId}/products - Retourne les produits d'une boutique
    public function byBoutique($boutiqueId)
    {
        $products = Product::where('boutique_id', $boutiqueId)
            ->where('is_active', true)
            ->with('images:id,product_id,image_url,is_primary')
            ->select(['id', 'name', 'slug', 'price', 'discount_price', 'rating', 'stock_quantity'])
            ->paginate(12);

        return response()->json($products);
    }
}