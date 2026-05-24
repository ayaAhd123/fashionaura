<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\Request;

class CityController extends Controller
{
    public function index()
    {
        $cities = City::withCount('boutiques')->get();
        return response()->json($cities);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'region' => 'nullable|string',
            'image' => 'nullable|string|url',
        ]);

        $city = City::create($request->all());
        return response()->json($city, 201);
    }

    public function update(Request $request, $id)
    {
        $city = City::findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'region' => 'nullable|string',
            'image' => 'nullable|string|url',
        ]);

        $city->update($request->all());
        return response()->json($city);
    }

    public function destroy($id)
    {
        $city = City::findOrFail($id);
        
        if ($city->boutiques()->count() > 0) {
            return response()->json(['message' => 'Impossible de supprimer une ville qui a des boutiques'], 400);
        }
        
        $city->delete();
        return response()->json(['message' => 'Ville supprimée avec succès']);
    }
}