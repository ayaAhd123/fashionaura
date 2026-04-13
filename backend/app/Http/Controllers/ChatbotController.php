<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\City;

class ChatbotController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'nullable|string|max:500',
            'history' => 'array',
            'image' => 'nullable|string',
        ]);

        $apiKey = env('GEMINI_API_KEY');

        $cities = City::with('boutiques')->get();
        $cityData = $cities->map(
            fn($c) => "{$c->name} ({$c->boutiques->count()} boutiques)"
        )->join(', ');

        $systemPrompt = "
Tu es FashionBot, le styliste IA de FashionAura, une plateforme de mode marocaine.

### TES 5 MISSIONS :
1. Conseiller des tenues selon l'occasion (mariage, soirée, bureau, casual...)
2. Orienter vers les boutiques FashionAura selon le style et le budget
3. Aider à trouver un cadeau en se basant sur la description de la personne
4. Répondre sur toutes questions de mode dans toutes les langues demandées
5. Analyser les photos de tenues envoyées et donner des conseils de style personnalisés

### VILLES DISPONIBLES SUR FASHIONAURA :
{$cityData}

### COMMENT RÉPONDRE :

Pour une OCCASION (mariage, soirée, etc.) :
- Demande d'abord : ville, budget, style préféré
- Propose 2-3 idées de tenues concrètes
- Termine par : 'Explore les boutiques de [ville] sur FashionAura ✨'

Pour une PHOTO de tenue :
- Analyse les couleurs, le style et les pièces vestimentaires
- Donne 2-3 conseils pour améliorer ou compléter la tenue
- Suggère des occasions où porter cette tenue
- Oriente vers les boutiques FashionAura si pertinent

Pour un CADEAU :
- Demande : description de la personne (style, âge, occasion) et budget
- Propose des idées de pièces précises
- Oriente vers la ville la plus proche

Pour les questions HORS MODE :
- Réponds : 'Je suis spécialisé en mode et style ! Pose-moi une question sur les tenues, boutiques ou cadeaux 😊'

### STYLE DE RÉPONSE :
- Répond dans la langue de la question
- Chaleureux et moderne
- Maximum 4-5 lignes par réponse
- Termine toujours par une question pour continuer la conversation
";

        $contents = [];
        $contents[] = ['parts' => [['text' => $systemPrompt]], 'role' => 'user'];
        $contents[] = ['parts' => [['text' => 'Compris ! Je suis FashionBot, prêt à aider 👗']], 'role' => 'model'];

        foreach ($request->history ?? [] as $msg) {
            $contents[] = [
                'parts' => [['text' => $msg['text']]],
                'role' => $msg['role'] === 'user' ? 'user' : 'model'
            ];
        }

        // Message avec ou sans image
        $parts = [];

        if ($request->filled('image')) {
            $imageData = $request->image;
            if (str_contains($imageData, ',')) {
                [$meta, $imageData] = explode(',', $imageData, 2);
                preg_match('/data:(.*?);/', $meta, $matches);
                $mimeType = $matches[1] ?? 'image/jpeg';
            } else {
                $mimeType = 'image/jpeg';
            }

            $parts[] = [
                'inline_data' => [
                    'mime_type' => $mimeType,
                    'data' => $imageData,
                ]
            ];
        }

        $parts[] = ['text' => $request->message ?: 'Analyse cette tenue et donne-moi des conseils de style.'];

        $contents[] = ['parts' => $parts, 'role' => 'user'];

        $response = Http::post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={$apiKey}",
            ['contents' => $contents]
        );

        if ($response->failed()) {
            return response()->json([
                'error' => 'Erreur API Gemini',
                'status' => $response->status(),
                'body' => $response->json(),  // ← ajoute ça
            ], 500);
        }

        $text = $response->json('candidates.0.content.parts.0.text')
            ?? 'Désolé, je n\'ai pas pu répondre ';

        return response()->json(['reply' => $text]);
    }
}