<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Boutique;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;

class ConversationController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $query = Conversation::query()
            ->with([
                'boutique:id,name,logo,messages_enabled',
                'customer:id,name,avatar',
                'order:id,status',
            ])
            ->withCount('messages');

        if ($user->role === 'boutique_owner') {
            abort_unless($user->boutique_id, 422, 'Aucune boutique associée.');
            $query->where('boutique_id', $user->boutique_id);
        } else {
            $query->where('customer_id', $user->id);
        }

        $conversations = $query->latest('updated_at')->get();

        $lastMessages = Message::whereIn('conversation_id', $conversations->pluck('id'))
            ->orderByDesc('created_at')
            ->get()
            ->unique('conversation_id')
            ->keyBy('conversation_id');

        $data = $conversations->map(function (Conversation $conv) use ($user, $lastMessages) {
            $last = $lastMessages->get($conv->id);

            return [
                'id' => $conv->id,
                'type' => $conv->order_id ? 'order' : 'direct',
                'order_id' => $conv->order_id,
                'order_status' => $conv->order?->status,
                'boutique_id' => $conv->boutique_id,
                'boutique_name' => $conv->boutique?->name,
                'boutique_logo' => $conv->boutique?->logo,
                'customer_id' => $conv->customer_id,
                'customer_name' => $conv->customer?->name,
                'customer_avatar' => $conv->customer?->avatar,
                'messages_count' => $conv->messages_count,
                'counterpart_name' => $user->role === 'boutique_owner'
                    ? ($conv->customer?->name ?? 'Client')
                    : ($conv->boutique?->name ?? 'Boutique'),
                'label' => $conv->order_id
                    ? 'Commande #'.$conv->order_id
                    : 'Message direct',
                'last_message' => $last ? [
                    'body' => $last->body,
                    'created_at' => $last->created_at?->toIso8601String(),
                ] : null,
                'updated_at' => $conv->updated_at?->toIso8601String(),
            ];
        });

        return response()->json(['data' => $data]);
    }

    public function forOrder($orderId)
    {
        $order = $this->resolveOrder($orderId);
        $boutiqueId = $this->resolveBoutiqueIdForOrder($order);

        $conversation = Conversation::findOrCreateForOrder($order, $boutiqueId)
            ->load(['boutique:id,name,messages_enabled', 'customer:id,name']);

        return response()->json($this->formatConversation($conversation));
    }

    public function forBoutique(int $boutiqueId)
    {
        $user = Auth::user();
        abort_unless($user->role === 'customer', 403, 'Seuls les clients peuvent initier un message direct.');

        $boutique = Boutique::where('is_active', true)->findOrFail($boutiqueId);
        abort_unless($boutique->messages_enabled, 403, 'Cette boutique n\'accepte pas les messages pour le moment.');

        $conversation = Conversation::findOrCreateDirect($boutique, $user)
            ->load(['boutique:id,name,messages_enabled', 'customer:id,name']);

        return response()->json($this->formatConversation($conversation));
    }

    private function formatConversation(Conversation $conversation): array
    {
        return [
            'id' => $conversation->id,
            'type' => $conversation->order_id ? 'order' : 'direct',
            'order_id' => $conversation->order_id,
            'boutique_id' => $conversation->boutique_id,
            'customer_id' => $conversation->customer_id,
            'messages_enabled' => (bool) $conversation->boutique?->messages_enabled,
            'boutique_name' => $conversation->boutique?->name,
            'customer_name' => $conversation->customer?->name,
        ];
    }

    private function resolveOrder($orderId): Order
    {
        $user = Auth::user();

        if ($user->role === 'boutique_owner') {
            $boutiqueId = $user->boutique_id;
            abort_unless($boutiqueId, 422, 'Aucune boutique associée.');

            return Order::whereHas('items.product', fn ($q) => $q->where('boutique_id', $boutiqueId))
                ->findOrFail($orderId);
        }

        return Order::where('user_id', $user->id)->findOrFail($orderId);
    }

    private function resolveBoutiqueIdForOrder(Order $order): int
    {
        $user = Auth::user();

        if ($user->role === 'boutique_owner') {
            return (int) $user->boutique_id;
        }

        $boutiqueId = $order->items()
            ->with('product:id,boutique_id')
            ->get()
            ->pluck('product.boutique_id')
            ->filter()
            ->first();

        abort_unless($boutiqueId, 422, 'Boutique introuvable pour cette commande.');

        return (int) $boutiqueId;
    }
}
