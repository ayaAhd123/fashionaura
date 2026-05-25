<?php

namespace App\Services;

class GeminiService
{
    public function isConfigured(): bool
    {
        return (bool) $this->apiKey();
    }

    public function apiKey(): ?string
    {
        $key = config('fashionaura.gemini_api_key') ?: env('GEMINI_API_KEY');

        return $key ? trim($key) : null;
    }

    public function generateText(string $systemPrompt, string $userPrompt): string
    {
        $payload = [
            'contents' => [
                [
                    'parts' => [['text' => $userPrompt]],
                    'role' => 'user',
                ],
            ],
            'system_instruction' => [
                'parts' => [['text' => $systemPrompt]],
            ],
        ];

        return $this->call($payload);
    }

    /**
     * @return array<string, mixed>
     */
    public function generateJson(string $systemPrompt, string $userPrompt): array
    {
        $jsonPrompt = $userPrompt."\n\nRéponds UNIQUEMENT avec un objet JSON valide, sans markdown ni texte autour.";

        $raw = $this->generateText($systemPrompt, $jsonPrompt);

        return $this->parseJsonResponse($raw);
    }

    private function call(array $payload): string
    {
        $apiKey = $this->apiKey();
        if (! $apiKey) {
            throw new \RuntimeException('GEMINI_API_KEY non configurée');
        }

        $model = config('fashionaura.gemini_model', 'gemini-2.0-flash');
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

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
            throw new \RuntimeException("Gemini HTTP {$httpCode}: ".substr((string) $responseBody, 0, 200));
        }

        $response = json_decode((string) $responseBody, true);

        return $response['candidates'][0]['content']['parts'][0]['text'] ?? '';
    }

    /**
     * @return array<string, mixed>
     */
    private function parseJsonResponse(string $raw): array
    {
        $raw = trim($raw);
        if (preg_match('/```(?:json)?\s*([\s\S]*?)```/i', $raw, $m)) {
            $raw = trim($m[1]);
        }

        $decoded = json_decode($raw, true);
        if (! is_array($decoded)) {
            throw new \RuntimeException('Réponse Gemini non JSON');
        }

        return $decoded;
    }
}
