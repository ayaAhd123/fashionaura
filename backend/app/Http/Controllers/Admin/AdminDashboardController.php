<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Boutique;
use App\Models\City;
use App\Models\Order;
use App\Models\User;
use App\Models\BoutiqueAnalytics;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function stats()
    {
        $totalBoutiques = Boutique::count();
        $totalCities = City::count();
        $totalUsers = User::where('role', 'customer')->count();
        $totalOrders = Order::count();
        $totalRevenue = Order::sum('total');
        $pendingBoutiques = Boutique::where('is_verified', false)->count();

        $startDate = Carbon::now()->subDays(30);
        
        $ordersStats = Order::where('created_at', '>=', $startDate)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as revenue'))
            ->groupBy('date')
            ->get();

        $topBoutiques = Boutique::with('city')
            ->orderBy('reviews_count', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'logo', 'rating', 'reviews_count', 'city_id']);

        return response()->json([
            'total_boutiques' => $totalBoutiques,
            'total_cities' => $totalCities,
            'total_users' => $totalUsers,
            'total_orders' => $totalOrders,
            'total_revenue' => $totalRevenue,
            'pending_boutiques' => $pendingBoutiques,
            'orders_stats' => $ordersStats,
            'top_boutiques' => $topBoutiques,
        ]);
    }

    public function analytics(Request $request)
    {
        $period = $request->get('period', '30days');
        
        $startDate = match($period) {
            '7days' => Carbon::now()->subDays(7),
            '90days' => Carbon::now()->subDays(90),
            default => Carbon::now()->subDays(30),
        };

        $dailyStats = BoutiqueAnalytics::where('date', '>=', $startDate)
            ->select(
                DB::raw('DATE(date) as date'),
                DB::raw('SUM(total_views) as total_views'),
                DB::raw('SUM(total_orders) as total_orders'),
                DB::raw('SUM(total_revenue) as total_revenue')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $categoryStats = Boutique::select('category', DB::raw('COUNT(*) as count'))
            ->whereNotNull('category')
            ->groupBy('category')
            ->get();

        return response()->json([
            'daily_stats' => $dailyStats,
            'category_stats' => $categoryStats,
        ]);
    }
}