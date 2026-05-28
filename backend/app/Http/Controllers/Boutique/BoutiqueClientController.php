<?php

namespace App\Http\Controllers\Boutique;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BoutiqueClientController extends Controller
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

        $clients = User::whereHas('orders.items.product', function ($q) use ($boutiqueId) {
            $q->where('boutique_id', $boutiqueId);
        })
        ->with(['orders' => function ($q) use ($boutiqueId) {
            $q->whereHas('items.product', function ($q2) use ($boutiqueId) {
                $q2->where('boutique_id', $boutiqueId);
            })->with(['items.product']);
        }])
        ->get()
        ->map(function ($client) use ($boutiqueId) {
            $ordersCount = $client->orders->count();
            $totalSpent = 0;

            foreach ($client->orders as $order) {
                $myItems = $order->items->filter(function ($item) use ($boutiqueId) {
                    return $item->product && $item->product->boutique_id === $boutiqueId;
                });

                $totalSpent += $myItems->sum(function ($item) {
                    return $item->price * $item->quantity;
                });
            }

            return [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'orders_count' => $ordersCount,
                'total_spent' => (float)$totalSpent,
                'join_date' => $client->created_at ? $client->created_at->toIso8601String() : null,
            ];
        });

        return response()->json($clients);
    }
}
