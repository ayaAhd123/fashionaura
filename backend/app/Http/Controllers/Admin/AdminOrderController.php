<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::query()->with(['user:id,name,email', 'items.product.boutique']);

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('id', $search);
        }

        $orders = $query->latest()->paginate(20);

        // Format similarly to what the frontend expects
        $formatted = collect($orders->items())->map(function ($order) {
            $firstItem = $order->items->first();
            return [
                'id' => $order->id,
                'customer' => $order->user ? $order->user->name : 'Client Inconnu',
                'customer_email' => $order->user ? $order->user->email : '',
                'product' => $firstItem && $firstItem->product ? $firstItem->product->name : 'Produit supprimé',
                'boutique' => $firstItem && $firstItem->product && $firstItem->product->boutique ? $firstItem->product->boutique->name : 'N/A',
                'amount' => (float)$order->total,
                'status' => $order->status,
                'date' => $order->created_at->toIso8601String(),
                'address' => $order->address,
                'phone' => $order->phone,
                'items_count' => $order->items->count(),
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
        $order = Order::findOrFail($id);

        $data = $request->validate([
            'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled',
        ]);

        $order->update(['status' => $data['status']]);

        return response()->json([
            'message' => 'Statut de la commande mis à jour avec succès',
            'order' => $order
        ]);
    }
}
