<?php

namespace App\Http\Controllers\Boutique;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Services\StockAlertService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BoutiqueProductController extends Controller
{
    private const STYLES = ['casual', 'luxury', 'streetwear', 'formal', 'sport'];

    public function categories()
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        return response()->json(['data' => $categories]);
    }

    public function index(Request $request, StockAlertService $stockAlerts)
    {
        $boutique = $this->boutiqueOrFail();

        $threshold = $stockAlerts->thresholdForBoutique($boutique);

        $query = Product::where('boutique_id', $boutique->id)
            ->with('category:id,name,slug');

        if ($search = $request->get('search')) {
            $query->where('name', 'like', '%'.$search.'%');
        }

        if ($request->get('low_stock_only')) {
            $query->where('stock_quantity', '<=', $threshold);
        }

        $products = $query
            ->orderByRaw('stock_quantity ASC')
            ->orderBy('name')
            ->get()
            ->map(fn (Product $product) => $this->formatProduct($product, $threshold));

        return response()->json([
            'data' => $products,
            'meta' => [
                'total' => $products->count(),
                'low_stock_count' => $products->whereIn('stock_alert', ['out', 'low'])->count(),
                'threshold' => $threshold,
                'boutique' => $boutique->name,
            ],
        ]);
    }

    public function store(Request $request, StockAlertService $stockAlerts)
    {
        $boutique = $this->boutiqueOrFail();
        $data = $this->validateProduct($request);

        $product = Product::create([
            ...$data,
            'boutique_id' => $boutique->id,
            'slug' => $this->uniqueSlug($data['name']),
            'rating' => 0,
            'reviews_count' => 0,
        ]);

        $product->load('category:id,name,slug');
        $threshold = $stockAlerts->thresholdForBoutique($boutique);
        $stockAlerts->run($boutique->id);

        return response()->json([
            'message' => 'Produit créé.',
            'data' => $this->formatProduct($product, $threshold),
        ], 201);
    }

    public function update(Request $request, int $id, StockAlertService $stockAlerts)
    {
        $boutique = $this->boutiqueOrFail();
        $product = $this->findOwnedProduct($boutique->id, $id);
        $data = $this->validateProduct($request, $product);

        if ($product->name !== $data['name']) {
            $data['slug'] = $this->uniqueSlug($data['name'], $product->id);
        }

        $product->update($data);
        $product->load('category:id,name,slug');

        $threshold = $stockAlerts->thresholdForBoutique($boutique);
        $stockAlerts->run($boutique->id);

        return response()->json([
            'message' => 'Produit mis à jour.',
            'data' => $this->formatProduct($product->fresh(), $threshold),
        ]);
    }

    public function destroy(int $id)
    {
        $boutique = $this->boutiqueOrFail();
        $product = $this->findOwnedProduct($boutique->id, $id);

        $product->delete();

        return response()->json(['message' => 'Produit supprimé.']);
    }

    private function boutiqueOrFail()
    {
        $boutique = Auth::user()->boutique;

        if (! $boutique) {
            abort(422, 'Aucune boutique associée');
        }

        return $boutique;
    }

    private function findOwnedProduct(int $boutiqueId, int $productId): Product
    {
        return Product::where('boutique_id', $boutiqueId)->findOrFail($productId);
    }

    private function validateProduct(Request $request, ?Product $product = null): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')],
            'style' => ['nullable', 'string', Rule::in(self::STYLES)],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $validated['style'] = $validated['style'] ?? 'casual';
        $validated['is_active'] = $request->boolean('is_active', true);

        return $validated;
    }

    private function uniqueSlug(string $name, ?int $exceptId = null): string
    {
        $base = Str::slug($name) ?: 'produit';
        $slug = $base;
        $i = 1;

        while (
            Product::where('slug', $slug)
                ->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))
                ->exists()
        ) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }

    private function formatProduct(Product $product, int $threshold): array
    {
        $stock = (int) $product->stock_quantity;
        $alert = match (true) {
            $stock <= 0 => 'out',
            $stock <= $threshold => 'low',
            default => 'ok',
        };

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'price' => (float) $product->price,
            'stock_quantity' => $stock,
            'category_id' => $product->category_id,
            'category' => $product->category?->name,
            'style' => $product->style,
            'is_active' => (bool) $product->is_active,
            'is_test' => str_starts_with($product->name, '[TEST ALERTE]'),
            'stock_alert' => $alert,
            'threshold' => $threshold,
        ];
    }
}
