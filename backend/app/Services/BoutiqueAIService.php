<?php

namespace App\Services;

use App\Models\Boutique;
use App\Support\LocaleHelper;
use App\Models\BoutiqueAnalytics;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class BoutiqueAIService
{
    public function __construct(
        private GeminiService $gemini,
        private StockAlertService $stockAlerts,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function generateAnalysis(Boutique $boutique, string $period = '30days', bool $refresh = false, ?string $locale = null): array
    {
        $locale = LocaleHelper::normalize($locale);
        $context = $this->buildContext($boutique, $period);
        $cacheKey = "boutique_ai_analysis_{$boutique->id}_{$period}_{$locale}";

        if (! $refresh && Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        if (! $this->gemini->isConfigured()) {
            $result = [
                'available' => false,
                'message' => 'Ajoutez GEMINI_API_KEY dans backend/.env pour activer l\'analyse IA.',
                'period_label' => $context['period_label'],
                'context' => $context['stats'],
                'fallback' => $this->fallbackAnalysis($context),
            ];
            Cache::put($cacheKey, $result, now()->addMinutes(15));

            return $result;
        }

        try {
            $ai = $this->gemini->generateJson(
                $this->systemPrompt($locale),
                $this->userPrompt($context, $locale)
            );

            $result = [
                'available' => true,
                'generated_at' => now()->toIso8601String(),
                'period_label' => $context['period_label'],
                'summary' => $ai['summary'] ?? '',
                'strengths' => $ai['strengths'] ?? [],
                'weaknesses' => $ai['weaknesses'] ?? [],
                'monthly_focus' => $ai['monthly_focus'] ?? '',
                'recommendations' => $this->normalizeAiRecommendations($ai['recommendations'] ?? []),
                'best_products_note' => $ai['best_products_note'] ?? '',
                'worst_products_note' => $ai['worst_products_note'] ?? '',
            ];

            Cache::put($cacheKey, $result, now()->addMinutes((int) config('fashionaura.ai_cache_minutes', 60)));

            return $result;
        } catch (\Throwable $e) {
            return [
                'available' => false,
                'message' => 'Analyse IA temporairement indisponible. Les recommandations automatiques restent affichées.',
                'error' => config('app.debug') ? $e->getMessage() : null,
                'period_label' => $context['period_label'],
                'fallback' => $this->fallbackAnalysis($context),
            ];
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function buildContext(Boutique $boutique, string $period): array
    {
        $startDate = match ($period) {
            '7days' => Carbon::now()->subDays(7),
            '90days' => Carbon::now()->subDays(90),
            default => Carbon::now()->subDays(30),
        };

        $periodLabel = match ($period) {
            '7days' => '7 derniers jours',
            '90days' => '90 derniers jours',
            default => '30 derniers jours',
        };

        $boutiqueId = $boutique->id;
        $threshold = $this->stockAlerts->thresholdForBoutique($boutique);

        $products = Product::where('boutique_id', $boutiqueId)
            ->where('is_active', true)
            ->with(['analytics' => fn ($q) => $q->where('date', '>=', $startDate)])
            ->get();

        $productStats = $products->map(function (Product $product) {
            $views = (int) $product->analytics->sum('views');
            $purchases = (int) $product->analytics->sum('purchases');
            $revenue = (float) $product->analytics->sum('revenue');

            return [
                'name' => $product->name,
                'price' => (float) $product->price,
                'stock' => (int) $product->stock_quantity,
                'views' => $views,
                'purchases' => $purchases,
                'revenue' => $revenue,
                'conversion' => $views > 0 ? round(($purchases / $views) * 100, 1) : 0,
            ];
        });

        $topProducts = $productStats->sortByDesc('purchases')->take(5)->values();
        $worstProducts = $productStats
            ->filter(fn ($p) => $p['views'] >= 10)
            ->sortBy('conversion')
            ->take(5)
            ->values();

        $boutiqueAnalytics = BoutiqueAnalytics::where('boutique_id', $boutiqueId)
            ->where('date', '>=', $startDate)
            ->get();

        $orderItems = OrderItem::whereHas('product', fn ($q) => $q->where('boutique_id', $boutiqueId))
            ->whereHas('order', fn ($q) => $q->where('created_at', '>=', $startDate))
            ->with('product:id,name')
            ->get();

        $ordersRevenue = (float) $orderItems->sum(fn ($item) => $item->price * $item->quantity);

        return [
            'boutique_name' => $boutique->name,
            'city' => $boutique->city?->name,
            'period_label' => $periodLabel,
            'threshold' => $threshold,
            'stats' => [
                'total_products' => $products->count(),
                'low_stock' => $products->where('stock_quantity', '<=', $threshold)->where('stock_quantity', '>', 0)->count(),
                'out_of_stock' => $products->where('stock_quantity', '<=', 0)->count(),
                'total_views' => (int) $boutiqueAnalytics->sum('total_views'),
                'total_orders' => (int) $boutiqueAnalytics->sum('total_orders'),
                'analytics_revenue' => (float) $boutiqueAnalytics->sum('total_revenue'),
                'orders_revenue' => $ordersRevenue,
                'average_rating' => round((float) Review::where('boutique_id', $boutiqueId)->avg('rating'), 1),
            ],
            'top_products' => $topProducts->all(),
            'worst_products' => $worstProducts->all(),
            'low_stock_names' => $products
                ->where('stock_quantity', '<=', $threshold)
                ->pluck('name')
                ->take(8)
                ->values()
                ->all(),
        ];
    }

    private function systemPrompt(string $locale = 'fr'): string
    {
        $langRule = LocaleHelper::geminiLanguageRule($locale);

        return <<<PROMPT
Tu es un conseiller e-commerce expert pour les boutiques de mode marocaines sur FashionAura.
Tu analyses les données de vente, stocks, vues et avis pour donner des recommandations actionnables.
Sois concret, bienveillant et orienté business (réapprovisionnement, prix, promotions, catalogue).

{$langRule}

Réponds UNIQUEMENT en JSON avec cette structure exacte (tous les textes dans la langue demandée ci-dessus) :
{
  "summary": "2-3 phrases de synthèse",
  "strengths": ["point fort 1", "point fort 2"],
  "weaknesses": ["point faible 1", "point faible 2"],
  "monthly_focus": "priorité du mois en une phrase",
  "best_products_note": "commentaire sur les meilleures ventes",
  "worst_products_note": "commentaire sur les produits à améliorer",
  "recommendations": [
    {
      "type": "restock|price|promotion|catalog|conversion",
      "priority": "high|medium|low",
      "title": "titre court",
      "description": "explication 1-2 phrases",
      "action": "libellé bouton"
    }
  ]
}
PROMPT;
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function userPrompt(array $context, string $locale = 'fr'): string
    {
        $intro = match (LocaleHelper::normalize($locale)) {
            'en' => 'Analyze the boutique',
            'es' => 'Analiza la boutique',
            'ar' => 'حلّل المتجر',
            default => 'Analyse la boutique',
        };

        $stats = $context['stats'];
        $top = collect($context['top_products'])->map(fn ($p) => "- {$p['name']}: {$p['purchases']} achats, {$p['views']} vues, {$p['revenue']} MAD")->implode("\n");
        $worst = collect($context['worst_products'])->map(fn ($p) => "- {$p['name']}: conversion {$p['conversion']}%, stock {$p['stock']}")->implode("\n");
        $lowStock = implode(', ', $context['low_stock_names'] ?: ['aucun']);

        return <<<PROMPT
{$intro} "{$context['boutique_name']}" ({$context['city']}) sur la période : {$context['period_label']}.

Chiffres clés :
- Produits actifs : {$stats['total_products']}
- Vues catalogue : {$stats['total_views']}
- Commandes (analytics) : {$stats['total_orders']}
- Chiffre d'affaires analytics : {$stats['analytics_revenue']} MAD
- Chiffre d'affaires commandes : {$stats['orders_revenue']} MAD
- Note moyenne : {$stats['average_rating']}/5
- Stock faible (seuil {$context['threshold']}) : {$stats['low_stock']} produits
- Ruptures : {$stats['out_of_stock']} produits

Top ventes :
{$top}

Produits à conversion faible :
{$worst}

Produits en stock bas ou rupture : {$lowStock}

Donne 4 à 6 recommandations priorisées pour ce magasinier.
PROMPT;
    }

    /**
     * @param  array<int, mixed>  $items
     * @return array<int, array<string, string>>
     */
    private function normalizeAiRecommendations(array $items): array
    {
        $allowedTypes = ['restock', 'price', 'promotion', 'catalog', 'conversion', 'stock'];
        $allowedPriority = ['high', 'medium', 'low'];

        return collect($items)->map(function ($rec) use ($allowedTypes, $allowedPriority) {
            if (! is_array($rec)) {
                return null;
            }

            $type = in_array($rec['type'] ?? '', $allowedTypes, true) ? $rec['type'] : 'catalog';
            if ($type === 'stock') {
                $type = 'restock';
            }

            return [
                'type' => $type,
                'priority' => in_array($rec['priority'] ?? '', $allowedPriority, true) ? $rec['priority'] : 'medium',
                'title' => (string) ($rec['title'] ?? 'Recommandation'),
                'description' => (string) ($rec['description'] ?? $rec['message'] ?? ''),
                'action' => (string) ($rec['action'] ?? 'Voir'),
                'source' => 'gemini',
            ];
        })->filter()->values()->all();
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    private function fallbackAnalysis(array $context): array
    {
        $stats = $context['stats'];
        $recs = [];

        if ($stats['out_of_stock'] > 0) {
            $recs[] = [
                'type' => 'restock',
                'priority' => 'high',
                'title' => 'Ruptures à combler',
                'description' => "{$stats['out_of_stock']} produit(s) en rupture — réapprovisionnez pour ne pas perdre de ventes.",
                'action' => 'Gérer les stocks',
                'source' => 'rules',
            ];
        }

        if ($stats['low_stock'] > 0) {
            $recs[] = [
                'type' => 'restock',
                'priority' => 'medium',
                'title' => 'Stocks faibles',
                'description' => "{$stats['low_stock']} produit(s) sous le seuil d'alerte.",
                'action' => 'Voir les produits',
                'source' => 'rules',
            ];
        }

        if (! empty($context['worst_products'])) {
            $name = $context['worst_products'][0]['name'] ?? 'un produit';
            $recs[] = [
                'type' => 'conversion',
                'priority' => 'medium',
                'title' => 'Améliorer la fiche produit',
                'description' => "\"{$name}\" attire des vues mais peu d'achats — photos, description ou prix à revoir.",
                'action' => 'Modifier le produit',
                'source' => 'rules',
            ];
        }

        return [
            'summary' => "Synthèse automatique pour {$context['boutique_name']} ({$context['period_label']}).",
            'strengths' => $stats['total_orders'] > 0
                ? ['Des ventes enregistrées sur la période', 'Catalogue actif avec '.$stats['total_products'].' produits']
                : ['Catalogue en ligne disponible'],
            'weaknesses' => array_values(array_filter([
                $stats['out_of_stock'] > 0 ? 'Ruptures de stock' : null,
                $stats['average_rating'] < 4 ? 'Note clients à améliorer' : null,
            ])),
            'monthly_focus' => $stats['out_of_stock'] > 0
                ? 'Priorité : réapprovisionner les ruptures.'
                : 'Priorité : booster les produits les plus vus.',
            'recommendations' => $recs,
        ];
    }
}
