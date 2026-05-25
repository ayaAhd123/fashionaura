<?php

namespace Database\Seeders;

use App\Models\Boutique;
use App\Models\Category;
use App\Models\Notification;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use App\Services\StockAlertService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Produits réalistes (robe, pantalon, chemise…) avec photos pour tester les alertes stock.
 *
 * Usage :
 *   php artisan db:seed --class=StockAlertTestSeeder
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

        $this->ensureCategories();

        $this->command?->info('Configuration des seuils et catalogue démo (robes, pantalons, chemises…)…');

        $thresholdPresets = [10, 5, 20, 10, 10];

        foreach ($owners as $index => $owner) {
            $boutique = $owner->boutique;
            if (! $boutique) {
                continue;
            }

            $threshold = $thresholdPresets[$index] ?? 10;
            $boutique->update(['stock_alert_threshold' => $threshold]);

            $this->cleanupLegacyTestProducts($boutique);
            $this->seedProductsForBoutique($boutique, $threshold);

            $this->command?->line("  • {$boutique->name} — seuil {$threshold} — {$owner->email}");
        }

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
    }

    private function ensureCategories(): void
    {
        $defs = [
            ['name' => 'Pantalons', 'slug' => 'pantalons', 'description' => 'Pantalons et jeans'],
        ];

        foreach ($defs as $def) {
            Category::firstOrCreate(
                ['slug' => $def['slug']],
                array_merge($def, ['is_active' => true])
            );
        }
    }

    private function cleanupLegacyTestProducts(Boutique $boutique): void
    {
        $legacy = Product::where('boutique_id', $boutique->id)
            ->where(function ($q) {
                $q->where('name', 'like', '[TEST ALERTE]%')
                    ->orWhere('slug', 'like', 'test-alerte-%');
            })
            ->get();

        foreach ($legacy as $product) {
            $product->images()->delete();
            $product->delete();
        }
    }

    private function seedProductsForBoutique(Boutique $boutique, int $threshold): void
    {
        $categories = Category::whereIn('slug', ['robes', 'pantalons', 'chemises', 'sacs', 'chaussures'])
            ->pluck('id', 'slug');

        if ($categories->isEmpty()) {
            $this->command?->warn("  Pas de catégories pour {$boutique->name}.");

            return;
        }

        $critical = max(1, (int) floor($threshold / 2));

        $catalog = [
            [
                'name' => 'Robe Soirée Satin',
                'category' => 'robes',
                'type' => 'robe',
                'price' => 890,
                'stock' => 0,
                'style' => 'luxury',
            ],
            [
                'name' => 'Pantalon Taille Haute Beige',
                'category' => 'pantalons',
                'type' => 'pantalon',
                'price' => 450,
                'stock' => $critical,
                'style' => 'casual',
            ],
            [
                'name' => 'Chemise Classique Blanche',
                'category' => 'chemises',
                'type' => 'chemise',
                'price' => 320,
                'stock' => $threshold,
                'style' => 'formal',
            ],
            [
                'name' => 'Veste Lin Premium',
                'category' => 'chemises',
                'type' => 'veste',
                'price' => 620,
                'stock' => $threshold + 1,
                'style' => 'casual',
            ],
            [
                'name' => 'Sac Cuir Artisanal',
                'category' => 'sacs',
                'type' => 'sac',
                'price' => 780,
                'stock' => $threshold + 15,
                'style' => 'luxury',
            ],
        ];

        foreach ($catalog as $item) {
            $categoryId = $categories[$item['category']] ?? $categories->first();
            $slug = Str::slug("{$item['name']}-{$boutique->slug}");

            $product = Product::updateOrCreate(
                ['slug' => $slug],
                [
                    'boutique_id' => $boutique->id,
                    'category_id' => $categoryId,
                    'name' => $item['name'],
                    'description' => "{$item['name']} — collection {$boutique->name}.",
                    'price' => $item['price'],
                    'stock_quantity' => $item['stock'],
                    'style' => $item['style'],
                    'rating' => 4.2,
                    'is_active' => true,
                ]
            );

            $this->attachProductImage($product, $item['type']);
        }
    }

    private function attachProductImage(Product $product, string $type): void
    {
        $url = DemoMediaUrls::byType($type)[0];

        $product->images()->updateOrCreate(
            ['product_id' => $product->id, 'is_primary' => true],
            [
                'image_url' => $url,
                'sort_order' => 0,
            ]
        );
    }
}
