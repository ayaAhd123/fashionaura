<?php

namespace App\Http\Controllers\Boutique;

use App\Http\Controllers\Controller;
use App\Models\BoutiqueAnalytics;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BoutiqueDashboardController extends Controller
{
    private function getBoutiqueId(): ?int
    {
        return Auth::user()->boutique_id;
    }

    public function stats()
    {
        $boutiqueId = $this->getBoutiqueId();
        if (! $boutiqueId) {
            return response()->json(['message' => 'Aucune boutique associée'], 422);
        }

        $today = Carbon::today();
        $last7Start = Carbon::now()->subDays(7)->startOfDay();
        $prev7Start = Carbon::now()->subDays(14)->startOfDay();
        $prev7End = Carbon::now()->subDays(7)->startOfDay();

        $totalProducts = Product::where('boutique_id', $boutiqueId)->count();

        $ordersQuery = fn () => Order::whereHas('items.product', function ($q) use ($boutiqueId) {
            $q->where('boutique_id', $boutiqueId);
        });

        $totalOrders = $ordersQuery()->count();

        $totalRevenue = (float) OrderItem::whereHas('product', fn ($q) => $q->where('boutique_id', $boutiqueId))
            ->sum(DB::raw('price * quantity'));

        $totalReviews = Review::where('boutique_id', $boutiqueId)->count();
        $averageRating = round((float) Review::where('boutique_id', $boutiqueId)->avg('rating'), 1);

        $todayOrders = (int) $ordersQuery()->whereDate('created_at', $today)->count();
        $todayRevenue = (float) OrderItem::whereHas('product', fn ($q) => $q->where('boutique_id', $boutiqueId))
            ->whereHas('order', fn ($q) => $q->whereDate('created_at', $today))
            ->sum(DB::raw('price * quantity'));

        $analyticsToday = BoutiqueAnalytics::where('boutique_id', $boutiqueId)
            ->whereDate('date', $today)
            ->first();

        if ($analyticsToday) {
            $todayOrders = max($todayOrders, (int) $analyticsToday->total_orders);
            $todayRevenue = max($todayRevenue, (float) $analyticsToday->total_revenue);
        }

        $last7Revenue = (float) BoutiqueAnalytics::where('boutique_id', $boutiqueId)
            ->where('date', '>=', $last7Start)
            ->sum('total_revenue');
        $last7Orders = (int) BoutiqueAnalytics::where('boutique_id', $boutiqueId)
            ->where('date', '>=', $last7Start)
            ->sum('total_orders');

        $prev7Revenue = (float) BoutiqueAnalytics::where('boutique_id', $boutiqueId)
            ->where('date', '>=', $prev7Start)
            ->where('date', '<', $prev7End)
            ->sum('total_revenue');
        $prev7Orders = (int) BoutiqueAnalytics::where('boutique_id', $boutiqueId)
            ->where('date', '>=', $prev7Start)
            ->where('date', '<', $prev7End)
            ->sum('total_orders');

        $recentOrders = $ordersQuery()
            ->with(['user:id,name', 'items.product:id,name,boutique_id'])
            ->orderByDesc('created_at')
            ->limit(8)
            ->get()
            ->map(function (Order $order) use ($boutiqueId) {
                $items = $order->items->filter(
                    fn ($item) => $item->product && (int) $item->product->boutique_id === (int) $boutiqueId
                );

                return [
                    'id' => $order->id,
                    'customer_id' => $order->user_id,
                    'customer' => $order->user?->name ?? 'Client',
                    'product' => $items->first()?->product?->name
                        ?? ($items->count() > 1 ? $items->count().' produits' : '—'),
                    'amount' => round($items->sum(fn ($i) => (float) $i->price * (int) $i->quantity), 2),
                    'status' => $order->status ?? 'pending',
                    'date' => $order->created_at?->toDateString(),
                ];
            })
            ->values();

        return response()->json([
            'total_products' => $totalProducts,
            'total_orders' => $totalOrders,
            'total_revenue' => round($totalRevenue, 2),
            'total_reviews' => $totalReviews,
            'average_rating' => $averageRating,
            'today_stats' => [
                'orders' => $todayOrders,
                'revenue' => round($todayRevenue, 2),
            ],
            'recent_stats' => [
                'orders_change' => $this->percentChange($prev7Orders, $last7Orders),
                'revenue_change' => $this->percentChange($prev7Revenue, $last7Revenue),
            ],
            'recent_orders' => $recentOrders,
        ]);
    }

    public function charts(Request $request)
    {
        $boutiqueId = $this->getBoutiqueId();
        if (! $boutiqueId) {
            return response()->json(['message' => 'Aucune boutique associée'], 422);
        }

        $period = $request->get('period', '30days');

        $startDate = match ($period) {
            '7days' => Carbon::now()->subDays(6)->startOfDay(),
            '90days' => Carbon::now()->subDays(89)->startOfDay(),
            default => Carbon::now()->subDays(29)->startOfDay(),
        };

        $periodLabel = match ($period) {
            '7days' => '7 derniers jours',
            '90days' => '90 derniers jours',
            default => '30 derniers jours',
        };

        $endDate = Carbon::today();
        $analytics = BoutiqueAnalytics::where('boutique_id', $boutiqueId)
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->orderBy('date')
            ->get()
            ->keyBy(fn ($row) => Carbon::parse($row->date)->toDateString());

        $labels = [];
        $views = [];
        $orders = [];
        $revenue = [];
        $cursor = $startDate->copy();

        while ($cursor->lte($endDate)) {
            $key = $cursor->toDateString();
            $row = $analytics->get($key);

            $labels[] = $cursor->format('d/m');
            $views[] = (int) ($row->total_views ?? 0);
            $orders[] = (int) ($row->total_orders ?? 0);
            $revenue[] = round((float) ($row->total_revenue ?? 0), 2);

            $cursor->addDay();
        }

        $hasData = collect($revenue)->sum() > 0
            || collect($orders)->sum() > 0
            || collect($views)->sum() > 0;

        return response()->json([
            'labels' => $labels,
            'views' => $views,
            'orders' => $orders,
            'revenue' => $revenue,
            'period' => $period,
            'period_label' => $periodLabel,
            'has_data' => $hasData,
        ]);
    }

    private function percentChange(float|int $previous, float|int $current): float
    {
        $previous = (float) $previous;
        $current = (float) $current;

        if ($previous <= 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
