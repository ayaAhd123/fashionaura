<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\CityController;
use App\Http\Controllers\Admin\BoutiqueValidationController;
use App\Http\Controllers\Boutique\BoutiqueDashboardController;
use App\Http\Controllers\Boutique\AIAdvisorController;
use App\Http\Controllers\Boutique\NotificationController;


Route::post('/login', [AuthController::class, 'login']);

Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats']);
        Route::get('/dashboard/analytics', [AdminDashboardController::class, 'analytics']);
        
        Route::apiResource('cities', CityController::class);
        
        Route::get('/boutiques/pending', [BoutiqueValidationController::class, 'pending']);
        Route::post('/boutiques/{id}/approve', [BoutiqueValidationController::class, 'approve']);
        Route::post('/boutiques/{id}/reject', [BoutiqueValidationController::class, 'reject']);
        Route::get('/boutique-requests', [BoutiqueValidationController::class, 'index']);
    });
    
    Route::middleware('boutique.owner')->prefix('boutique')->group(function () {

    Route::get('/dashboard/stats', [BoutiqueDashboardController::class, 'stats']);
        Route::get('/dashboard/charts', [BoutiqueDashboardController::class, 'charts']);
        
        Route::get('/ai-advisor/recommendations', [AIAdvisorController::class, 'recommendations']);
        
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    });
});