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
      ? $this->searchCatalog($message, $maxBudget, $catalogCitySlug, $hasImage)
      : [];

    if ($wantsSuggestions) {
      return response()->json([
        'reply' => $this->buildShoppingReply($matches, $contextCityName, $message),
        'suggestions' => $matches,
      ]);
    }

    $replyLang = $this->detectReplyLanguage($message);
    $langRule = match ($replyLang) {
      'darija' => 'Réponds UNIQUEMENT en darija marocaine (même registre latin que l\'utilisateur). Même longueur que sa question, 1-2 phrases max.',
      'ar' => 'Réponds en arabe standard, court (1-2 phrases).',
      'en' => 'Reply in English, short (1-2 sentences).',
      default => 'Réponds en français, court (1-2 phrases max).',
    };

    $contextBlock = '';
    if ($contextCityName) {
      $contextBlock = "\nContexte : l'utilisateur est sur la page de {$contextCityName}.\n";
    }

    $imageBlock = $hasImage
      ? "Une photo est jointe : décris brièvement ce que tu vois si utile pour le conseil.\n"
      : '';

    $systemPrompt = "
Tu es FashionBot, styliste IA FashionAura (mode marocaine).
{$contextBlock}{$imageBlock}

MODE : CONSEIL UNIQUEMENT (pas de boutique, pas de lien, pas de redirection).

