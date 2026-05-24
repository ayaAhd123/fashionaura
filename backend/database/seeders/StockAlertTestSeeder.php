<?php

namespace Database\Seeders;

use App\Models\Boutique;
use App\Models\Category;
use App\Models\Notification;
use App\Models\Product;
use App\Models\User;
use App\Services\StockAlertService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Données de démo pour tester alertes stock + notifications.
 *
 * Usage :
 *   php artisan db:seed --class=StockAlertTestSeeder
 *
 * Puis connectez-vous en magasinier (ex. sarah@luxuryfashion.com / password123)
 * et ouvrez /boutique/notifications
 */
class StockAlertTestSeeder extends Seeder
{
    public function run(): void
    {
        $service = app(StockAlertService::class);

        $owners = User::where('role', 'boutique_owner')
            ->whereNotNull('boutique_id')
            ->with('boutique')
            ->get();

        if ($owners->isEmpty()) {
            $this->command?->warn('Aucun magasinier trouvé. Lancez d\'abord : php artisan db:seed --class=BoutiqueOwnerSeeder');

            return;
        }

        $this->command?->info('Configuration des seuils et stocks de test…');

        $thresholdPresets = [10, 5, 20, 10, 10];

        foreach ($owners as $index => $owner) {
            $boutique = $owner->boutique;
            if (! $boutique) {
                continue;
            }

            $threshold = $thresholdPresets[$index] ?? 10;
            $boutique->update(['stock_alert_threshold' => $threshold]);

            $this->seedProductsForBoutique($boutique, $threshold);

            $this->command?->line("  • {$boutique->name} — seuil {$threshold} — {$owner->email}");
        }

        // Nettoyer les anciennes alertes stock pour une démo propre
        Notification::where('type', 'stock')->delete();

        $this->command?->info('Génération des notifications via StockAlertService…');
        $result = $service->run();

        $this->command?->info("✅ {$result['created']} notification(s) stock créée(s).");
        if ($result['skipped_duplicates'] > 0) {
            $this->command?->comment("   {$result['skipped_duplicates']} ignorée(s) (doublon 24h).");
        }

        $this->command?->newLine();
        $this->command?->info('Comptes magasinier pour tester :');
        foreach ($owners->take(3) as $owner) {
            $t = $owner->boutique?->stock_alert_threshold ?? 10;
            $this->command?->line("  → {$owner->email} / password123 (seuil {$t})");
        }
        $this->command?->newLine();
        $this->command?->comment('Relancer la vérif : php artisan fashionaura:check-stock-alerts');
    }

    private function seedProductsForBoutique(Boutique $boutique, int $threshold): void
    {
        $category = Category::query()->first();
        $categoryId = $boutique->products()->value('category_id') ?? $category?->id;

        if (! $categoryId) {
            $this->command?->warn("  Pas de catégorie pour {$boutique->name}, produits test ignorés.");

            return;
        }

        // Scénarios : rupture, critique, faible, OK, confortable
        $scenarios = [
            ['suffix' => 'rupture', 'stock' => 0, 'label' => 'Rupture'],
            ['suffix' => 'critique', 'stock' => max(1, (int) floor($threshold / 2)), 'label' => 'Stock critique'],
            ['suffix' => 'faible', 'stock' => $threshold, 'label' => 'Stock faible'],
            ['suffix' => 'limite', 'stock' => $threshold + 1, 'label' => 'Juste au-dessus du seuil'],
            ['suffix' => 'ok', 'stock' => $threshold + 15, 'label' => 'Stock confortable'],
        ];

        foreach ($scenarios as $scenario) {
            $slug = Str::slug("[test-alerte-{$scenario['suffix']}] {$boutique->slug}");

            Product::updateOrCreate(
                ['slug' => $slug],
                [
                    'boutique_id' => $boutique->id,
                    'category_id' => $categoryId,
                    'name' => "[TEST ALERTE] {$scenario['label']} — {$boutique->name}",
                    'description' => "Produit de test alerte stock ({$scenario['label']}, {$scenario['stock']} unités).",
                    'price' => 299,
                    'stock_quantity' => $scenario['stock'],
                    'style' => 'casual',
                    'rating' => 4.0,
                    'is_active' => true,
                ]
            );
        }

        // Ajuster aussi 2 produits existants (hors test) pour variété
        $existing = $boutique->products()
            ->where('name', 'not like', '[TEST ALERTE]%')
            ->limit(2)
            ->get();

        $adjustStocks = [0, min(3, $threshold)];

        foreach ($existing as $i => $product) {
            if (isset($adjustStocks[$i])) {
                $product->update(['stock_quantity' => $adjustStocks[$i]]);
            }
        }
    }
}
