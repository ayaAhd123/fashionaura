<?php

namespace App\Services;

use App\Models\Message;
use App\Support\MediaUrl;

class MessageFormatter
{
    public static function format(Message $message, ?int $viewerId = null): array
    {
        $message->loadMissing(['user:id,name,role,avatar', 'product.boutique:id,name', 'product.images']);

        $viewerId ??= auth()->id();

        $product = null;
        if ($message->type === 'product' && $message->product) {
            $p = $message->product;
            $image = $p->relationLoaded('images')
                ? ($p->images->firstWhere('is_primary', true) ?? $p->images->first())
                : null;

            $product = [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'price' => (float) ($p->discount_price ?? $p->price),
                'image_url' => MediaUrl::resolve($image?->image_url),
                'boutique_name' => $p->boutique?->name,
            ];
        }

        $preview = match ($message->type) {
            'audio' => 'Message vocal',
            'product' => $product ? 'Produit : '.$product['name'] : 'Produit partagé',
            default => $message->body,
        };

        return [
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'type' => $message->type,
            'body' => $message->body,
            'preview' => $preview,
            'audio_url' => $message->audio_path ? MediaUrl::resolve($message->audio_path) : null,
            'product' => $product,
            'product_id' => $message->product_id,
            'user_id' => $message->user_id,
            'sender_name' => $message->user?->name ?? 'Utilisateur',
            'sender_role' => $message->user?->role,
            'sender_avatar' => $message->user?->avatar,
            'is_mine' => $viewerId ? (int) $message->user_id === (int) $viewerId : false,
            'created_at' => $message->created_at?->toIso8601String(),
        ];
    }
}
