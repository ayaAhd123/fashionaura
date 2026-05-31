<?php

namespace App\Http\Controllers\Boutique;

use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BoutiqueOrderController extends Controller
{
    private function getBoutiqueId()
    {
        $boutique = Auth::user()->boutique;
        if (!$boutique) {
            abort(422, 'Aucune boutique associée à cet utilisateur.');
        }
        return $boutique->id;
    }

    public function index(Request $request)
    {
        $boutiqueId = $this->getBoutiqueId();

        $orders = Order::whereHas('items.product', function ($q) use ($boutiqueId) {
            $q->where('boutique_id', $boutiqueId);
        })
        ->with(['user:id,name,email', 'items.product' => function ($q) use ($boutiqueId) {
            $q->where('boutique_id', $boutiqueId);
        }])
        ->latest()
        ->paginate(20);

        // Format to simplify usage on frontend
        $formatted = collect($orders->items())->map(function ($order) use ($boutiqueId) {
            // Find items for this boutique
            $myItems = $order->items->filter(function ($item) use ($boutiqueId) {
                return $item->product && $item->product->boutique_id === $boutiqueId;
            });

            $firstItem = $myItems->first();
            $myTotal = $myItems->sum(function ($item) {
                return $item->price * $item->quantity;
            });

            return [
                'id' => $order->id,
                'customer_id' => $order->user_id,
                'customer' => $order->user ? $order->user->name : 'Client Inconnu',
                'customer_email' => $order->user ? $order->user->email : '',
                'product' => $firstItem && $firstItem->product ? $firstItem->product->name : 'Produit supprimé',
                'amount' => (float)$myTotal,
                'status' => $order->status, // Using global status for now
                'date' => $order->created_at->toIso8601String(),
                'address' => $order->address,
                'phone' => $order->phone,
                'items_count' => $myItems->count(),
                'items' => $myItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->product ? $item->product->name : 'Produit supprimé',
                        'quantity' => $item->quantity,
                        'price' => (float)$item->price,
                        'size' => $item->size,
                        'color' => $item->color,
                    ];
                })->values(),
            ];
        });

        return response()->json([
            'current_page' => $orders->currentPage(),
            'data' => $formatted,
            'first_page_url' => $orders->url(1),
            'from' => $orders->firstItem(),
            'last_page' => $orders->lastPage(),
            'last_page_url' => $orders->url($orders->lastPage()),
            'next_page_url' => $orders->nextPageUrl(),
            'path' => $orders->path(),
            'per_page' => $orders->perPage(),
            'prev_page_url' => $orders->previousPageUrl(),
            'to' => $orders->lastItem(),
            'total' => $orders->total(),
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $boutiqueId = $this->getBoutiqueId();
        
        // Find order that belongs to this boutique
        $order = Order::whereHas('items.product', function ($q) use ($boutiqueId) {
            $q->where('boutique_id', $boutiqueId);
        })->findOrFail($id);

        $data = $request->validate([
            'status' => 'required|string|in:pending,confirmed,processing,shipped,delivered,cancelled',
        ]);

        $order->update(['status' => $data['status']]);
        OrderStatusUpdated::dispatch($order->fresh());

        return response()->json([
            'message' => 'Statut de la commande mis à jour avec succès',
            'order' => $order
        ]);
    }
}
