<?php

namespace App\Http\Controllers\API;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function index(Conversation $conversation)
    {
        $this->authorizeConversation($conversation);

        $messages = $conversation->messages()
            ->with('user:id,name,role')
            ->get()
            ->map(fn ($m) => $this->formatMessage($m));

        return response()->json(['data' => $messages]);
    }

    public function store(Request $request, Conversation $conversation)
    {
        $this->authorizeConversation($conversation);
        $this->authorizeCanSend($conversation);

        $data = $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $message = $conversation->messages()->create([
            'user_id' => Auth::id(),
            'body' => trim($data['body']),
        ]);

        $message->load('user:id,name,role');
        $conversation->touch();
        MessageSent::dispatch($message);

        return response()->json($this->formatMessage($message), 201);
    }

    private function authorizeConversation(Conversation $conversation): void
    {
        $conversation->loadMissing('boutique');
        $user = Auth::user();

        $isCustomer = (int) $conversation->customer_id === (int) $user->id;
        $isOwner = $user->role === 'boutique_owner'
            && (int) $user->boutique_id === (int) $conversation->boutique_id;

        if (! $isCustomer && ! $isOwner) {
            abort(403, 'Accès non autorisé à cette conversation.');
        }
    }

    private function authorizeCanSend(Conversation $conversation): void
    {
        $conversation->loadMissing('boutique');
        $user = Auth::user();

        // Le magasinier peut toujours contacter le client (commande ou direct)
        if ($user->role === 'boutique_owner') {
            return;
        }

        // Conversation liée à une commande : le client peut répondre pour la validation
        if ($conversation->order_id) {
            return;
        }

        // Message direct : respecter le paramètre DM de la boutique
        $boutique = $conversation->boutique;
        if ($boutique && ! $boutique->messages_enabled) {
            abort(403, 'Cette boutique n\'accepte pas les messages pour le moment.');
        }
    }

    private function formatMessage(Message $message): array
    {
        return [
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'body' => $message->body,
            'user_id' => $message->user_id,
            'sender_name' => $message->user?->name ?? 'Utilisateur',
            'sender_role' => $message->user?->role,
            'is_mine' => (int) $message->user_id === (int) Auth::id(),
            'created_at' => $message->created_at?->toIso8601String(),
        ];
    }
}
