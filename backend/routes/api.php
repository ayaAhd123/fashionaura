<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\CityController as ApiCityController;
use App\Http\Controllers\API\BoutiqueController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\CartController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\ConversationController;
use App\Http\Controllers\API\MessageController;
use App\Http\Controllers\API\PostCommentController;
use App\Http\Controllers\API\FavoriteController;
use App\Http\Controllers\API\BoutiqueFollowerController;
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\ChatbotController;
use App\Http\Controllers\API\ContactController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\CityController as AdminCityController;
use App\Http\Controllers\Admin\BoutiqueValidationController;
use App\Http\Controllers\Boutique\BoutiqueCopilotController;
use App\Http\Controllers\Boutique\BoutiqueProductController;
use App\Http\Controllers\Boutique\BoutiquePostController;
use App\Http\Controllers\Boutique\BoutiqueDashboardController;
use App\Http\Controllers\Boutique\AIAdvisorController;
use App\Http\Controllers\Boutique\NotificationController;

use App\Http\Controllers\Admin\AdminBoutiqueController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminSettingsController;

use App\Http\Controllers\Boutique\BoutiqueOrderController;
use App\Http\Controllers\Boutique\BoutiqueClientController;
use App\Http\Controllers\Boutique\BoutiqueReviewController;
use App\Http\Controllers\Boutique\BoutiqueProfileController;

use App\Http\Controllers\API\CategoryController as ApiCategoryController;
use App\Http\Controllers\API\NotificationController as ApiNotificationController;


// ── Public API (site + e-commerce) ───────────────────────────────────────────
Route::get('/stats', [ApiCityController::class, 'stats']);
Route::get('/cities', [ApiCityController::class, 'index']);
Route::get('/cities/top-boutiques', [ApiCityController::class, 'topBoutiques']);
Route::get('/cities/{slug}', [ApiCityController::class, 'show']);

Route::get('/boutiques', [BoutiqueController::class, 'index']);
Route::get('/boutiques/{slug}', [BoutiqueController::class, 'show']);
Route::get('/boutiques-reviews/{id}', [BoutiqueController::class, 'reviews']);
Route::get('/cities/{cityId}/boutiques', [BoutiqueController::class, 'byCity']);

Route::post('/contact', [ContactController::class, 'store']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/products-reviews/{id}', [ProductController::class, 'reviews']);
Route::get('/products-similar/{id}', [ProductController::class, 'similar']);
Route::get('/boutiques/{boutiqueId}/products', [ProductController::class, 'byBoutique']);
Route::get('/boutiques/{boutiqueId}/posts', [BoutiquePostController::class, 'feed']);
Route::get('/boutiques/{boutiqueId}/posts/{postId}/comments', [PostCommentController::class, 'index']);

Route::post('/chatbot', [ChatbotController::class, 'chat']);
Route::get('/categories', [ApiCategoryController::class, 'index']);

Route::post('/reviews', [ReviewController::class, 'store'])->middleware('auth:sanctum');

// ── Auth ─────────────────────────────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Compte client : profil + mot de passe
    Route::put('/account/profile', [AuthController::class, 'updateProfile']);
    Route::put('/account/password', [AuthController::class, 'updatePassword']);

    // Commandes de l'utilisateur connecté
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{orderId}/conversation', [ConversationController::class, 'forOrder']);
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::get('/users/search', [ConversationController::class, 'searchUsers']);
    Route::get('/users/{userId}/conversation', [ConversationController::class, 'forUser']);
    Route::get('/boutiques/{boutiqueId}/conversation', [ConversationController::class, 'forBoutique']);
    Route::get('/conversations/{conversation}/messages', [MessageController::class, 'index']);
    Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store']);
    Route::post('/conversations/{conversation}/messages/audio', [MessageController::class, 'storeAudio']);
    Route::post('/conversations/{conversation}/messages/product', [MessageController::class, 'storeProduct']);
    Route::post('/boutiques/{boutiqueId}/posts/{postId}/comments', [PostCommentController::class, 'store']);

    // Boutiques suivies
    Route::get('/my/following', [BoutiqueFollowerController::class, 'following']);

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

        // Specific boutique-validation routes MUST come before apiResource to avoid conflicts
        Route::get('/boutiques/pending', [BoutiqueValidationController::class, 'pending']);
        Route::post('/boutiques/{id}/approve', [BoutiqueValidationController::class, 'approve']);
        Route::post('/boutiques/{id}/reject', [BoutiqueValidationController::class, 'reject']);
        Route::get('/boutique-requests', [BoutiqueValidationController::class, 'index']);
        Route::apiResource('boutiques', AdminBoutiqueController::class);

        // Orders
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

        // Users
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::put('/users/{id}', [AdminUserController::class, 'update']);
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

        // Categories
        Route::apiResource('categories', AdminCategoryController::class);

        // Settings
        Route::get('/settings', [AdminSettingsController::class, 'index']);
        Route::put('/settings', [AdminSettingsController::class, 'update']);
        Route::post('/settings/clear-cache', [AdminSettingsController::class, 'clearCache']);
        Route::post('/settings/backup', [AdminSettingsController::class, 'backupDatabase']);
        Route::get('/settings/logs', [AdminSettingsController::class, 'getLogs']);
    });

    // Shared notification routes (available to all authenticated users)
    Route::get('/notifications', [ApiNotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [ApiNotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [ApiNotificationController::class, 'destroy']);

    // Boutique owner dashboard
    Route::middleware('boutique.owner')->prefix('boutique')->group(function () {
        Route::get('/dashboard/stats', [BoutiqueDashboardController::class, 'stats']);
        Route::get('/dashboard/charts', [BoutiqueDashboardController::class, 'charts']);

        Route::get('/products/categories', [BoutiqueProductController::class, 'categories']);
        Route::get('/products', [BoutiqueProductController::class, 'index']);
        Route::post('/products', [BoutiqueProductController::class, 'store']);
        Route::put('/products/{id}', [BoutiqueProductController::class, 'update']);
        Route::delete('/products/{id}', [BoutiqueProductController::class, 'destroy']);

        Route::get('/posts', [BoutiquePostController::class, 'index']);
        Route::post('/posts', [BoutiquePostController::class, 'store']);
        Route::put('/posts/{id}', [BoutiquePostController::class, 'update']);
        Route::delete('/posts/{id}', [BoutiquePostController::class, 'destroy']);

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

        // Orders
        Route::get('/orders', [BoutiqueOrderController::class, 'index']);
        Route::put('/orders/{id}/status', [BoutiqueOrderController::class, 'updateStatus']);
        Route::get('/orders/{id}/messages', [BoutiqueOrderController::class, 'messages']);
        Route::post('/orders/{id}/messages', [BoutiqueOrderController::class, 'sendMessage']);

        // Clients
        Route::get('/clients', [BoutiqueClientController::class, 'index']);

        // Reviews
        Route::get('/reviews', [BoutiqueReviewController::class, 'index']);
        Route::post('/reviews/{id}/reply', [BoutiqueReviewController::class, 'reply']);

        // Profile
        Route::get('/profile', [BoutiqueProfileController::class, 'show']);
        Route::match(['put', 'post'], '/profile', [BoutiqueProfileController::class, 'update']);
    });
});
