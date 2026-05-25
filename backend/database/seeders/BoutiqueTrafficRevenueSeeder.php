<?php

namespace Database\Seeders;

use App\Models\Boutique;
use App\Models\BoutiqueAnalytics;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Trafic (vues) + revenus pour tester le dashboard boutique (graphiques 7/30/90 jours).
 *
 * Usage :
 *   php artisan db:seed --class=BoutiqueTrafficRevenueSeeder
 *   php artisan db:seed --class=BoutiqueTrafficRevenueSeeder -- --all
 *
 * Par défaut : sarah@luxuryfashion.com uniquement.
 * Relançable : met à jour les analytics (unique boutique_id + date) et remplace les commandes démo.
 */
class BoutiqueTrafficRevenueSeeder extends Seeder
{
    private const DEMO_ORDER_MARKER = '[DEMO-TRAFIC]';

    private const DEFAULT_EMAIL = 'sarah@luxuryfashion.com';

    private const DAYS = 90;

    public function run(): void
    {
        $seedAll = $this->optionAll();
        $days = self::DAYS;

        $owners = User::where('role', 'boutique_owner')
            ->whereNotNull('boutique_id')
            ->with('boutique.products')
            ->when(! $seedAll, fn ($q) => $q->where('email', self::DEFAULT_EMAIL))
            ->get();

        if ($owners->isEmpty()) {
            $this->command?->warn(
                $seedAll
                    ? 'Aucun magasinier trouvé. Lancez : php artisan db:seed --class=BoutiqueOwnerSeeder'
                    : 'Compte '.self::DEFAULT_EMAIL.' introuvable. Utilisez --all ou BoutiqueOwnerSeeder.'
            );

            return;
        }

        $this->command?->info("📈 Trafic & revenus — {$days} jours — ".($seedAll ? 'toutes les boutiques' : self::DEFAULT_EMAIL));

        $customers = $this->ensureDemoCustomers();

        foreach ($owners as $owner) {
            $boutique = $owner->boutique;
            if (! $boutique) {
                continue;
            }

            if ($boutique->products->isEmpty()) {
                $this->command?->warn("  ⚠ {$boutique->name} : aucun produit — ignorée (lancez ProductSeeder ou StockAlertTestSeeder).");

                continue;
            }

            $stats = $this->seedAnalytics($boutique, $days);
            $orders = $this->seedDemoOrders($boutique, $customers);

            $this->command?->line(sprintf(
                '  ✓ %s (%s) — %d jours analytics, %d commandes démo, ~%s MAD revenus période',
                $boutique->name,
                $owner->email,
                $stats['days'],
                $orders,
                number_format($stats['total_revenue'], 0, ',', ' ')
            ));
        }

        $this->command?->newLine();
        $this->command?->info('Dashboard : /boutique/dashboard — périodes 7 / 30 / 90 jours.');
        $this->command?->line('  → sarah@luxuryfashion.com / password123');
        $this->command?->comment('  Relance : php artisan db:seed --class=BoutiqueTrafficRevenueSeeder');
        $this->command?->comment('  Toutes les boutiques : php artisan db:seed --class=BoutiqueTrafficRevenueSeeder -- --all');
    }

    private function optionAll(): bool
    {
        if (! $this->command) {
            return false;
        }

        return in_array('--all', $_SERVER['argv'] ?? [], true);
    }

