<?php

namespace App\Http\Controllers\Boutique;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AIAdvisorController extends Controller
{
    private function getBoutiqueId()
    {
        return Auth::user()->boutique_id;
    }

    public function recommendations()
    {
        $boutiqueId = $this->getBoutiqueId();
        
        $topProducts = Product::where('boutique_id', $boutiqueId)
            ->with(['analytics' => function($q) {
                $q->orderBy('purchases', 'desc')->limit(30);
            }])
            ->get()
            ->map(function($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'total_purchases' => $product->analytics->sum('purchases'),
                    'total_views' => $product->analytics->sum('views'),
                ];
            })
            ->sortByDesc('total_purchases')
            ->take(5)
            ->values();

        $recommendations = [];
        
        $lowConversion = Product::where('boutique_id', $boutiqueId)
            ->with(['analytics' => function($q) {
                $q->select('product_id', DB::raw('SUM(views) as total_views'), DB::raw('SUM(purchases) as total_purchases'))
                  ->groupBy('product_id');
            }])
            ->get()
            ->filter(function($product) {
                $views = $product->analytics->sum('views') ?? 0;
                $purchases = $product->analytics->sum('purchases') ?? 0;
                return $views > 50 && ($purchases / max($views, 1)) < 0.05;
            })
            ->take(3);

        foreach ($lowConversion as $product) {
            $recommendations[] = [
                'type' => 'low_conversion',
                'title' => 'Améliorez la fiche produit',
                'message' => "Le produit '{$product->name}' a {$product->analytics->sum('views')} vues mais peu d'achats.",
                'product_id' => $product->id,
                'priority' => 'high',
            ];
        }

        $lowStock = Product::where('boutique_id', $boutiqueId)
            ->where('stock', '<', 10)
            ->where('stock', '>', 0)
            ->get();

        foreach ($lowStock as $product) {
            $recommendations[] = [
                'type' => 'low_stock',
                'title' => 'Stock faible',
                'message' => "Le produit '{$product->name}' n'a plus que {$product->stock} unités en stock.",
                'product_id' => $product->id,
                'priority' => 'medium',
            ];
        }

        return response()->json([
            'top_products' => $topProducts,
            'recommendations' => $recommendations,
        ]);
    }
}