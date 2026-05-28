<?php

namespace App\Http\Controllers\Boutique;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BoutiqueReviewController extends Controller
{
    private function getBoutiqueId()
    {
        $boutique = Auth::user()->boutique;
        if (!$boutique) {
            abort(422, 'Aucune boutique associée à cet utilisateur.');
        }
        return $boutique->id;
    }

    public function index()
    {
        $boutiqueId = $this->getBoutiqueId();

        $reviews = Review::where('boutique_id', $boutiqueId)
            ->with(['user:id,name,email', 'product:id,name,slug'])
            ->latest()
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'reply' => $review->reply,
                    'date' => $review->created_at->toIso8601String(),
                    'user' => $review->user ? $review->user->name : 'Utilisateur anonyme',
                    'product_name' => $review->product ? $review->product->name : 'N/A',
                    'product_slug' => $review->product ? $review->product->slug : null,
                ];
            });

        return response()->json($reviews);
    }

    public function reply(Request $request, $id)
    {
        $boutiqueId = $this->getBoutiqueId();
        
        $review = Review::where('boutique_id', $boutiqueId)->findOrFail($id);

        $data = $request->validate([
            'reply' => 'required|string|max:5000',
        ]);

        $review->update(['reply' => $data['reply']]);

        return response()->json([
            'message' => 'Réponse enregistrée avec succès',
            'review' => $review
        ]);
    }
}
