<?php

use App\Models\Conversation;
use App\Models\Order;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);
    if (! $conversation) {
        return false;
    }

    if ((int) $user->id === (int) $conversation->customer_id) {
        return ['id' => $user->id, 'name' => $user->name];
    }

    if ($user->role === 'boutique_owner' && (int) $user->boutique_id === (int) $conversation->boutique_id) {
        return ['id' => $user->id, 'name' => $user->name];
    }

    return false;
});

Broadcast::channel('order.{orderId}', function ($user, $orderId) {
    $order = Order::with(['items.product:id,boutique_id'])->find($orderId);
    if (! $order) {
        return false;
    }

    if ((int) $user->id === (int) $order->user_id) {
        return ['id' => $user->id, 'name' => $user->name];
    }

    if ($user->role === 'boutique_owner') {
        $boutiqueId = (int) $user->boutique_id;
        $ownsOrder = $order->items->contains(fn ($item) => (int) ($item->product?->boutique_id ?? 0) === $boutiqueId);
        if ($ownsOrder) {
            return ['id' => $user->id, 'name' => $user->name];
        }
    }

    return false;
});