    /**
     * Courbe réaliste : hausse progressive, pics week-end, léger creux en milieu de semaine.
     */
    private function seedAnalytics(Boutique $boutique, int $days): array
    {
        $start = Carbon::today()->subDays($days - 1);
        $end = Carbon::today();
        $productIds = $boutique->products->take(5)->pluck('id')->all();

        $totalRevenue = 0.0;
        $dayIndex = 0;

        for ($date = $start->copy(); $date->lte($end); $date->addDay(), $dayIndex++) {
            $dow = $date->dayOfWeek;
            $isWeekend = $dow === Carbon::SATURDAY || $dow === Carbon::SUNDAY;
            $growth = 1 + ($dayIndex / max($days, 1)) * 0.45;
            $season = 1 + 0.15 * sin($dayIndex / 4.5);

            $baseViews = ($isWeekend ? 380 : 220) * $growth * $season;
            $views = (int) round($baseViews + random_int(-40, 80));
            $views = max($views, 50);

            $uniqueVisitors = (int) round($views * (0.35 + (random_int(0, 15) / 100)));
            $conversionPct = ($isWeekend ? 4.2 : 2.8) + ($dayIndex / $days) * 1.2 + (random_int(-5, 10) / 10);
            $orders = max(1, (int) round($views * ($conversionPct / 100)));
            $avgBasket = random_int(420, 950) + (int) ($dayIndex / 3);
            $revenue = round($orders * $avgBasket, 2);
            $productsSold = $orders * random_int(1, 2);

            BoutiqueAnalytics::updateOrCreate(
                [
                    'boutique_id' => $boutique->id,
                    'date' => $date->toDateString(),
                ],
                [
                    'total_views' => $views,
                    'unique_visitors' => min($uniqueVisitors, $views),
                    'total_orders' => $orders,
                    'total_revenue' => $revenue,
                    'products_sold' => $productsSold,
                    'average_order_value' => round($revenue / $orders, 2),
                    'conversion_rate' => round(min(($orders / $views) * 100, 99.99), 2),
                    'top_products' => $productIds,
                ]
            );

            $totalRevenue += $revenue;
        }

        return [
            'days' => $days,
            'total_revenue' => $totalRevenue,
        ];
    }

    private function seedDemoOrders(Boutique $boutique, $customers): int
    {
        $this->removeDemoOrders($boutique);

        $products = $boutique->products;
        $statuses = ['pending', 'confirmed', 'delivered', 'delivered', 'delivered'];
        $created = 0;

        for ($i = 0; $i < 28; $i++) {
            $orderDate = Carbon::now()->subDays(random_int(0, 29))->setTime(random_int(9, 20), random_int(0, 59));
            $user = $customers->random();
            $status = $statuses[array_rand($statuses)];

            $order = Order::create([
                'user_id' => $user->id,
                'total' => 0,
                'status' => $status,
                'address' => self::DEMO_ORDER_MARKER.' Casablanca, Maroc',
                'phone' => '+2126'.random_int(10000000, 99999999),
                'created_at' => $orderDate,
                'updated_at' => $orderDate,
            ]);

            $numItems = random_int(1, min(3, $products->count()));
            $picked = collect($products->random($numItems));
            $orderTotal = 0.0;

            foreach ($picked as $product) {
                $qty = random_int(1, 2);
                $price = (float) ($product->promo_price ?? $product->price);
                $orderTotal += $qty * $price;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'price' => $price,
                    'size' => is_array($product->sizes) && count($product->sizes) > 0
                        ? $product->sizes[array_rand($product->sizes)]
                        : null,
                    'color' => is_array($product->colors) && count($product->colors) > 0
                        ? $product->colors[array_rand($product->colors)]
                        : null,
                ]);
            }

            $order->update(['total' => round($orderTotal, 2)]);
            $created++;
        }

        return $created;
    }

    private function removeDemoOrders(Boutique $boutique): void
    {
        $orderIds = Order::where('address', 'like', self::DEMO_ORDER_MARKER.'%')
            ->whereHas('items.product', fn ($q) => $q->where('boutique_id', $boutique->id))
            ->pluck('id');

        if ($orderIds->isEmpty()) {
            return;
        }

        OrderItem::whereIn('order_id', $orderIds)->delete();
        Order::whereIn('id', $orderIds)->delete();
    }

    private function ensureDemoCustomers()
    {
        $customers = User::where('role', 'customer')->get();

        if ($customers->count() >= 5) {
            return $customers;
        }

        DB::transaction(function () {
            for ($i = 1; $i <= 8; $i++) {
                User::firstOrCreate(
                    ['email' => "demo-trafic-client{$i}@fashionaura.test"],
                    [
                        'name' => "Client démo {$i}",
                        'password' => bcrypt('password123'),
                        'role' => 'customer',
                        'is_active' => true,
                    ]
                );
            }
        });

        return User::where('role', 'customer')->get();
    }
}
