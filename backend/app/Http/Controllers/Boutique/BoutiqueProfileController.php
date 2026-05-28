<?php

namespace App\Http\Controllers\Boutique;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BoutiqueProfileController extends Controller
{
    private function getBoutique()
    {
        $boutique = Auth::user()->boutique;
        if (!$boutique) {
            abort(422, 'Aucune boutique associée.');
        }
        return $boutique;
    }

    public function show()
    {
        $boutique = $this->getBoutique()->load('city');
        return response()->json($boutique);
    }

    public function update(Request $request)
    {
        $boutique = $this->getBoutique();

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'city_id' => 'sometimes|exists:cities,id',
            'offers_delivery' => 'sometimes|boolean',
            'delivery_scope' => 'nullable|string',
            'delivery_note' => 'nullable|string',
            'stock_alert_threshold' => 'sometimes|integer|min:0',
        ]);

        $boutique->update($data);

        return response()->json([
            'message' => 'Profil de la boutique mis à jour avec succès',
            'boutique' => $boutique->fresh('city')
        ]);
    }
}
