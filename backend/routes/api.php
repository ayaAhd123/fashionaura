<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\CityController;
use App\Http\Controllers\API\BoutiqueController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\CartController;
use App\Http\Controllers\API\FavoriteController;
use App\Http\Controllers\API\BoutiqueFollowerController;
use App\Http\Controllers\API\ReviewController;

// Public Routes

// Cities
Route::get('/cities', [CityController::class, 'index']);
Route::get('/cities/{slug}', [CityController::class, 'show']);

// Boutiques
Route::get('/boutiques', [BoutiqueController::class, 'index']);
Route::get('/boutiques/{slug}', [BoutiqueController::class, 'show']);
Route::get('/boutiques-reviews/{id}', [BoutiqueController::class, 'reviews']);
Route::get('/cities/{cityId}/boutiques', [BoutiqueController::class, 'byCity']);

// Products
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/products-reviews/{id}', [ProductController::class, 'reviews']);
Route::get('/products-similar/{id}', [ProductController::class, 'similar']);
Route::get('/boutiques/{boutiqueId}/products', [ProductController::class, 'byBoutique']);

// Reviews
Route::post('/reviews', [ReviewController::class, 'store'])->middleware('auth:sanctum');

// Protected Routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::put('/cart/update/{cartItemId}', [CartController::class, 'update']);
    Route::delete('/cart/remove/{cartItemId}', [CartController::class, 'remove']);

    // Favorites (using product IDs)
    Route::post('/products/{productId}/favorite', [FavoriteController::class, 'add']);
    Route::delete('/products/{productId}/unfavorite', [FavoriteController::class, 'remove']);
    Route::get('/favorites', [FavoriteController::class, 'list']);
    Route::get('/products/{productId}/is-favorite', [FavoriteController::class, 'isFavorite']);

    // Boutique Followers (using boutique IDs)
    Route::post('/boutiques/{boutiqueId}/follow', [BoutiqueFollowerController::class, 'follow']);
    Route::delete('/boutiques/{boutiqueId}/unfollow', [BoutiqueFollowerController::class, 'unfollow']);
    Route::get('/boutiques/{boutiqueId}/is-following', [BoutiqueFollowerController::class, 'isFollowing']);
});