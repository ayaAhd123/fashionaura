<?php

namespace App\Support;

class MediaUrl
{
    /** Convertit un chemin storage en URL publique absolue (APP_URL + /storage/…). */
    public static function resolve(?string $url): ?string
    {
        if (! $url || ! is_string($url)) {
            return null;
        }

        $url = trim($url);
        if ($url === '') {
            return null;
        }

        // URL externe (Unsplash, etc.) — on ne touche pas
        if (preg_match('#^https?://#i', $url)) {
            $base = rtrim(config('app.url'), '/');
            // Corrige les anciennes URLs stockées avec http://localhost sans le bon port
            if (str_contains($url, '://localhost/') || str_contains($url, '://localhost/storage')) {
                $path = parse_url($url, PHP_URL_PATH) ?: '';

                return $base . $path;
            }

            return $url;
        }

        $base = rtrim(config('app.url'), '/');

        if (str_starts_with($url, '/storage/')) {
            return $base . $url;
        }

        if (str_starts_with($url, 'storage/')) {
            return $base . '/' . $url;
        }

        if (str_starts_with($url, '/')) {
            return $base . $url;
        }

        return $base . '/storage/' . ltrim($url, '/');
    }

    /** Chemin relatif à enregistrer en base après upload sur le disque public. */
    public static function fromStoragePath(string $path): string
    {
        return '/storage/' . ltrim(str_replace('\\', '/', $path), '/');
    }
}
