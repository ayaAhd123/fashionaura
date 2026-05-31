<?php

namespace App\Http\Controllers\Boutique;

use App\Http\Controllers\Controller;
use App\Models\Boutique;
use App\Models\BoutiquePost;
use App\Support\MediaUrl;
use App\Services\FollowerNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BoutiquePostController extends Controller
{
    // ── Public : fil de publications d'une boutique ───────────────────────────
    // Auth facultative : si l'utilisateur suit la boutique, il voit les contenus exclusifs.
    public function feed(Request $request, int $boutiqueId)
    {
        $boutique = Boutique::findOrFail($boutiqueId);

        $user = $request->user('sanctum');
        $isFollowing = false;
        if ($user) {
            $isFollowing = $boutique->followers()->where('user_id', $user->id)->exists();
        }

        $posts = $boutique->posts()
            ->where('is_published', true)
            ->withCount('comments')
            ->with(['product:id,name,slug,price', 'product.images:id,product_id,image_url,is_primary'])
            ->latest()
            ->get()
            ->map(fn (BoutiquePost $post) => $this->formatPost($post, $isFollowing));

        return response()->json([
            'data' => $posts,
            'meta' => [
                'is_following' => $isFollowing,
                'boutique' => $boutique->name,
            ],
        ]);
    }

    // ── Dashboard : liste des publications du propriétaire ────────────────────
    public function index()
    {
        $boutique = $this->boutiqueOrFail();

        $posts = $boutique->posts()
            ->with(['product:id,name,slug'])
            ->latest()
            ->get()
            ->map(fn (BoutiquePost $post) => $this->formatPostOwner($post));

        return response()->json(['data' => $posts]);
    }

    public function store(Request $request, FollowerNotificationService $followerNotifications)
    {
        $boutique = $this->boutiqueOrFail();
        $data = $this->validatePost($request, requiredImage: true);

        $post = new BoutiquePost([
            'boutique_id' => $boutique->id,
            'product_id' => $data['product_id'] ?? null,
            'caption' => $data['caption'] ?? null,
            'promo_code' => $data['promo_code'] ?? null,
            'promo_text' => $data['promo_text'] ?? null,
            'is_exclusive' => $request->boolean('is_exclusive'),
            'is_published' => $request->boolean('is_published', true),
        ]);

        if ($request->hasFile('image')) {
            $post->image = $this->storeImage($request);
        }

        $post->save();

        if ($post->is_published) {
            $followerNotifications->newPost($boutique, $post);
        }

        $post->load(['product:id,name,slug']);

        return response()->json([
            'message' => 'Publication créée.',
            'data' => $this->formatPostOwner($post),
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $boutique = $this->boutiqueOrFail();
        $post = $boutique->posts()->findOrFail($id);
        $data = $this->validatePost($request);

        $post->fill([
            'product_id' => $data['product_id'] ?? null,
            'caption' => $data['caption'] ?? null,
            'promo_code' => $data['promo_code'] ?? null,
            'promo_text' => $data['promo_text'] ?? null,
            'is_exclusive' => $request->boolean('is_exclusive'),
            'is_published' => $request->boolean('is_published', true),
        ]);

        if ($request->hasFile('image')) {
            $this->deleteStoredFile($post->image);
            $post->image = $this->storeImage($request);
        }

        $post->save();
        $post->load(['product:id,name,slug']);

        return response()->json([
            'message' => 'Publication mise à jour.',
            'data' => $this->formatPostOwner($post),
        ]);
    }

    public function destroy(int $id)
    {
        $boutique = $this->boutiqueOrFail();
        $post = $boutique->posts()->findOrFail($id);

        $this->deleteStoredFile($post->image);
        $post->delete();

        return response()->json(['message' => 'Publication supprimée.']);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private function boutiqueOrFail(): Boutique
    {
        $boutique = Auth::user()->boutique;
        if (! $boutique) {
            abort(422, 'Aucune boutique associée');
        }
        return $boutique;
    }

    private function validatePost(Request $request, bool $requiredImage = false): array
    {
        return $request->validate([
            'caption' => ['nullable', 'string', 'max:2000'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'promo_code' => ['nullable', 'string', 'max:60'],
            'promo_text' => ['nullable', 'string', 'max:255'],
            'is_exclusive' => ['sometimes', 'boolean'],
            'is_published' => ['sometimes', 'boolean'],
            'image' => [$requiredImage ? 'required' : 'nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ]);
    }

    private function storeImage(Request $request): string
    {
        $path = $request->file('image')->store('posts', 'public');

        return MediaUrl::fromStoragePath($path);
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

    private function productPayload(?\App\Models\Product $product): ?array
    {
        if (! $product) {
            return null;
        }
        $primary = $product->relationLoaded('images')
            ? ($product->images->firstWhere('is_primary', true) ?? $product->images->first())
            : null;

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'price' => (float) $product->price,
            'image_url' => $this->resolveImageUrl($primary?->image_url),
        ];
    }

    // Vue publique : masque le contenu exclusif aux non-abonnés (teaser)
    private function formatPost(BoutiquePost $post, bool $isFollowing): array
    {
        $locked = $post->is_exclusive && ! $isFollowing;

        return [
            'id' => $post->id,
            'image_url' => $this->resolveImageUrl($post->image),
            'caption' => $locked ? null : $post->caption,
            'promo_code' => $locked ? null : $post->promo_code,
            'promo_text' => $locked ? null : $post->promo_text,
            'is_exclusive' => $post->is_exclusive,
            'is_locked' => $locked,
            'product' => $locked ? null : $this->productPayload($post->product),
            'comments_count' => $locked ? 0 : (int) ($post->comments_count ?? 0),
            'created_at' => $post->created_at?->diffForHumans(),
        ];
    }

    // Vue propriétaire : tout est visible
    private function formatPostOwner(BoutiquePost $post): array
    {
        return [
            'id' => $post->id,
            'image_url' => $this->resolveImageUrl($post->image),
            'caption' => $post->caption,
            'promo_code' => $post->promo_code,
            'promo_text' => $post->promo_text,
            'is_exclusive' => $post->is_exclusive,
            'is_published' => $post->is_published,
            'product_id' => $post->product_id,
            'product' => $post->product ? ['id' => $post->product->id, 'name' => $post->product->name, 'slug' => $post->product->slug] : null,
            'created_at' => $post->created_at?->diffForHumans(),
        ];
    }

    private function resolveImageUrl(?string $url): ?string
    {
        return MediaUrl::resolve($url);
    }
}
