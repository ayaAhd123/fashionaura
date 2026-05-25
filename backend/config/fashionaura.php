<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Alertes stock (magasiniers)
    |--------------------------------------------------------------------------
    */
    'stock_alert_threshold' => (int) env('STOCK_ALERT_THRESHOLD', 10),
    'stock_critical_threshold' => (int) env('STOCK_CRITICAL_THRESHOLD', 3),
    'stock_alert_dedupe_hours' => (int) env('STOCK_ALERT_DEDUPE_HOURS', 24),

    /*
    |--------------------------------------------------------------------------
    | Conseiller IA boutique (Gemini)
    |--------------------------------------------------------------------------
    */
    'gemini_api_key' => env('GEMINI_API_KEY'),
    'gemini_model' => env('GEMINI_MODEL', 'gemini-flash-lite-latest'),
    'gemini_timeout' => (int) env('GEMINI_TIMEOUT', 45),
    'ai_cache_minutes' => (int) env('AI_CACHE_MINUTES', 60),

];
