<?php

namespace App\Services;

use App\Models\Boutique;
use App\Models\BoutiquePost;
use App\Models\Notification;
use App\Models\Product;

class FollowerNotificationService
{
    // Crée une notification pour chaque follower d'une boutique
    protected function notifyFollowers(Boutique $boutique, string $type, string $title, string $message, ?string $actionUrl = null, array $data = []): void
    {
        $followerIds = $boutique->followers()->pluck('user_id')->unique();

        if ($followerIds->isEmpty()) {
            return;
        }

        $now = now();
        $rows = $followerIds->map(fn ($userId) => [
            'user_id' => $userId,
            'boutique_id' => $boutique->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'is_read' => false,
            'action_url' => $actionUrl,
            'data' => json_encode($data),
            'created_at' => $now,
            'updated_at' => $now,
        ])->all();

        Notification::insert($rows);
    }

    public function newProduct(Boutique $boutique, Product $product): void
    {
        $this->notifyFollowers(
            $boutique,
            'new_product',
            'Nouveauté chez ' . $boutique->name,
            $boutique->name . ' vient d\'ajouter « ' . $product->name .' ».',
            '/products/' . $product->slug,
            ['product_id' => $product->id, 'boutique_id' => $boutique->id]
        );
    }

    public function backInStock(Boutique $boutique, Product $product): void
    {
        $this->notifyFollowers(
            $boutique,
            'back_in_stock',
            'De nouveau disponible',
            '« ' . $product->name . ' » est de nouveau en stock chez ' . $boutique->name . '.',
            '/products/' . $product->slug,
            ['product_id' => $product->id, 'boutique_id' => $boutique->id]
        );
    }

    public function newPost(Boutique $boutique, BoutiquePost $post): void
    {
        $label = $post->is_exclusive ? 'Offre exclusive' : 'Nouvelle publication';
        $this->notifyFollowers(
            $boutique,
            'new_post',
            $label . ' — ' . $boutique->name,
            $boutique->name . ' a publié ' . ($post->is_exclusive ? 'une offre réservée à ses abonnés.' : 'une nouvelle actualité.'),
            '/boutiques/' . $boutique->slug,
            ['post_id' => $post->id, 'boutique_id' => $boutique->id]
        );
    }
}
