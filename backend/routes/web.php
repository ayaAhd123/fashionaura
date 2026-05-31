<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Auth des canaux privés Reverb (Sanctum Bearer ou session)
Broadcast::routes(['middleware' => ['auth:sanctum']]);
