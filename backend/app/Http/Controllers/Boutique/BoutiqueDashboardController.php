<?php

namespace App\Http\Controllers\Boutique;

use App\Http\Controllers\Controller;
use App\Models\BoutiqueAnalytics;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BoutiqueDashboardController extends Controller
{
    private function getBoutiqueId()
    {
        return Auth::user()->boutique_id;
    }

    public function stats()
    {
        $boutiqueId = $this->getBoutiqueId();
        $today = Carbon::today();
        $last30Days = Carbon::now()->subDays(30);

        $totalProducts = Product::where('boutique_id', $boutiqueId)->count();
        $totalOrders = Order::whereHas('items.product', function($q) use ($boutiqueId) {
            $q->where('boutique_id', $boutiqueId);
        })->count();
        
        $totalRevenue = Order::whereHas('items.product', function($q) use ($boutiqueId) {
            $q->where('boutique_id', $boutiqueId);
        })->sum('total');
        
        $totalReviews = Review::where('boutique_id', $boutiqueId)->count();
        $averageRating = Review::where('boutique_id', $boutiqueId)->avg('rating') ?? 0;

        $todayStats = BoutiqueAnalytics::where('boutique_id', $boutiqueId)
            ->where('date', $today)
            ->first();

        $recentStats = BoutiqueAnalytics::where('boutique_id', $boutiqueId)
            ->where('date', '>=', $last30Days)
            ->orderBy('date')
            ->get();

        $recentOrders = Order::whereHas('items.product', function($q) use ($boutiqueId) {
            $q->where('boutique_id', $boutiqueId);
        })
        ->with(['user', 'items.product'])
        ->orderBy('created_at', 'desc')
        ->limit(10)
        ->get();

        return response()->json([
            'total_products' => $totalProducts,
            'total_orders' => $totalOrders,
            'total_revenue' => $totalRevenue,
            'total_reviews' => $totalReviews,
            'average_rating' => round($averageRating, 1),
            'today_stats' => $todayStats,
            'recent_stats' => $recentStats,
            'recent_orders' => $recentOrders,
        ]);
    }

    public function charts(Request $request)
    {
        $boutiqueId = $this->getBoutiqueId();
        $period = $request->get('period', '30days');
        
        $startDate = match($period) {
            '7days' => Carbon::now()->subDays(7),
            '90days' => Carbon::now()->subDays(90),
            default => Carbon::now()->subDays(30),
        };

        $analytics = BoutiqueAnalytics::where('boutique_id', $boutiqueId)
            ->where('date', '>=', $startDate)
            ->orderBy('date')
            ->get();

        return response()->json([
            'labels' => $analytics->pluck('date'),
            'views' => $analytics->pluck('total_views'),
            'orders' => $analytics->pluck('total_orders'),
            'revenue' => $analytics->pluck('total_revenue'),
        ]);
    }
}