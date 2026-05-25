<?php

namespace App\Http\Controllers\Boutique;

use App\Http\Controllers\Controller;
use App\Support\LocaleHelper;
use App\Services\BoutiqueAIService;
use App\Services\GeminiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BoutiqueCopilotController extends Controller
{
    public function chat(Request $request, BoutiqueAIService $boutiqueAI, GeminiService $gemini)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'history' => 'array',
            'history.*.role' => 'string',
            'history.*.text' => 'string',
            'period' => 'nullable|string|in:7days,30days,90days',
            'locale' => 'nullable|string|max:5',
        ]);

        $locale = LocaleHelper::normalize($request->get('locale'));

        $user = Auth::user();
        $boutique = $user->boutique;
        if (! $boutique) {
            return response()->json(['message' => 'Aucune boutique associée'], 422);
        }

        $boutique->load('city:id,name');
        $period = $request->get('period', '30days');
        $context = $boutiqueAI->buildContext($boutique, $period);
        $message = trim($request->message);

        $dataBlock = $this->formatContextForPrompt($context);
        $systemPrompt = $this->merchantSystemPrompt($boutique->name, $context['period_label'], $dataBlock, $locale);

        if (! $gemini->isConfigured()) {
            return response()->json([
                'reply' => $this->fallbackReply($context, $message, $locale),
                'suggestions' => [],
            ]);
        }

        $history = collect($request->history ?? [])
            ->take(-8)
            ->map(fn ($m) => [
                'role' => ($m['role'] ?? '') === 'user' ? 'user' : 'model',
                'text' => (string) ($m['text'] ?? ''),
            ])
            ->filter(fn ($m) => $m['text'] !== '')
            ->values();

        try {
            $reply = $this->callWithHistory($gemini, $systemPrompt, $history, $message, $locale);

            return response()->json([
                'reply' => $reply,
                'suggestions' => [],
            ]);
        } catch (\Throwable $e) {
            $offline = match ($locale) {
                'en' => 'Offline mode: AI unavailable.',
                'es' => 'Modo sin conexión: IA no disponible.',
                'ar' => 'وضع عدم الاتصال: الذكاء الاصطناعي غير متاح.',
                default => 'Mode hors-ligne : IA indisponible.',
            };

            return response()->json([
                'reply' => $this->fallbackReply($context, $message, $locale)."\n\n_({$offline}".(config('app.debug') ? ' '.$e->getMessage() : '').')_',
                'suggestions' => [],
            ]);
        }
    }

    private function merchantSystemPrompt(string $boutiqueName, string $periodLabel, string $dataBlock, string $locale): string
    {
        $langRule = LocaleHelper::geminiLanguageRule($locale);

        return <<<PROMPT
Tu es le **Copilote Magasinier FashionAura** — assistant business pour le gérant de la boutique "{$boutiqueName}".
Tu n'es PAS un styliste client. Tu n'aides pas les acheteurs à choisir une tenue.

{$langRule}

### Ton rôle
- Analyser ventes, stocks, conversions et avis de SA boutique uniquement
- Proposer des actions concrètes : réapprovisionnement, prix, promotions, fiches produits, priorisation du mois
- Ton professionnel et bienveillant (2-6 phrases, listes à puces si utile)
- Citer des **noms de produits réels** issus des données ci-dessous

### Interdictions
- Pas de conseils mode pour clients finaux (mariage, couleurs à porter, etc.)
- Ne recommande pas d'autres boutiques FashionAura
- Pas de blabla marketing vague

### Liens utiles (à mentionner si pertinent)
- Stocks / produits : /boutique/products
- Alertes stock : /boutique/notifications
- Rapport IA : /boutique/ai-advisor

### Données boutique ({$periodLabel})
{$dataBlock}
PROMPT;
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function formatContextForPrompt(array $context): string
    {
        $stats = $context['stats'];
        $lines = [
            "Boutique : {$context['boutique_name']} ({$context['city']})",
            "Seuil alerte stock : {$context['threshold']} unités",
            "Produits actifs : {$stats['total_products']}",
            "Vues : {$stats['total_views']} | Commandes : {$stats['total_orders']}",
            "CA analytics : {$stats['analytics_revenue']} MAD | CA commandes : {$stats['orders_revenue']} MAD",
            "Note moyenne : {$stats['average_rating']}/5",
            "Stock faible : {$stats['low_stock']} | Ruptures : {$stats['out_of_stock']}",
        ];

        if (! empty($context['top_products'])) {
            $lines[] = "\nTop ventes :";
            foreach ($context['top_products'] as $p) {
                $lines[] = "- {$p['name']} : {$p['purchases']} achats, {$p['views']} vues, stock {$p['stock']}";
            }
        }

        if (! empty($context['worst_products'])) {
            $lines[] = "\nConversion faible :";
            foreach ($context['worst_products'] as $p) {
                $lines[] = "- {$p['name']} : {$p['conversion']}% conversion, stock {$p['stock']}";
            }
        }

        if (! empty($context['low_stock_names'])) {
            $lines[] = "\nAlertes stock : ".implode(', ', $context['low_stock_names']);
        }

        return implode("\n", $lines);
    }

    /**
     * @param  \Illuminate\Support\Collection<int, array{role: string, text: string}>  $history
     */
    private function callWithHistory(GeminiService $gemini, string $systemPrompt, $history, string $message, string $locale = 'fr'): string
    {
        $apiKey = $gemini->apiKey();
        $model = config('fashionaura.gemini_model', 'gemini-flash-lite-latest');
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        $contents = [];
        foreach ($history as $msg) {
            $contents[] = [
                'parts' => [['text' => $msg['text']]],
                'role' => $msg['role'],
            ];
        }
        $contents[] = [
            'parts' => [['text' => $message]],
            'role' => 'user',
        ];

        $payload = [
            'contents' => $contents,
            'system_instruction' => [
                'parts' => [['text' => $systemPrompt]],
            ],
        ];

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT => (int) config('fashionaura.gemini_timeout', 45),
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $responseBody = curl_exec($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new \RuntimeException("Gemini HTTP {$httpCode}");
        }

        $response = json_decode((string) $responseBody, true);

        return $response['candidates'][0]['content']['parts'][0]['text'] ?? match (LocaleHelper::normalize($locale)) {
            'en' => 'I could not generate a response.',
            'es' => 'No pude generar una respuesta.',
            'ar' => 'تعذر إنشاء رد.',
            default => 'Je n\'ai pas pu générer de réponse.',
        };
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function fallbackReply(array $context, string $message, string $locale = 'fr'): string
    {
        $locale = LocaleHelper::normalize($locale);
        $stats = $context['stats'];
        $lower = mb_strtolower($message);
        $top = $context['top_products'][0]['name'] ?? '';

        $stockKeywords = ['stock', 'rupture', 'ruptura', 'inventory', 'مخزون', 'stock'];
        $salesKeywords = ['vente', 'vendre', 'sales', 'sell', 'ventas', 'vender', 'مبيعات', 'بيع'];

        $isStock = false;
        $isSales = false;
        foreach ($stockKeywords as $kw) {
            if (str_contains($lower, $kw)) {
                $isStock = true;
                break;
            }
        }
        foreach ($salesKeywords as $kw) {
            if (str_contains($lower, $kw)) {
                $isSales = true;
                break;
            }
        }

        if ($isStock) {
            return match ($locale) {
                'en' => "For {$context['period_label']}: {$stats['out_of_stock']} out-of-stock item(s) and {$stats['low_stock']} below threshold ({$context['threshold']} units). Check /boutique/products and /boutique/notifications.",
                'es' => "En {$context['period_label']}: {$stats['out_of_stock']} ruptura(s) y {$stats['low_stock']} producto(s) bajo el umbral ({$context['threshold']} u.). Consulte /boutique/products y /boutique/notifications.",
                'ar' => "خلال {$context['period_label']}: {$stats['out_of_stock']} نفاد و {$stats['low_stock']} منتج(ات) تحت عتبة {$context['threshold']}. راجع /boutique/products و /boutique/notifications.",
                default => "Sur {$context['period_label']} : {$stats['out_of_stock']} rupture(s) et {$stats['low_stock']} produit(s) sous le seuil ({$context['threshold']} u.). Consultez /boutique/products et /boutique/notifications.",
            };
        }

        if ($isSales) {
            $product = $top ?: match ($locale) {
                'en' => 'your best sellers',
                'es' => 'sus más vendidos',
                'ar' => 'الأكثر مبيعاً',
                default => 'vos best-sellers',
            };

            return match ($locale) {
                'en' => "To boost sales next month: secure stock for « {$product} », improve low-conversion listings, and run a targeted promo. Full report: /boutique/ai-advisor.",
                'es' => "Para aumentar ventas el próximo mes: asegure stock de « {$product} », mejore fichas con baja conversión y lance una promo. Informe: /boutique/ai-advisor.",
                'ar' => "لزيادة المبيعات الشهر القادم: وفّر مخزون « {$product} »، حسّن المنتجات ضعيفة التحويل، وأطلق عرضاً. التقرير: /boutique/ai-advisor.",
                default => "Pour booster les ventes le mois prochain : sécurisez le stock de « {$product} », améliorez les fiches à faible conversion, et lancez une promo. Rapport : /boutique/ai-advisor.",
            };
        }

        return match ($locale) {
            'en' => "Copilot {$context['boutique_name']}: {$stats['total_products']} active products, {$stats['out_of_stock']} out of stock. Ask about stock, sales, pricing or promos — or open /boutique/ai-advisor.",
            'es' => "Copiloto {$context['boutique_name']}: {$stats['total_products']} productos activos, {$stats['out_of_stock']} sin stock. Pregunte por stock, ventas, precios o promos — o /boutique/ai-advisor.",
            'ar' => "مساعد {$context['boutique_name']}: {$stats['total_products']} منتج نشط، {$stats['out_of_stock']} نفاد. اسأل عن المخزون أو المبيعات أو /boutique/ai-advisor.",
            default => "Copilote {$context['boutique_name']} : {$stats['total_products']} produits actifs, {$stats['out_of_stock']} rupture(s). Posez une question sur stocks, ventes, prix ou promos — ou /boutique/ai-advisor.",
        };
    }
}
