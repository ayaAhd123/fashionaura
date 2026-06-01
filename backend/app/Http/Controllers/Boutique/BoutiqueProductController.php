<?php

namespace App\Http\Controllers\Boutique;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Support\MediaUrl;
use App\Services\FollowerNotificationService;
use App\Services\StockAlertService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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
            ->with([
                'category:id,name,slug',
                'images' => fn ($q) => $q->orderByDesc('is_primary')->orderBy('sort_order'),
            ]);

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

    public function store(Request $request, StockAlertService $stockAlerts, FollowerNotificationService $followerNotifications)
    {
        $boutique = $this->boutiqueOrFail();
        $data = $this->validateProduct($request, requiredImage: true);

        $product = Product::create([
            ...$data,
            'boutique_id' => $boutique->id,
            'slug' => $this->uniqueSlug($data['name']),
            'rating' => 0,
            'reviews_count' => 0,
        ]);

        $this->syncProductImage($product, $request);

        $product->load(['category:id,name,slug', 'images']);
        $threshold = $stockAlerts->thresholdForBoutique($boutique);
        $stockAlerts->run($boutique->id);

        // Prévenir les abonnés de la boutique d'une nouveauté (produit visible uniquement)
        if ($product->is_active) {
            $followerNotifications->newProduct($boutique, $product);
        }

        return response()->json([
            'message' => 'Produit créé.',
            'data' => $this->formatProduct($product, $threshold),
        ], 201);
    }

    public function update(Request $request, int $id, StockAlertService $stockAlerts, FollowerNotificationService $followerNotifications)
    {
        $boutique = $this->boutiqueOrFail();
        $product = $this->findOwnedProduct($boutique->id, $id);
        $previousStock = (int) $product->stock_quantity;
        $data = $this->validateProduct($request, $product);

        if ($product->name !== $data['name']) {
            $data['slug'] = $this->uniqueSlug($data['name'], $product->id);
        }

        $product->update($data);

        if ($request->hasFile('image')) {
            $this->syncProductImage($product, $request);
        }

        $product->load(['category:id,name,slug', 'images']);
        $threshold = $stockAlerts->thresholdForBoutique($boutique);
        $stockAlerts->run($boutique->id);

        // Retour en stock : on prévient les abonnés (transition 0 -> >0)
        if ($previousStock <= 0 && (int) $product->stock_quantity > 0 && $product->is_active) {
            $followerNotifications->backInStock($boutique, $product);
        }

        return response()->json([
            'message' => 'Produit mis à jour.',
            'data' => $this->formatProduct($product->fresh(['category', 'images']), $threshold),
        ]);
    }

    public function destroy(int $id)
    {
        $boutique = $this->boutiqueOrFail();
        $product = $this->findOwnedProduct($boutique->id, $id);

        foreach ($product->images as $image) {
            $this->deleteStoredFile($image->image_url);
        }

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

    private function validateProduct(Request $request, ?Product $product = null, bool $requiredImage = false): array
    {
        $needsImage = $requiredImage || ($product && ! $product->images()->exists());

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id'), 'required_without:category_name'],
            'category_name' => ['nullable', 'string', 'max:255', 'required_without:category_id'],
            'style' => ['nullable', 'string', Rule::in(self::STYLES)],
            'is_active' => ['sometimes', 'boolean'],
            'image' => [
                $needsImage ? 'required' : 'nullable',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:5120',
            ],
        ];

        $validated = $request->validate($rules);

        if (! empty($validated['category_name'])) {
            $validated['category_id'] = $this->findOrCreateCategory($validated['category_name']);
        }

        unset($validated['category_name']);

        $validated['style'] = $validated['style'] ?? 'casual';
        $validated['is_active'] = $request->boolean('is_active', true);

        unset($validated['image']);

        return $validated;
    }

    /** Trouve une catégorie existante (insensible à la casse) ou en crée une nouvelle. */
    private function findOrCreateCategory(string $name): int
    {
        $name = trim($name);
        if ($name === '') {
            abort(422, 'Le nom de la catégorie est requis.');
        }

        $existing = Category::query()
            ->whereRaw('LOWER(name) = ?', [Str::lower($name)])
            ->first();

        if ($existing) {
            if (! $existing->is_active) {
                $existing->update(['is_active' => true]);
            }

            return $existing->id;
        }

        $slug = Str::slug($name);
        $base = $slug !== '' ? $slug : 'categorie';
        $candidate = $base;
        $i = 1;
        while (Category::where('slug', $candidate)->exists()) {
            $candidate = $base.'-'.$i;
            $i++;
        }

        $category = Category::create([
            'name' => $name,
            'slug' => $candidate,
            'is_active' => true,
        ]);

        return $category->id;
    }

    private function syncProductImage(Product $product, Request $request): void
    {
        $file = $request->file('image');
        if (! $file) {
            return;
        }

        $path = $file->store('products', 'public');
        $url = MediaUrl::fromStoragePath($path);

        $primary = $product->images()->where('is_primary', true)->first();
        if ($primary) {
            $this->deleteStoredFile($primary->image_url);
            $primary->update(['image_url' => $url]);
        } else {
            ProductImage::create([
                'product_id' => $product->id,
                'image_url' => $url,
                'is_primary' => true,
                'sort_order' => 0,
            ]);
        }
    }

    private function deleteStoredFile(?string $url): void
    {
        if (! $url || ! str_contains($url, '/storage/')) {
            return;
        }

        $path = Str::after($url, '/storage/');
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
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

        $primary = $product->images->firstWhere('is_primary', true)
            ?? $product->images->first();

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
            'image_url' => MediaUrl::resolve($primary?->image_url),
            'stock_alert' => $alert,
            'threshold' => $threshold,
        ];
    }

    private function resolveImageUrl(?string $url): ?string
    {
        return MediaUrl::resolve($url);
    }
}