Règles :
- {$langRule}
- Réponds seulement à la question posée
- Pas de question de suivi sauf si indispensable
- Ne propose jamais de montrer des boutiques
";

    $apiKey = env('GEMINI_API_KEY');
    if (!$apiKey) {
      return response()->json([
        'reply' => $this->fallbackAdviceReply($message, $contextCityName, $replyLang),
        'suggestions' => [],
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
      ? 'Conseil style court sur cette tenue.'
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
      $reply = $this->fallbackAdviceReply($message, $contextCityName, $replyLang);
    }

    return response()->json([
      'reply' => $reply,
      'suggestions' => [],
    ]);
  }

  private function wantsCatalogSuggestions(string $message, bool $hasImage, array $history): bool
  {
    if ($this->messageLooksLikeProductHunt($message)) {
      return true;
    }

    if ($this->messageImpliesShopping($message) || $this->messageAsksAvailability($message)) {
      return true;
    }

    if ($this->userConfirmsSuggestions($message, $history)) {
      return true;
    }

    if ($hasImage && ! $this->messageImpliesAdviceOnly($message)) {
      return true;
    }

    if ($this->historyImpliesShopping($history) && $this->isShortShoppingFollowUp($message)) {
      return true;
    }

    return false;
  }

  private function buildShoppingReply(array $matches, ?string $cityName, string $message): string
  {
    $lang = $this->detectReplyLanguage($message);
    $city = $cityName ?: $this->resolveCityDisplayName($message);

    if (empty($matches)) {
      return match ($lang) {
        'darija' => $city ? "La, mazal ma l9ina f {$city}." : 'La, mazal ma l9ina. Gol liya lmudina.',
        'en' => $city ? "No matches in {$city} yet." : 'No matches yet.',
        default => $city ? "Non à {$city}." : 'Non pour l\'instant.',
      };
    }

    if (count($matches) === 1) {
      $item = $matches[0];
      $where = trim(($item['boutique_name'] ?? '') . ($item['city'] ? ", {$item['city']}" : ''));

      return match ($lang) {
        'darija' => $where !== ''
          ? "Ah kayn — {$item['name']} f {$where}."
          : "Ah kayn — {$item['name']}.",
        'en' => $where !== ''
          ? "Yes — {$item['name']} at {$where}."
          : "Yes — {$item['name']}.",
        default => $where !== ''
          ? "Oui — {$item['name']} chez {$where}."
          : "Oui — {$item['name']}.",
      };
    }

    $count = count($matches);

    return match ($lang) {
      'darija' => "Ah kayn — {$count} options lta7t.",
      'en' => "Yes — {$count} options below.",
      default => "Oui — {$count} options ci-dessous.",
    };
  }

  private function detectReplyLanguage(string $message): string
  {
    $messageLower = Str::lower(trim($message));

    if (preg_match('/\b(wx|wach)\s*(kayn|kyn|kayna|kina)\b/u', $messageLower)) {
      return 'darija';
    }

    $darijaMarkers = [
      'bghit', 'nghit', 'ghadi', 'ghda', 'daba', 'wach', 'fin ', 'f tanja', 'f tanger',
      'f casa', 'ch7al', 'kiswad', 'k7l', 'khal', 'milad', 'eid', 'them', 'eandi',
      'bghit nchri', 'nchri', 'nlqa', 'nlaqa', 'mzyan', 'zwin', 'haka', 'bzaaf',
    ];

    $score = 0;
    foreach ($darijaMarkers as $marker) {
      if (Str::contains($messageLower, $marker)) {
        $score++;
      }
    }

    if ($score >= 2) {
      return 'darija';
    }

    if (preg_match('/[\x{0600}-\x{06FF}]/u', $message)) {
      return 'ar';
    }

    if (preg_match('/\b(the|where|find|buy|looking|yes|no)\b/i', $message)) {
      return 'en';
    }

    return 'fr';
  }

  private function resolveCityDisplayName(string $message): ?string
  {
    $slug = $this->extractCitySlug(Str::lower($message));

    return match ($slug) {
      'tanger' => 'Tanger',
      'casablanca' => 'Casablanca',
      'marrakech' => 'Marrakech',
      'rabat' => 'Rabat',
      'fes' => 'Fès',
      'agadir' => 'Agadir',
      'meknes' => 'Meknès',
      'oujda' => 'Oujda',
      default => null,
    };
  }

  private function messageLooksLikeProductHunt(string $message): bool
  {
    $messageLower = Str::lower(trim($message));
    if ($messageLower === '') {
      return false;
    }

    $hasBudget = $this->extractBudget($message) !== null;
    $hasCity = $this->extractCitySlug($messageLower) !== null;
    $hasDarijaAvail = (bool) preg_match('/\b(wx|wach)\s*(kayn|kyn|kayna|kina)\b/u', $messageLower);
    $hasDarijaWant = Str::contains($messageLower, [
      'nghit', 'bghit', 'bghit nchri', 'nchri', 'nlqa', 'nlaqa', 'bghit nlqa', 'bghit nlaqa',
    ]);
    $hasItem = Str::contains($messageLower, [
      'dentelle', 'kiswad', 'k7l', 'khal', 'swad', 'robe', 'caftan', 'jupe', 'chemise',
      'tenue', 'look', 'noir', 'black', 'satin', 'brod',
    ]);

    if ($hasDarijaAvail) {
      return true;
    }

    if ($hasBudget && ($hasCity || $hasDarijaWant || $hasItem)) {
      return true;
    }

    if ($hasDarijaWant && ($hasCity || $hasItem || $hasBudget)) {
      return true;
    }

    return false;
  }

  private function messageAsksAvailability(string $message): bool
  {
    $messageLower = Str::lower(trim($message));
    if ($messageLower === '') {
      return false;
    }

    $patterns = [
      'y a-t-il', 'y a t il', 'est-ce qu\'il y a', 'est ce qu il y a',
      'il y a des', 'existe-t-il', 'existe t il', 'avez-vous', 'avez vous',
      'proposez-vous', 'proposez vous', 'are there', 'is there',
      'qui vend', 'qui vendent', 'qui propose', 'qui a ',
      'où trouver', 'ou trouver', 'où je peux', 'ou je peux',
      'où acheter', 'ou acheter', 'disponible', 'dispo',
      'wx kyn', 'wx kayn', 'wach kayn', 'wach kain', 'wach kyn', 'kayn chi', 'kyn chi',
      'kayna chi', 'wach kayna', 'fin nlqa', 'fin nlaqa',
    ];

    foreach ($patterns as $pattern) {
      if (Str::contains($messageLower, $pattern)) {
        return true;
      }
    }

    return Str::contains($messageLower, ['magasin', 'magasins', 'boutique', 'boutiques']);
  }

  private function messageImpliesAdviceOnly(string $message): bool
  {
    $messageLower = Str::lower(trim($message));
    if ($messageLower === '') {
      return false;
    }

    if ($this->messageImpliesShopping($message) || $this->messageAsksAvailability($message)) {
      return false;
    }

    $adviceTerms = [
      'conseil', 'conseils', 'conseille', 'conseiller', 'avis',
      'quelle couleur', 'quelles couleurs', 'comment porter', 'comment assortir',
      'qu\'en penses', 'qu en penses', 'ça me va', 'ca me va',
      'guide-moi', 'guide moi', 'idée look', 'idee look',
    ];

    foreach ($adviceTerms as $term) {
      if (Str::contains($messageLower, $term)) {
        return true;
      }
    }

    return false;
  }

  private function historyImpliesShopping(array $history): bool
  {
    foreach (array_reverse($history) as $msg) {
      if (($msg['role'] ?? '') !== 'user') {
        continue;
      }

      $text = $msg['text'] ?? '';
      if ($this->messageImpliesShopping($text) || $this->messageAsksAvailability($text) || $this->messageLooksLikeProductHunt($text)) {
        return true;
      }
    }

    return false;
  }

  private function isShortShoppingFollowUp(string $message): bool
  {
    $messageLower = Str::lower(trim($message));

    return Str::length($messageLower) <= 50;
  }

  private function messageImpliesShopping(string $message): bool
  {
    $messageLower = Str::lower(trim($message));
    if ($messageLower === '') {
      return false;
    }

    $shoppingTerms = [
      'boutique', 'boutiques', 'magasin', 'magasins', 'acheter', 'achat', 'commander',
      'produit', 'produits', 'catalogue', 'trouve', 'trouver', 'cherche', 'chercher',
      'montre', 'montrer', 'montrez', 'recommande', 'recommander', 'suggère', 'suggerer', 'suggere',
      'où acheter', 'ou acheter', 'chez qui', 'livraison', 'meilleur', 'meilleures',
      'top ', 'classement', 'partenaire', 'shop', 'store', 'buy', 'find', 'recommend',
      'show me', 'where can i', 'tienda', 'comprar', 'tiendas',
      'متجر', 'متاجر', 'أين أشتري', 'اقترح', 'boutiques à', 'boutiques a',
      'vend', 'vendent', 'vendre', 'pièce', 'piece', 'tenue', 'look', 'similaire', 'pareil',
      'comme ça', 'comme ca', 'redirection', 'redirige', 'envoie', 'envoyer',
      'nghit', 'bghit', 'nchri', 'bghit nchri', 'nlqa', 'nlaqa', 'bghit nlqa',
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

    $confirmTerms = ['oui', 'yes', 'ok', 'okay', 'iyeh', 'ah', 'ah ok', 'd\'accord', 'daccord', 'vas-y', 'vas y', 'allez', 'montre', 'montrez', 'please', 'si', 'sí', 'نعم', 'أجل'];
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

    if ($this->historyImpliesShopping($history)) {
      return true;
    }

    $lastBot = collect($history)->reverse()->first(fn ($msg) => ($msg['role'] ?? '') !== 'user');
    if (! $lastBot) {
      return false;
    }

    $botText = Str::lower($lastBot['text'] ?? '');

    return Str::contains($botText, [
      'boutique', 'boutiques', 'magasin', 'magasins', 'catalogue', 'produit', 'produits', 'fashionaura',
      'montre', 'montrer', 'recommand', 'shop', 'store', 'souhaitez-vous', 'souhaitez vous',
    ]);
  }

  private function fallbackAdviceReply(string $message, ?string $cityName, string $lang = 'fr'): string
  {
    $messageLower = Str::lower($message);

    if ($lang === 'darija') {
      if (Str::contains($messageLower, ['milad', 'eid', 'mariage', 'caftan'])) {
        return 'L eid/mariage: caftan wla takchita kbira, sfifa w babouches b lwan li t9bel m3a l occasion.';
      }
      if (Str::contains($messageLower, ['couleur', 'couleurs', 'lwan'])) {
        return 'Khtar lon wa7ed kbir w lon neutre — beige, k7l wla ivory.';
      }

      return 'Gol liya l occasion w chno bghiti tlbes — njawbek b ser3a.';
    }

    if (Str::contains($messageLower, ['mariage', 'caftan', 'tradition'])) {
      return 'Mariage marocain : caftan ou takchita brodée, ceinture sfifa et babouches assorties. Doré le jour, profond le soir.';
    }

    if (Str::contains($messageLower, ['soir', 'luxe', 'luxury', 'gala'])) {
      return 'Soirée : silhouette fluide, satin ou mousseline, bordeaux/émeraude/noir avec une touche dorée.';
    }

    if (Str::contains($messageLower, ['couleur', 'couleurs'])) {
      return 'Choisissez 1 couleur dominante + 1 neutre (beige, noir, ivoire). La sfifa ou les bijoux font l\'accord.';
    }

    return 'Décrivez l\'occasion ou la pièce recherchée — je réponds court.';
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

  private function searchCatalog(string $message, ?float $maxBudget = null, ?string $forcedCitySlug = null, bool $hasImage = false): array
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

    if ($products->isEmpty() && ($hasImage || $this->messageImpliesShopping($message) || $this->messageAsksAvailability($message) || $this->messageLooksLikeProductHunt($message))) {
      $fallbackQuery = Product::where('is_active', true)
        ->with(['boutique.city', 'category', 'images']);

      if ($citySlug) {
        $fallbackQuery->whereHas('boutique.city', fn ($q) => $q->where('slug', $citySlug));
      }

      $products = $fallbackQuery->limit(6)->get();
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
      'robe' => ['robe', 'soirée', 'soiree', 'kiswad', 'k7l', 'khal', 'swad', 'noir', 'black'],
      'dentelle' => ['dentelle', 'lace', 'dantel'],
      'soirée' => ['soir', 'luxe', 'luxury', 'gala', 'satin'],
      'cadeau' => ['cadeau', 'gift', 'coffret', 'offrir'],
      'homme' => ['homme', 'blazer', 'chemise', 'costume', 'djellaba', 'qamis', 'babouche', 'masculin'],
      'accessoire' => ['accessoire', 'foulard', 'bijou', 'boucle', 'ceinture', 'sfifa', 'voile'],
      'été' => ['été', 'ete', 'plage', 'lin', 'sandale', 'casual'],
      'bureau' => ['bureau', 'executive', 'tailleur', 'professionnel'],
      'tanger' => ['tanger', 'tanja', 'tangerois', 'détroit', 'detroit', 'malabata', 'azulejos'],
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
        if (!in_array($word, ['pour', 'avec', 'dans', 'chez', 'une', 'des', 'les', 'magasin', 'magasins', 'vendent', 'vend', 'vendre', 'est', 'qu\'il', 'quil', 'budget', 'eandi', 'ghda', 'them', 'milad', 'eid', 'wx', 'wach', 'kayn', 'kyn'], true)) {
          $found[] = $word;
        }
      }
    }

    return array_values(array_unique($found));
  }

  private function extractCitySlug(string $message): ?string
  {
    $cities = [
      'tanja' => 'tanger',
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
      'tanja' => 'tanger',
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
