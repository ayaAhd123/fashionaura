<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Boutique;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChatbotController extends Controller
{
  public function chat(Request $request)
  {
    $request->validate([
      'message' => 'nullable|string|max:500',
      'history' => 'array',
      'image' => 'nullable|string',
    ]);

    $message = trim($request->message ?? '');
    $maxBudget = $this->extractBudget($message);
    $matches = $this->searchCatalog($message, $maxBudget);

    $catalogSummary = $this->buildCatalogSummary();
    $matchesText = $this->formatMatchesForPrompt($matches);

    $systemPrompt = "
Tu es FashionBot, le styliste IA de FashionAura (mode marocaine).

### TES MISSIONS
1. Conseiller selon l'occasion (mariage, soirée, bureau, casual...)
2. Recommander des boutiques et produits RÉELS du catalogue ci-dessous
3. Respecter le budget de l'utilisateur si mentionné
4. Analyser les photos de tenues et proposer des pièces similaires du catalogue
5. Répondre dans la langue de l'utilisateur

### CATALOGUE FASHIONAURA (boutiques + produits réels)
{$catalogSummary}

### CORRESPONDANCES TROUVÉES POUR CETTE DEMANDE
{$matchesText}

### RÈGLES IMPORTANTES
- Recommande UNIQUEMENT des boutiques/produits du catalogue
- Pour un mariage marocain → privilégie caftans, robes brodées, tenues traditionnelles
- Mentionne le nom de la boutique, la ville et le prix en DH
- Si des correspondances sont listées ci-dessus, cite-les en priorité
- Réponse courte (4-5 lignes max), chaleureuse, termine par une question
";

    $apiKey = env('GEMINI_API_KEY');
    if (!$apiKey) {
      return response()->json([
        'reply' => "Je suis prêt à vous conseiller ! Voici ce que j'ai trouvé dans nos boutiques :",
        'suggestions' => $matches,
      ]);
    }

    $contents = [];
    foreach ($request->history ?? [] as $msg) {
      $contents[] = [
        'parts' => [['text' => $msg['text']]],
        'role' => ($msg['role'] ?? '') === 'user' ? 'user' : 'model',
      ];
    }

    $parts = [];
    $parts[] = ['text' => $message ?: 'Analyse cette tenue et propose des boutiques ou produits du catalogue FashionAura.'];

    if ($request->filled('image')) {
      [$mimeType, $imageData] = $this->parseImage($request->image);
      if ($imageData) {
        $parts[] = [
          'inlineData' => [
            'mimeType' => $mimeType,
            'data' => $imageData,
          ],
        ];
      }
    }

    $contents[] = ['parts' => $parts, 'role' => 'user'];

    $payload = [
      'contents' => $contents,
      'system_instruction' => [
        'parts' => [['text' => $systemPrompt]],
      ],
    ];

    try {
      $reply = $this->callGemini($apiKey, $payload);
    } catch (\Throwable $e) {
      $reply = "Voici mes recommandations basées sur nos boutiques FashionAura :";
    }

    return response()->json([
      'reply' => $reply,
      'suggestions' => $matches,
    ]);
  }

  private function buildCatalogSummary(): string
  {
    $boutiques = Boutique::with(['city:id,name', 'products' => fn($q) => $q->where('is_active', true)])
      ->where('is_active', true)
      ->get();

    $lines = [];
    foreach ($boutiques as $boutique) {
      $city = $boutique->city->name ?? 'Maroc';
      $lines[] = "BOUTIQUE: {$boutique->name} (slug: {$boutique->slug}) — {$city} — {$boutique->description}";

      foreach ($boutique->products as $product) {
        $price = $product->discount_price ?? $product->price;
        $lines[] = "  → {$product->name} (slug: {$product->slug}) — {$price} DH — style: {$product->style} — {$product->description}";
      }
    }

    return implode("\n", $lines);
  }

  private function searchCatalog(string $message, ?float $maxBudget = null): array
  {
    $keywords = $this->extractKeywords($message);
    $messageLower = Str::lower($message);
    $citySlug = $this->extractCitySlug($messageLower);

    $productQuery = Product::query()
      ->where('is_active', true)
      ->with([
        'boutique:id,name,slug,city_id',
        'boutique.city:id,name,slug',
        'category:id,name,slug',
        'images:id,product_id,image_url,is_primary',
      ]);

    if ($citySlug) {
      $productQuery->whereHas('boutique.city', fn($q) => $q->where('slug', $citySlug));
    }

    if ($keywords) {
      $productQuery->where(function ($q) use ($keywords) {
        foreach ($keywords as $keyword) {
          $q->orWhere('name', 'like', "%{$keyword}%")
            ->orWhere('description', 'like', "%{$keyword}%")
            ->orWhere('style', 'like', "%{$keyword}%");
        }
      });
    }

    if ($maxBudget) {
      $productQuery->where(function ($q) use ($maxBudget) {
        $q->where('price', '<=', $maxBudget)
          ->orWhere('discount_price', '<=', $maxBudget);
      });
    }

    if (Str::contains($messageLower, ['mariage', 'marocain', 'tradition'])) {
      $productQuery->where(function ($q) {
        $q->where('name', 'like', '%caftan%')
          ->orWhere('name', 'like', '%brod%')
          ->orWhere('description', 'like', '%mariage%')
          ->orWhere('description', 'like', '%tradition%');
      });
    }

    $products = $productQuery->limit(6)->get();

    if ($products->isEmpty() && $citySlug) {
      $products = Product::where('is_active', true)
        ->whereHas('boutique.city', fn($q) => $q->where('slug', $citySlug))
        ->with(['boutique.city', 'category', 'images'])
        ->limit(6)
        ->get();
    }

    if ($products->isEmpty() && $keywords) {
      $products = Product::where('is_active', true)
        ->with(['boutique.city', 'category', 'images'])
        ->limit(4)
        ->get();
    }

    $suggestions = [];
    $seenBoutiques = [];

    foreach ($products as $product) {
      $price = $product->discount_price ?? $product->price;
      $image = $product->images->firstWhere('is_primary', true)?->image_url
        ?? $product->images->first()?->image_url;

      $suggestions[] = [
        'type' => 'product',
        'name' => $product->name,
        'slug' => $product->slug,
        'price' => $price,
        'boutique_name' => $product->boutique->name ?? '',
        'boutique_slug' => $product->boutique->slug ?? '',
        'city' => $product->boutique->city->name ?? '',
        'image' => $image,
        'url' => "/products/{$product->slug}",
      ];

      $boutique = $product->boutique;
      if ($boutique && !isset($seenBoutiques[$boutique->id])) {
        $seenBoutiques[$boutique->id] = true;
      }
    }

    $boutiqueQuery = Boutique::with('city:id,name,slug')
      ->where('is_active', true);

    if ($keywords) {
      $boutiqueQuery->where(function ($q) use ($keywords) {
        foreach ($keywords as $keyword) {
          $q->orWhere('name', 'like', "%{$keyword}%")
            ->orWhere('description', 'like', "%{$keyword}%")
            ->orWhere('category', 'like', "%{$keyword}%");
        }
      });
    }

    if ($citySlug) {
      $boutiqueQuery->whereHas('city', fn($q) => $q->where('slug', $citySlug));
    }

    foreach ($boutiqueQuery->limit(3)->get() as $boutique) {
      if (isset($seenBoutiques[$boutique->id])) {
        continue;
      }
      $suggestions[] = [
        'type' => 'boutique',
        'name' => $boutique->name,
        'slug' => $boutique->slug,
        'price' => null,
        'boutique_name' => $boutique->name,
        'boutique_slug' => $boutique->slug,
        'city' => $boutique->city->name ?? '',
        'image' => $boutique->logo,
        'url' => "/boutiques/{$boutique->slug}",
      ];
    }

    return array_slice($suggestions, 0, 6);
  }

  private function extractKeywords(string $message): array
  {
    $message = Str::lower($message);
    $map = [
      'mariage' => ['mariage', 'caftan', 'brod', 'tradition'],
      'caftan' => ['caftan'],
      'robe' => ['robe'],
      'soirée' => ['soir', 'luxe', 'luxury'],
      'cadeau' => ['cadeau', 'gift'],
      'tanger' => ['tanger'],
      'casablanca' => ['casablanca', 'casa'],
      'marrakech' => ['marrakech'],
      'rabat' => ['rabat'],
      'fès' => ['fes', 'fès'],
      'homme' => ['homme', 'blazer', 'chemise'],
      'femme' => ['femme', 'robe', 'jupe'],
    ];

    $found = [];
    foreach ($map as $terms) {
      foreach ($terms as $term) {
        if (Str::contains($message, $term)) {
          $found[] = $term;
        }
      }
    }

    if (preg_match_all('/\b[a-zàâçéèêëîïôùûü]{4,}\b/u', $message, $matches)) {
      foreach ($matches[0] as $word) {
        if (!in_array($word, ['pour', 'avec', 'dans', 'chez', 'une', 'des', 'les'], true)) {
          $found[] = $word;
        }
      }
    }

    return array_values(array_unique($found));
  }

  private function extractCitySlug(string $message): ?string
  {
    $cities = [
      'tanger' => 'tanger',
      'casablanca' => 'casablanca',
      'casa' => 'casablanca',
      'marrakech' => 'marrakech',
      'rabat' => 'rabat',
      'fes' => 'fes',
      'fès' => 'fes',
      'agadir' => 'agadir',
      'meknes' => 'meknes',
      'meknès' => 'meknes',
    ];

    foreach ($cities as $term => $slug) {
      if (Str::contains($message, $term)) {
        return $slug;
      }
    }

    return null;
  }

  private function extractBudget(string $message): ?float
  {
    if (preg_match('/(?:budget|moins de|max|maximum|jusqu[\'a]?)\s*(\d+)/iu', $message, $m)) {
      return (float) $m[1];
    }
    if (preg_match('/(\d+)\s*(?:dh|mad|dirham)/iu', $message, $m)) {
      return (float) $m[1];
    }
    return null;
  }

  private function formatMatchesForPrompt(array $matches): string
  {
    if (empty($matches)) {
      return 'Aucune correspondance exacte — propose les boutiques les plus adaptées au contexte.';
    }

    return collect($matches)->map(function ($item) {
      $price = $item['price'] ? " — {$item['price']} DH" : '';
      return "- {$item['name']} ({$item['type']}) — {$item['boutique_name']}, {$item['city']}{$price} — lien: {$item['url']}";
    })->implode("\n");
  }

  private function parseImage(string $imageData): array
  {
    $mimeType = 'image/jpeg';
    if (str_contains($imageData, ',')) {
      [$meta, $imageData] = explode(',', $imageData, 2);
      preg_match('/data:(.*?);/', $meta, $matches);
      $mimeType = $matches[1] ?? 'image/jpeg';
    }
    $imageData = preg_replace('/[^a-zA-Z0-9\/\+=]/', '', $imageData);
    return [$mimeType, $imageData];
  }

  private function callGemini(string $apiKey, array $payload): string
  {
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=' . $apiKey;

    $ch = curl_init();
    curl_setopt_array($ch, [
      CURLOPT_URL => $url,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_POST => true,
      CURLOPT_POSTFIELDS => json_encode($payload),
      CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
      CURLOPT_TIMEOUT => 30,
      CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $responseBody = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
      throw new \RuntimeException("Gemini error {$httpCode}");
    }

    $response = json_decode($responseBody, true);
    return $response['candidates'][0]['content']['parts'][0]['text'] ?? "Voici mes recommandations pour vous !";
  }
}
