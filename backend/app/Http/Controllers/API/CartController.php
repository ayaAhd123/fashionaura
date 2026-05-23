<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    // GET /api/cart - Retourne le panier de l'utilisateur
    public function index()
    {
        $cart = Cart::with(['items' => function ($query) {
            $query->with('product:id,name,price,discount_price', 'variant:id,size,color');
        }])->firstOrCreate(['user_id' => Auth::id()]);

        return response()->json($cart);
    }

    // POST /api/cart/add - Ajoute un produit au panier
    public function add(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);
        $product = Product::findOrFail($validated['product_id']);
        $cart = Cart::firstOrCreate(['user_id' => Auth::id()]);

        $price = $product->discount_price ?? $product->price;

        $cartItem = CartItem::updateOrCreate(
            [
                'cart_id' => $cart->id,
                'product_id' => $validated['product_id'],
                'product_variant_id' => $validated['product_variant_id'] ?? null,
            ],
            [
                'quantity' => $validated['quantity'],
                'price' => $price,
            ]
        );

        return response()->json(['success' => true, 'item' => $cartItem], 201);
    }

    // PUT /api/cart/update/{cartItemId} - Met à jour la quantité
    public function update(Request $request, $cartItemId)
    {
        $cartItem = CartItem::findOrFail($cartItemId);
        $validated = $request->validate(['quantity' => 'required|integer|min:0']);

        if ($validated['quantity'] == 0) {
            $cartItem->delete();
            return response()->json(['success' => true, 'message' => 'Article supprimé']);
        }

        $cartItem->update(['quantity' => $validated['quantity']]);
        return response()->json($cartItem);
    }

    // DELETE /api/cart/remove/{cartItemId} - Supprime un article du panier
    public function remove($cartItemId)
    {
        CartItem::findOrFail($cartItemId)->delete();
        return response()->json(['success' => true, 'message' => 'Article supprimé']);
    }
}
