<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Boutique;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminBoutiqueController extends Controller
{
    public function index(Request $request)
    {
        $query = Boutique::query()->with('city:id,name,slug');

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
        }

        if ($request->has('city_id')) {
            $query->where('city_id', $request->get('city_id'));
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'city_id' => 'required|exists:cities,id',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'category' => 'nullable|string',
            'offers_delivery' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
        ]);

        $data['slug'] = Str::slug($data['name']) . '-' . rand(100, 999);
        $data['rating'] = 5.0;
        $data['reviews_count'] = 0;
        $data['followers_count'] = 0;

        $boutique = Boutique::create($data);

        return response()->json([
            'message' => 'Boutique créée avec succès',
            'boutique' => $boutique
        ], 201);
    }

    public function show($id)
    {
        $boutique = Boutique::with(['city', 'products', 'reviews.user'])->findOrFail($id);
        return response()->json($boutique);
    }

    public function update(Request $request, $id)
    {
        $boutique = Boutique::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'city_id' => 'sometimes|exists:cities,id',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'category' => 'nullable|string',
            'offers_delivery' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
            'is_verified' => 'sometimes|boolean',
        ]);

        if (isset($data['name']) && $data['name'] !== $boutique->name) {
            $data['slug'] = Str::slug($data['name']) . '-' . rand(100, 999);
        }

        $boutique->update($data);

        return response()->json([
            'message' => 'Boutique mise à jour avec succès',
            'boutique' => $boutique
        ]);
    }

    public function destroy($id)
    {
        $boutique = Boutique::findOrFail($id);
        $boutique->delete();

        return response()->json([
            'message' => 'Boutique supprimée avec succès'
        ]);
    }
}
