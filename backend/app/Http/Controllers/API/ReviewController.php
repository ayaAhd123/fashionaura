<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Product;
use App\Models\Boutique;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    // POST /api/reviews - Crée un nouvel avis
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required_without:boutique_id|exists:products,id',
            'boutique_id' => 'required_without:product_id|exists:boutiques,id',
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:1000',
        ]);
        $review = Review::create(array_merge($validated, [
            'user_id' => Auth::id(),
        ]));
    

        // Mettre à jour la note moyenne du produit/boutique
        if ($validated['product_id'] ?? null) {
            $product = Product::findOrFail($validated['product_id']);
            $reviews = $product->reviews;
            $avgRating = $reviews->avg('rating');
            $product->update([
                'rating' => round($avgRating, 2),
                'reviews_count' => $reviews->count(),
            ]);
        }

        if ($validated['boutique_id'] ?? null) {
            $boutique = Boutique::findOrFail($validated['boutique_id']);
            $boutique->update([
                'rating' => round($boutique->reviews()->avg('rating') ?? 0, 2),
                'reviews_count' => $boutique->reviews()->count(),
            ]);
        }

        return response()->json($review, 201);
    }

    // GET /api/products/{id}/reviews - Retourne les avis d'un produit
    public function productReviews($id)
    {
        $reviews = Review::where('product_id', $id)
            ->with('user:id,name')
            ->latest()
            ->paginate(10);

        return response()->json($reviews);
    }

    // GET /api/boutiques/{id}/reviews - Retourne les avis d'une boutique
    public function boutiqueReviews($id)
    {
        $reviews = Review::where('boutique_id', $id)
            ->with('user:id,name')
            ->latest()
            ->paginate(10);

        return response()->json($reviews);
    }
}
