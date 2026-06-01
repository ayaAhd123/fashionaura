<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Boutique;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Order;
use App\Models\User;
use App\Services\MessageFormatter;
use Illuminate\Http\Request;
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
                'peerUser:id,name,avatar',
                'order:id,status',
            ])
            ->withCount('messages');

        if ($user->role === 'boutique_owner') {
            abort_unless($user->boutique_id, 422, 'Aucune boutique associée.');
            $query->where('kind', Conversation::KIND_BOUTIQUE)
                ->where('boutique_id', $user->boutique_id);
        } else {
            $query->where(function ($q) use ($user) {
                $q->where(function ($q2) use ($user) {
                    $q2->where('kind', Conversation::KIND_BOUTIQUE)
                        ->where('customer_id', $user->id);
                })->orWhere(function ($q2) use ($user) {
                    $q2->where('kind', Conversation::KIND_USER)
                        ->where(function ($q3) use ($user) {
                            $q3->where('customer_id', $user->id)
                                ->orWhere('peer_user_id', $user->id);
                        });
                });
            });
        }

        $conversations = $query->latest('updated_at')->get();

        $lastMessages = Message::whereIn('conversation_id', $conversations->pluck('id'))
            ->with(['product:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->unique('conversation_id')
            ->keyBy('conversation_id');

        $data = $conversations->map(function (Conversation $conv) use ($user, $lastMessages) {
            $last = $lastMessages->get($conv->id);
            $lastFormatted = $last ? MessageFormatter::format($last, (int) $user->id) : null;

            if ($conv->kind === Conversation::KIND_USER) {
                $counterpart = (int) $user->id === (int) $conv->customer_id
                    ? $conv->peerUser
                    : $conv->customer;

                return [
                    'id' => $conv->id,
                    'kind' => $conv->kind,
                    'type' => 'user',
                    'peer_user_id' => $counterpart?->id,
                    'counterpart_name' => $counterpart?->name ?? 'Utilisateur',
                    'counterpart_avatar' => $counterpart?->avatar,
                    'label' => $counterpart?->name ?? 'Discussion',
                    'messages_count' => $conv->messages_count,
                    'last_message' => $lastFormatted ? [
                        'preview' => $lastFormatted['preview'],
                        'created_at' => $lastFormatted['created_at'],
                    ] : null,
                    'updated_at' => $conv->updated_at?->toIso8601String(),
                ];
            }

            return [
                'id' => $conv->id,
                'kind' => $conv->kind,
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
                'last_message' => $lastFormatted ? [
                    'preview' => $lastFormatted['preview'],
                    'created_at' => $lastFormatted['created_at'],
                ] : null,
                'updated_at' => $conv->updated_at?->toIso8601String(),
            ];
        });

        return response()->json(['data' => $data]);
    }

    public function searchUsers(Request $request)
    {
        abort_unless(Auth::user()->role === 'customer', 403, 'Recherche réservée aux comptes client.');

        $q = trim((string) $request->get('q', ''));
        abort_if(mb_strlen($q) < 2, 422, 'Saisissez au moins 2 caractères.');

        $users = User::query()
            ->where('id', '!=', Auth::id())
            ->where('role', 'customer')
            ->where('is_active', true)
            ->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            })
            ->orderBy('name')
            ->limit(15)
            ->get(['id', 'name', 'email', 'avatar']);

        return response()->json(['data' => $users]);
    }

    public function forUser(int $userId)
    {
        abort_unless(Auth::user()->role === 'customer', 403, 'Seuls les clients peuvent discuter entre eux.');

        $other = User::where('role', 'customer')->where('is_active', true)->findOrFail($userId);
        abort_if((int) Auth::id() === (int) $other->id, 422, 'Impossible de discuter avec vous-même.');

        $conversation = Conversation::findOrCreateUserDirect(Auth::user(), $other)
            ->load(['customer:id,name,avatar', 'peerUser:id,name,avatar']);

        $counterpart = (int) Auth::id() === (int) $conversation->customer_id
            ? $conversation->peerUser
            : $conversation->customer;

        return response()->json([
            'id' => $conversation->id,
            'kind' => $conversation->kind,
            'type' => 'user',
            'peer_user_id' => $counterpart?->id,
            'counterpart_name' => $counterpart?->name,
            'counterpart_avatar' => $counterpart?->avatar,
        ]);
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
            'kind' => $conversation->kind,
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
