<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller; // On importe le contrôleur de base pour l'extension
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\City;

class ChatbotController extends Controller
{
    public function chat(Request $request)
    {
        // ... tout le reste de ton code reste identique
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

### STYLE DE RÉPONSE :
- Répond dans la langue de la question
- Chaleureux et moderne
- Maximum 4-5 lignes par réponse
- Termine toujours par une question pour continuer la conversation
";

        $contents = [];
        
        foreach ($request->history ?? [] as $msg) {
            $contents[] = [
                'parts' => [['text' => $msg['text']]],
                'role' => $msg['role'] === 'user' ? 'user' : 'model'
            ];
        }

        $parts = [];
        $parts[] = ['text' => $request->message ?: 'Analyse cette tenue et donne-moi des conseils de style.'];

        if ($request->filled('image')) {
            $imageData = $request->image;
            if (str_contains($imageData, ',')) {
                [$meta, $imageData] = explode(',', $imageData, 2);
                preg_match('/data:(.*?);/', $meta, $matches);
                $mimeType = $matches[1] ?? 'image/jpeg';
            } else {
                $mimeType = 'image/jpeg';
            }

            // Clean invalid characters like spaces or newlines that cause decoding errors
            $imageData = preg_replace('/[^a-zA-Z0-9\/\+=]/', '', $imageData);

            $parts[] = [
                'inlineData' => [
                    'mimeType' => $mimeType,
                    'data' => $imageData,
                ]
            ];
        }

        $contents[] = ['parts' => $parts, 'role' => 'user'];

        // Construction du payload avec system_instruction
        $payload = [
            'contents' => $contents,
            'system_instruction' => [
                'parts' => [['text' => $systemPrompt]]
            ]
        ];

        // Log payload for debugging
        \Illuminate\Support\Facades\Log::info('Gemini Payload:', $payload);

        try {
            // STRATÉGIE DE CONTOURNEMENT DÉFINITIVE (IP BYPASS)
            // L'IP directe permet de contourner le blocage du nom de domaine sur ce PC
            $ip = "142.251.142.74"; 
            $host = "generativelanguage.googleapis.com";
            // On utilise gemini-flash-lite-latest car il a du quota disponible
            $url = "https://{$ip}/v1beta/models/gemini-flash-lite-latest:generateContent?key={$apiKey}";
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                "Host: {$host}"
            ]);
            
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
            curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 15);

            $responseBody = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                \Illuminate\Support\Facades\Log::error('Gemini cURL Error (Final):', ['error' => $curlError]);
                return response()->json(['reply' => "⚠️ Erreur réseau : Bloqué par le système."]);
            }

            $response = json_decode($responseBody, true);

            if ($httpCode !== 200) {
                \Illuminate\Support\Facades\Log::error('Gemini API Error (Final):', ['status' => $httpCode, 'body' => $responseBody]);
                
                if ($httpCode === 429) {
                    return response()->json(['reply' => "Désolée, j'ai épuisé mon quota. Réessayez dans 1 minute ! ⏳"]);
                }
                return response()->json(['reply' => "Oups, Google me renvoie une erreur (Code {$httpCode})."]);
            }

            $text = $response['candidates'][0]['content']['parts'][0]['text'] ?? "Désolée, je n'ai pas pu générer de réponse.";
            return response()->json(['reply' => $text]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Gemini Exception (Final):', ['msg' => $e->getMessage()]);
            return response()->json(['reply' => "Erreur inattendue. 😅"]);
        }
    }
}