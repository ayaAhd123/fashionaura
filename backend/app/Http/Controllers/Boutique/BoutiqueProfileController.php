<?php

namespace App\Http\Controllers\Boutique;

use App\Http\Controllers\Controller;
use App\Models\Boutique;
use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BoutiqueProfileController extends Controller
{
    private function getBoutique(): Boutique
    {
        $boutique = Auth::user()->boutique;
        if (! $boutique) {
            abort(422, 'Aucune boutique associée.');
        }

        return $boutique;
    }

    private function formatBoutique(Boutique $boutique): array
    {
        $boutique->loadMissing('city');
        $data = $boutique->toArray();
        $data['logo'] = MediaUrl::resolve($boutique->logo);
        $data['banner'] = MediaUrl::resolve($boutique->banner);

        return $data;
    }

    public function show()
    {
        return response()->json($this->formatBoutique($this->getBoutique()));
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
            'messages_enabled' => 'sometimes|boolean',
            'logo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'banner' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:8192'],
        ]);

        if ($request->hasFile('logo')) {
            $this->deleteStoredFile($boutique->logo);
            $data['logo'] = $this->storeImage($request, 'logo', 'boutiques/logos');
        }

        if ($request->hasFile('banner')) {
            $this->deleteStoredFile($boutique->banner);
            $data['banner'] = $this->storeImage($request, 'banner', 'boutiques/banners');
        }

        $boutique->update($data);

        return response()->json([
            'message' => 'Profil de la boutique mis à jour avec succès',
            'boutique' => $this->formatBoutique($boutique->fresh()),
        ]);
    }

    private function storeImage(Request $request, string $field, string $directory): string
    {
        $path = $request->file($field)->store($directory, 'public');

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
}
