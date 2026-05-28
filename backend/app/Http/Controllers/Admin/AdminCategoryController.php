<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::query();
        if ($request->has('search')) {
            $categories->where('name', 'like', '%' . $request->get('search') . '%');
        }
        return response()->json($categories->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $data['slug'] = Str::slug($data['name']);
        $data['is_active'] = $request->boolean('is_active', true);

        $category = Category::create($data);

        return response()->json([
            'message' => 'Catégorie créée avec succès',
            'category' => $category
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255|unique:categories,name,' . $id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

        return response()->json([
            'message' => 'Catégorie mise à jour avec succès',
            'category' => $category
        ]);
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        // Check if there are products belonging to this category
        if ($category->products()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer cette catégorie car elle contient des produits.'
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Catégorie supprimée avec succès'
        ]);
    }
}
