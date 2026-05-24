<?php

namespace App\Console\Commands;

use App\Services\StockAlertService;
use Illuminate\Console\Command;

class CheckStockAlertsCommand extends Command
{
    protected $signature = 'fashionaura:check-stock-alerts
                            {--boutique= : ID boutique (optionnel, sinon toutes)}';

    protected $description = 'Crée des notifications pour les produits en stock faible ou rupture';

    public function handle(StockAlertService $service): int
    {
        $boutiqueId = $this->option('boutique') ? (int) $this->option('boutique') : null;

        $this->info('Vérification des stocks…');

        $result = $service->run($boutiqueId);

        $this->info("✅ {$result['created']} alerte(s) créée(s).");
        if ($result['skipped_duplicates'] > 0) {
            $this->comment("   {$result['skipped_duplicates']} ignorée(s) (déjà notifiée récemment).");
        }

        return self::SUCCESS;
    }
}
