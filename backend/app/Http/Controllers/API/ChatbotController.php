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
      'context' => 'nullable|array',
      'context.city' => 'nullable|string|max:50',
      'context.cityName' => 'nullable|string|max:100',
    ]);

    $message = trim($request->message ?? '');
    $hasImage = $request->filled('image');
    $history = $request->history ?? [];
    $maxBudget = $this->extractBudget($message);
    $contextCity = data_get($request->input('context'), 'city');
    $contextCityName = data_get($request->input('context'), 'cityName');
    $messageLower = Str::lower($message);

    $wantsSuggestions = $this->wantsCatalogSuggestions($message, $hasImage, $history);
    $catalogCitySlug = null;
    if ($wantsSuggestions) {
      $catalogCitySlug = $this->extractCitySlug($messageLower)
        ?? $this->normalizeCitySlug($contextCity);
    }

    $matches = $wantsSuggestions
      ? $this->searchCatalog($message, $maxBudget, $catalogCitySlug)
      : [];

    $catalogSummary = $wantsSuggestions ? $this->buildCatalogSummary($catalogCitySlug) : '';
    $matchesText = $this->formatMatchesForPrompt($matches);

    $contextBlock = '';
    if ($contextCityName) {
      $contextBlock = "\n### CONTEXTE NAVIGATION\nL'utilisateur consulte la page de {$contextCityName}. Tu peux t'en inspirer pour personnaliser tes conseils, sans citer de boutique tant qu'il ne le demande pas.\n";
    }

    if ($wantsSuggestions) {
      $systemPrompt = "
Tu es FashionBot, le styliste IA de FashionAura (mode marocaine).
{$contextBlock}

### MODE ACTUEL : RECOMMANDATION BOUTIQUES
L'utilisateur souhaite voir des boutiques ou produits concrets.

### CATALOGUE FASHIONAURA
{$catalogSummary}

### CORRESPONDANCES POUR CETTE DEMANDE
{$matchesText}

### RÈGLES
- Recommande UNIQUEMENT des boutiques/produits du catalogue ci-dessus
- Cite le nom, la ville et le prix en DH si disponible
- Réponse concise (4-6 lignes), chaleureuse
- Termine en invitant à cliquer sur les cartes ci-dessous ou à poser une autre question
";
    } else {
      $imageBlock = $hasImage
        ? "\n- Une photo a été envoyée : analyse le style, les couleurs, la coupe et l'occasion probable. Donne des conseils personnalisés sans citer de boutiques.\n"
        : '';

      $systemPrompt = "
Tu es FashionBot, le styliste IA de FashionAura (mode marocaine).
{$contextBlock}

### MODE ACTUEL : CONSEIL & CONVERSATION
L'utilisateur veut des conseils mode, pas encore une liste de boutiques.
{$imageBlock}

### TON RÔLE
1. Conseiller comme un vrai styliste : couleurs, coupes, matières, occasions (mariage, soirée, bureau, casual...)
2. Parler de la mode marocaine avec culture (caftan, broderie, takchita, fusion moderne...)
3. Poser 1 question de suivi pour affiner (occasion, budget approximatif, style préféré, saison...)
4. Adapter ton ton : chaleureux, expert, naturel — comme une vraie conversation

### RÈGLES STRICTES
- NE cite AUCUN nom de boutique ni produit du catalogue pour l'instant
- NE propose PAS de liens ni de redirections
- Donne des conseils concrets et personnalisés (3-6 phrases)
- Termine par UNE question ou propose doucement : « Souhaitez-vous que je vous montre des boutiques adaptées sur FashionAura ? »
- Réponds dans la langue de l'utilisateur
";
    }

    $apiKey = env('GEMINI_API_KEY');
    if (!$apiKey) {
      return response()->json([
        'reply' => $wantsSuggestions
          ? 'Voici ce que j\'ai trouvé dans nos boutiques FashionAura :'
          : $this->fallbackAdviceReply($message, $contextCityName),
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
    $parts[] = ['text' => $message ?: ($hasImage
      ? 'Analyse cette tenue et donne-moi des conseils style. Propose des boutiques seulement si tu identifies une pièce précise à chercher.'
      : 'Bonjour')];

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
      $reply = $wantsSuggestions
        ? 'Voici mes recommandations basées sur nos boutiques FashionAura :'
        : $this->fallbackAdviceReply($message, $contextCityName);
    }

    return response()->json([
      'reply' => $reply,
      'suggestions' => $wantsSuggestions ? $matches : [],
    ]);
  }

  private function wantsCatalogSuggestions(string $message, bool $hasImage, array $history): bool
  {
    if ($hasImage) {
      return $this->messageImpliesShopping($message);
    }

    if ($this->messageImpliesShopping($message)) {
      return true;
    }

  if ($this->userConfirmsSuggestions($message, $history)) {
      return true;
    }

    return false;
  }

  private function messageImpliesShopping(string $message): bool
  {
    $messageLower = Str::lower(trim($message));
    if ($messageLower === '') {
      return false;
    }

    $shoppingTerms = [
      'boutique', 'boutiques', 'acheter', 'achat', 'commander', 'produit', 'produits',
      'catalogue', 'trouve', 'trouver', 'cherche', 'chercher', 'montre', 'montrer',
      'recommande', 'recommander', 'suggère', 'suggerer', 'suggere',
      'où acheter', 'ou acheter', 'chez qui', 'livraison', 'meilleur', 'meilleures',
      'top ', 'classement', 'partenaire', 'shop', 'store', 'buy', 'find', 'recommend',
      'show me', 'where can i', 'tienda', 'comprar', 'tiendas',
      'متجر', 'متاجر', 'أين أشتري', 'اقترح', 'boutiques à', 'boutiques a',
    ];

    foreach ($shoppingTerms as $term) {
      if (Str::contains($messageLower, $term)) {
        return true;
      }
    }

    return false;
  }

  private function userConfirmsSuggestions(string $message, array $history): bool
  {
    $messageLower = Str::lower(trim($message));
    if (Str::length($messageLower) > 40) {
      return false;
    }

    $confirmTerms = ['oui', 'yes', 'ok', 'okay', 'd\'accord', 'daccord', 'vas-y', 'vas y', 'allez', 'montre', 'montrez', 'please', 'si', 'sí', 'نعم', 'أجل'];
    $hasConfirm = false;
    foreach ($confirmTerms as $term) {
      if (Str::contains($messageLower, $term)) {
        $hasConfirm = true;
        break;
      }
    }

    if (! $hasConfirm) {
      return false;
    }

    $lastBot = collect($history)->reverse()->first(fn ($msg) => ($msg['role'] ?? '') !== 'user');
    if (! $lastBot) {
      return false;
    }

    $botText = Str::lower($lastBot['text'] ?? '');

    return Str::contains($botText, [
      'boutique', 'boutiques', 'catalogue', 'produit', 'produits', 'fashionaura',
      'montre', 'montrer', 'recommand', 'shop', 'store',
    ]);
  }

  private function fallbackAdviceReply(string $message, ?string $cityName): string
  {
    $messageLower = Str::lower($message);
    $cityHint = $cityName ? " à {$cityName}" : '';

    if (Str::contains($messageLower, ['mariage', 'caftan', 'tradition'])) {
      return "Pour un mariage marocain, misez sur un caftan ou une takchita aux broderies fines — doré, argenté ou ton terre selon l'heure de la fête. Accessoires : ceinture sfifa, babouches assorties, bijoux discrets. Quel style préférez-vous : classique ou moderne ? Dites-moi si vous souhaitez voir des boutiques{$cityHint}.";
    }

    if (Str::contains($messageLower, ['soir', 'luxe', 'luxury', 'gala'])) {
      return "Pour une soirée élégante, privilégiez une silhouette fluide : robe longue, ensemble satiné ou caftan revisité. Couleurs profondes (bordeaux, émeraude, noir) avec une touche dorée. Quelle est l'occasion exacte ? Je peux ensuite vous proposer des boutiques{$cityHint}.";
    }

    return "Je suis là pour vous conseiller en mode marocaine : couleurs, coupes, occasions, tendances… Décrivez-moi l'occasion ou le look recherché, et je vous guide. Quand vous le souhaitez, demandez-moi de vous montrer des boutiques{$cityHint} sur FashionAura.";
  }

  private function buildCatalogSummary(?string $citySlug = null): string
  {
    $boutiquesQuery = Boutique::with(['city:id,name', 'products' => fn ($q) => $q->where('is_active', true)])
      ->where('is_active', true);

    if ($citySlug) {
      $boutiquesQuery->whereHas('city', fn ($q) => $q->where('slug', $citySlug));
    }

    $boutiques = $boutiquesQuery->get();

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

  private function searchCatalog(string $message, ?float $maxBudget = null, ?string $forcedCitySlug = null): array
  {
    $keywords = $this->extractKeywords($message);
    $messageLower = Str::lower($message);
    $citySlug = $forcedCitySlug ?? $this->extractCitySlug($messageLower);

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

    if ($products->isEmpty() && $citySlug && ($keywords || $this->messageImpliesShopping($message))) {
      $products = Product::where('is_active', true)
        ->whereHas('boutique.city', fn ($q) => $q->where('slug', $citySlug))
        ->with(['boutique.city', 'category', 'images'])
        ->limit(6)
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
      'mariage' => ['mariage', 'caftan', 'brod', 'tradition', 'takchita', 'henna', 'mariée', 'mariee', 'invité', 'invite', 'sfifa'],
      'caftan' => ['caftan', 'takchita', 'gandoura'],
      'robe' => ['robe', 'soirée', 'soiree'],
      'soirée' => ['soir', 'luxe', 'luxury', 'gala', 'satin'],
      'cadeau' => ['cadeau', 'gift', 'coffret', 'offrir'],
      'homme' => ['homme', 'blazer', 'chemise', 'costume', 'djellaba', 'qamis', 'babouche', 'masculin'],
      'accessoire' => ['accessoire', 'foulard', 'bijou', 'boucle', 'ceinture', 'sfifa', 'voile'],
      'été' => ['été', 'ete', 'plage', 'lin', 'sandale', 'casual'],
      'bureau' => ['bureau', 'executive', 'tailleur', 'professionnel'],
      'tanger' => ['tanger', 'tangerois', 'détroit', 'detroit', 'malabata', 'azulejos'],
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
      'oujda' => 'oujda',
    ];

    foreach ($cities as $term => $slug) {
      if (Str::contains($message, $term)) {
        return $slug;
      }
    }

    return null;
  }

  private function normalizeCitySlug(?string $slug): ?string
  {
    if (! $slug) {
      return null;
    }

    $slug = Str::lower(trim($slug));

    return match ($slug) {
      'casa' => 'casablanca',
      'fès', 'fez' => 'fes',
      'meknès' => 'meknes',
      default => $slug,
    };
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
      return 'Aucune correspondance exacte — propose les options les plus proches du catalogue si tu es en mode recommandation.';
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
