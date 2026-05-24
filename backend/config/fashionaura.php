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

];
