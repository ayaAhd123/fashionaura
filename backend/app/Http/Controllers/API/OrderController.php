<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // GET /api/orders — commandes de l'utilisateur connecté
    public function index()
    {
        $orders = Order::where('user_id', Auth::id())
            ->with([
                'items.product:id,name,slug,boutique_id',
                'items.product.boutique:id,name,slug',
            ])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($orders);
    }

    // GET /api/orders/{id} — détail d'une commande (propriétaire uniquement)
    public function show($id)
    {
        $order = Order::where('user_id', Auth::id())
            ->with([
                'items.product:id,name,slug,boutique_id',
                'items.product.boutique:id,name,slug',
            ])
            ->findOrFail($id);

        return response()->json($order);
    }

    // POST /api/orders — crée une commande à partir des articles du panier
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.size' => 'nullable|string|max:50',
            'items.*.color' => 'nullable|string|max:50',
            'address' => 'required|string|max:500',
            'phone' => 'required|string|max:30',
        ]);

        return DB::transaction(function () use ($validated) {
            $order = Order::create([
                'user_id' => Auth::id(),
                'total' => 0,
                'status' => 'pending',
                'address' => $validated['address'],
                'phone' => $validated['phone'],
            ]);

            $total = 0.0;
            foreach ($validated['items'] as $line) {
                $product = Product::findOrFail($line['product_id']);
                // Prix de référence côté serveur (jamais celui envoyé par le client)
                $unitPrice = (float) ($product->discount_price ?? $product->price);
                $quantity = (int) $line['quantity'];
                $total += $unitPrice * $quantity;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'price' => $unitPrice,
                    'size' => $line['size'] ?? null,
                    'color' => $line['color'] ?? null,
                ]);
            }

            $order->update(['total' => round($total, 2)]);

            return response()->json(
                $order->load([
                    'items.product:id,name,slug,boutique_id',
                    'items.product.boutique:id,name,slug',
                ]),
                201
            );
        });
    }

}
