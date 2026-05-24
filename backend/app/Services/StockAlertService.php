<?php

namespace App\Services;

use App\Models\Boutique;
use App\Models\Notification;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Collection;

class StockAlertService
{
    public const PRESET_THRESHOLDS = [5, 10, 20];

    public function thresholdForBoutique(?Boutique $boutique): int
    {
        if ($boutique?->stock_alert_threshold) {
            return (int) $boutique->stock_alert_threshold;
        }

        return (int) config('fashionaura.stock_alert_threshold', 10);
    }

    public function criticalForThreshold(int $threshold): int
    {
        $configured = (int) config('fashionaura.stock_critical_threshold', 3);

        return min($configured, max(1, (int) floor($threshold / 2)));
    }

    public function run(?int $boutiqueId = null, bool $force = false): array
    {
        $dedupeHours = (int) config('fashionaura.stock_alert_dedupe_hours', 24);

        $created = 0;
        $skipped = 0;
        $atRisk = 0;

        $query = Boutique::query()->with(['products' => function ($q) {
            $q->where('is_active', true);
        }]);

        if ($boutiqueId) {
            $query->where('id', $boutiqueId);
        }

        $boutiques = $query->get();

        foreach ($boutiques as $boutique) {
            $threshold = $this->thresholdForBoutique($boutique);
            $critical = $this->criticalForThreshold($threshold);

            $owner = User::where('boutique_id', $boutique->id)
                ->where('role', 'boutique_owner')
                ->first();

            if (! $owner) {
                continue;
            }

            foreach ($boutique->products as $product) {
                $stock = (int) ($product->stock_quantity ?? 0);

                if ($stock > $threshold) {
                    continue;
                }

                $atRisk++;

                if (! $force && $this->hasRecentAlert($owner->id, $product->id, $dedupeHours)) {
                    $skipped++;
                    continue;
                }

                $this->createAlert($owner, $boutique->id, $product, $stock, $critical, $threshold);
                $created++;
            }
        }

        return [
            'created' => $created,
            'skipped_duplicates' => $skipped,
            'at_risk' => $atRisk,
        ];
    }

    public function getSettings(Boutique $boutique): array
    {
        $threshold = $this->thresholdForBoutique($boutique);

        return [
            'stock_alert_threshold' => $threshold,
            'presets' => self::PRESET_THRESHOLDS,
            'default_threshold' => (int) config('fashionaura.stock_alert_threshold', 10),
            'min' => 1,
            'max' => 100,
            'dedupe_hours' => (int) config('fashionaura.stock_alert_dedupe_hours', 24),
        ];
    }

    public function updateSettings(Boutique $boutique, int $threshold): array
    {
        $threshold = max(1, min(100, $threshold));

        $boutique->update(['stock_alert_threshold' => $threshold]);

        return $this->getSettings($boutique->fresh());
    }

    private function hasRecentAlert(int $userId, int $productId, int $dedupeHours): bool
    {
        return Notification::query()
            ->where('user_id', $userId)
            ->where('type', 'stock')
            ->where('created_at', '>=', now()->subHours($dedupeHours))
            ->where('data->product_id', $productId)
            ->exists();
    }

    private function createAlert(
        User $owner,
        int $boutiqueId,
        Product $product,
        int $stock,
        int $critical,
        int $threshold
    ): void {
        $isOut = $stock <= 0;
        $isCritical = ! $isOut && $stock <= $critical;

        $title = match (true) {
            $isOut => 'Rupture de stock',
            $isCritical => 'Stock critique',
            default => 'Stock faible',
        };

        $unitLabel = $stock === 1 ? 'unité' : 'unités';

        $message = $isOut
            ? "« {$product->name} » est en rupture de stock. Réapprovisionnez rapidement."
            : "« {$product->name} » : il ne reste que {$stock} {$unitLabel} (seuil : {$threshold}).";

        Notification::create([
            'user_id' => $owner->id,
            'boutique_id' => $boutiqueId,
            'type' => 'stock',
            'title' => $title,
            'message' => $message,
            'is_read' => false,
            'action_url' => '/boutique/products',
            'data' => [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'stock' => $stock,
                'threshold' => $threshold,
                'priority' => $isOut ? 'critical' : ($isCritical ? 'high' : 'medium'),
            ],
        ]);
    }

    public function summaryForBoutique(int $boutiqueId): Collection
    {
        $boutique = Boutique::find($boutiqueId);
        $threshold = $this->thresholdForBoutique($boutique);

        return Product::where('boutique_id', $boutiqueId)
            ->where('is_active', true)
            ->where('stock_quantity', '<=', $threshold)
            ->orderBy('stock_quantity')
            ->get(['id', 'name', 'slug', 'stock_quantity']);
    }
}
