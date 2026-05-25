<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\CityController as ApiCityController;
use App\Http\Controllers\API\BoutiqueController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\CartController;
use App\Http\Controllers\API\FavoriteController;
use App\Http\Controllers\API\BoutiqueFollowerController;
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\ChatbotController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\CityController as AdminCityController;
use App\Http\Controllers\Admin\BoutiqueValidationController;
use App\Http\Controllers\Boutique\BoutiqueCopilotController;
use App\Http\Controllers\Boutique\BoutiqueProductController;
use App\Http\Controllers\Boutique\BoutiqueDashboardController;
use App\Http\Controllers\Boutique\AIAdvisorController;
use App\Http\Controllers\Boutique\NotificationController;

// ── Public API (site + e-commerce) ───────────────────────────────────────────
Route::get('/stats', [ApiCityController::class, 'stats']);
Route::get('/cities', [ApiCityController::class, 'index']);
Route::get('/cities/top-boutiques', [ApiCityController::class, 'topBoutiques']);
Route::get('/cities/{slug}', [ApiCityController::class, 'show']);

Route::get('/boutiques', [BoutiqueController::class, 'index']);
Route::get('/boutiques/{slug}', [BoutiqueController::class, 'show']);
Route::get('/boutiques-reviews/{id}', [BoutiqueController::class, 'reviews']);
Route::get('/cities/{cityId}/boutiques', [BoutiqueController::class, 'byCity']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/products-reviews/{id}', [ProductController::class, 'reviews']);
Route::get('/products-similar/{id}', [ProductController::class, 'similar']);
Route::get('/boutiques/{boutiqueId}/products', [ProductController::class, 'byBoutique']);

Route::post('/chatbot', [ChatbotController::class, 'chat']);

Route::post('/reviews', [ReviewController::class, 'store'])->middleware('auth:sanctum');

// ── Auth ─────────────────────────────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Cart & favorites
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::put('/cart/update/{cartItemId}', [CartController::class, 'update']);
    Route::delete('/cart/remove/{cartItemId}', [CartController::class, 'remove']);

    Route::post('/products/{productId}/favorite', [FavoriteController::class, 'add']);
    Route::delete('/products/{productId}/unfavorite', [FavoriteController::class, 'remove']);
    Route::get('/favorites', [FavoriteController::class, 'list']);
    Route::get('/products/{productId}/is-favorite', [FavoriteController::class, 'isFavorite']);

    Route::post('/boutiques/{boutiqueId}/follow', [BoutiqueFollowerController::class, 'follow']);
    Route::delete('/boutiques/{boutiqueId}/unfollow', [BoutiqueFollowerController::class, 'unfollow']);
    Route::get('/boutiques/{boutiqueId}/is-following', [BoutiqueFollowerController::class, 'isFollowing']);

    // Admin dashboard
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats']);
        Route::get('/dashboard/analytics', [AdminDashboardController::class, 'analytics']);

        Route::apiResource('cities', AdminCityController::class);

        Route::get('/boutiques/pending', [BoutiqueValidationController::class, 'pending']);
        Route::post('/boutiques/{id}/approve', [BoutiqueValidationController::class, 'approve']);
        Route::post('/boutiques/{id}/reject', [BoutiqueValidationController::class, 'reject']);
        Route::get('/boutique-requests', [BoutiqueValidationController::class, 'index']);
    });

    // Boutique owner dashboard
    Route::middleware('boutique.owner')->prefix('boutique')->group(function () {
        Route::get('/dashboard/stats', [BoutiqueDashboardController::class, 'stats']);
        Route::get('/dashboard/charts', [BoutiqueDashboardController::class, 'charts']);

        Route::get('/products/categories', [BoutiqueProductController::class, 'categories']);
        Route::get('/products', [BoutiqueProductController::class, 'index']);
        Route::post('/products', [BoutiqueProductController::class, 'store']);
        Route::put('/products/{id}', [BoutiqueProductController::class, 'update']);
        Route::delete('/products/{id}', [BoutiqueProductController::class, 'destroy']);

        Route::get('/ai-advisor/recommendations', [AIAdvisorController::class, 'recommendations']);
        Route::get('/ai-advisor/analysis', [AIAdvisorController::class, 'analysis']);

        Route::post('/copilot/chat', [BoutiqueCopilotController::class, 'chat']);

        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::get('/notifications/stock-settings', [NotificationController::class, 'stockSettings']);
        Route::put('/notifications/stock-settings', [NotificationController::class, 'updateStockSettings']);
        Route::post('/notifications/check-stock', [NotificationController::class, 'checkStock']);
        Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    });
});
