<?php

namespace App\Http\Controllers\API;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Product;
use App\Services\MessageFormatter;
use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function index(Conversation $conversation)
    {
        $this->authorizeConversation($conversation);

        $messages = $conversation->messages()
            ->with(['user:id,name,role,avatar', 'product.boutique:id,name', 'product.images'])
            ->get()
            ->map(fn ($m) => MessageFormatter::format($m));

        return response()->json(['data' => $messages]);
    }

    public function store(Request $request, Conversation $conversation)
    {
        $this->authorizeConversation($conversation);
        $this->authorizeCanSend($conversation);

        $data = $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $message = $this->createAndBroadcast($conversation, [
            'type' => Message::TYPE_TEXT,
            'body' => trim($data['body']),
        ]);

        return response()->json(MessageFormatter::format($message), 201);
    }

    public function storeAudio(Request $request, Conversation $conversation)
    {
        $this->authorizeConversation($conversation);
        $this->authorizeCanSend($conversation);

        $request->validate([
            'audio' => 'required|file|max:5120|mimes:webm,mp4,mpeg,wav,ogg,mp3,x-m4a',
        ]);

        $path = MediaUrl::fromStoragePath($request->file('audio')->store('audio', 'public'));

        $message = $this->createAndBroadcast($conversation, [
            'type' => Message::TYPE_AUDIO,
            'body' => null,
            'audio_path' => $path,
        ]);

        return response()->json(MessageFormatter::format($message), 201);
    }

    public function storeProduct(Request $request, Conversation $conversation)
    {
        $this->authorizeConversation($conversation);
        $this->authorizeCanSend($conversation);

        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $product = Product::where('is_active', true)->findOrFail($data['product_id']);

        $message = $this->createAndBroadcast($conversation, [
            'type' => Message::TYPE_PRODUCT,
            'body' => null,
            'product_id' => $product->id,
        ]);

        return response()->json(MessageFormatter::format($message->load(['product.boutique', 'product.images'])), 201);
    }

    private function createAndBroadcast(Conversation $conversation, array $attributes): Message
    {
        $message = $conversation->messages()->create(array_merge([
            'user_id' => Auth::id(),
        ], $attributes));

        $message->load('user:id,name,role,avatar');
        $conversation->touch();
        MessageSent::dispatch($message);

        return $message;
    }

    private function authorizeConversation(Conversation $conversation): void
    {
        $conversation->loadMissing(['boutique', 'peerUser', 'customer']);
        $user = Auth::user();

        if ($conversation->kind === Conversation::KIND_USER) {
            if ($conversation->involvesUser((int) $user->id)) {
                return;
            }
            abort(403, 'Accès non autorisé à cette conversation.');
        }

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

        if ($conversation->kind === Conversation::KIND_USER) {
            return;
        }

        if ($user->role === 'boutique_owner') {
            return;
        }

        if ($conversation->order_id) {
            return;
        }

        $boutique = $conversation->boutique;
        if ($boutique && ! $boutique->messages_enabled) {
            abort(403, 'Cette boutique n\'accepte pas les messages pour le moment.');
        }
    }
}
