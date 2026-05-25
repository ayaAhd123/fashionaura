<?php

namespace App\Http\Controllers\Boutique;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\BoutiqueAIService;
use App\Services\StockAlertService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AIAdvisorController extends Controller
{
    public function __construct(
        private StockAlertService $stockAlerts,
        private BoutiqueAIService $boutiqueAI,
    ) {}

    public function recommendations(Request $request)
    {
        $boutique = Auth::user()->boutique;
        if (! $boutique) {
            return response()->json(['message' => 'Aucune boutique associée'], 422);
        }

        $boutiqueId = $boutique->id;
        $threshold = $this->stockAlerts->thresholdForBoutique($boutique);

        $topProducts = Product::where('boutique_id', $boutiqueId)
            ->with(['analytics' => fn ($q) => $q->orderBy('date', 'desc')->limit(30)])
            ->get()
            ->map(function ($product) {
                $purchases = (int) $product->analytics->sum('purchases');
                $views = (int) $product->analytics->sum('views');

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sales' => $purchases,
                    'total_purchases' => $purchases,
                    'total_views' => $views,
                    'trend' => $purchases > 0 ? 'up' : 'stable',
                    'growth' => $purchases > 0 ? min(99, $purchases * 3) : 0,
                ];
            })
            ->sortByDesc('sales')
            ->take(5)
            ->values();

        $recommendations = $this->ruleBasedRecommendations($boutiqueId, $threshold);

        return response()->json([
            'top_products' => $topProducts,
            'recommendations' => $recommendations,
            'stock_alert_threshold' => $threshold,
            'gemini_configured' => app(\App\Services\GeminiService::class)->isConfigured(),
        ]);
    }

    public function analysis(Request $request)
    {
        $boutique = Auth::user()->boutique;
        if (! $boutique) {
            return response()->json(['message' => 'Aucune boutique associée'], 422);
        }

        $boutique->load('city:id,name');

        $period = $request->get('period', '30days');
        $refresh = $request->boolean('refresh');
        $locale = $request->get('locale');

        $analysis = $this->boutiqueAI->generateAnalysis($boutique, $period, $refresh, $locale);

        return response()->json($analysis);
    }

    private function ruleBasedRecommendations(int $boutiqueId, int $threshold): array
    {
        $recommendations = [];

        $lowConversion = Product::where('boutique_id', $boutiqueId)
            ->with(['analytics'])
            ->get()
            ->filter(function ($product) {
                $views = $product->analytics->sum('views') ?? 0;
                $purchases = $product->analytics->sum('purchases') ?? 0;

                return $views > 50 && ($purchases / max($views, 1)) < 0.05;
            })
            ->take(3);

        foreach ($lowConversion as $product) {
            $views = $product->analytics->sum('views');
            $recommendations[] = $this->formatRecommendation([
                'type' => 'conversion',
                'title' => 'Améliorez la fiche produit',
                'message' => "« {$product->name} » a {$views} vues mais peu d'achats — photos, prix ou description à optimiser.",
                'product_id' => $product->id,
                'priority' => 'high',
            ]);
        }

        $lowStock = Product::where('boutique_id', $boutiqueId)
            ->where('is_active', true)
            ->where('stock_quantity', '<=', $threshold)
            ->where('stock_quantity', '>', 0)
            ->get();

        foreach ($lowStock as $product) {
            $recommendations[] = $this->formatRecommendation([
                'type' => 'restock',
                'title' => 'Stock faible',
                'message' => "« {$product->name} » : plus que {$product->stock_quantity} unité(s) (seuil {$threshold}).",
                'product_id' => $product->id,
                'priority' => 'medium',
            ]);
        }

        $outOfStock = Product::where('boutique_id', $boutiqueId)
            ->where('is_active', true)
            ->where('stock_quantity', '<=', 0)
            ->limit(5)
            ->get();

        foreach ($outOfStock as $product) {
            $recommendations[] = $this->formatRecommendation([
                'type' => 'restock',
                'title' => 'Rupture de stock',
                'message' => "« {$product->name} » est en rupture — réapprovisionnez rapidement.",
                'product_id' => $product->id,
                'priority' => 'high',
            ]);
        }

        return $recommendations;
    }

    /**
     * @param  array<string, mixed>  $rec
     * @return array<string, mixed>
     */
    private function formatRecommendation(array $rec): array
    {
        $type = $rec['type'] ?? 'catalog';
        $actions = [
            'restock' => 'Gérer les stocks',
            'conversion' => 'Modifier le produit',
            'price' => 'Ajuster le prix',
            'promotion' => 'Créer une promo',
            'catalog' => 'Explorer',
        ];

        return [
            'type' => $type,
            'priority' => $rec['priority'] ?? 'medium',
            'title' => $rec['title'] ?? 'Recommandation',
            'description' => $rec['message'] ?? $rec['description'] ?? '',
            'message' => $rec['message'] ?? $rec['description'] ?? '',
            'action' => $actions[$type] ?? 'Voir',
            'product_id' => $rec['product_id'] ?? null,
            'source' => 'rules',
        ];
    }
}
