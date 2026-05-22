<?php

use App\Http\Controllers\API\ChatbotController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\CityController;
use App\Http\Controllers\API\BoutiqueController;
use App\Http\Controllers\API\ProductController;

// Cities
Route::get('/cities', [CityController::class, 'index']);
Route::get('/cities/{id}', [CityController::class, 'show']);

// Boutiques
Route::get('/boutiques', [BoutiqueController::class, 'index']);
Route::get('/boutiques/{id}', [BoutiqueController::class, 'show']);
Route::get('/cities/{cityId}/boutiques', [BoutiqueController::class, 'byCity']);

// Products
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/boutiques/{boutiqueId}/products', [ProductController::class, 'byBoutique']);
Route::post('/chatbot', [ChatbotController::class, 'chat']);