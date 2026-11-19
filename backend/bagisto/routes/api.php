<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CommerceForgeController;
use App\Http\Middleware\EnsurePlatformOwner;
use App\Http\Middleware\EnsureOwnsStore;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/templates', [CommerceForgeController::class, 'templates']);
    Route::get('/templates/{slug}', [CommerceForgeController::class, 'template']);
    Route::get('/stores/{slug}/config', [CommerceForgeController::class, 'storeConfig']);
    Route::get('/stores/{slug}/products', [CommerceForgeController::class, 'products']);
    Route::post('/orders', [CommerceForgeController::class, 'createOrder'])->middleware('throttle:10,1');
    Route::post('/quote-requests', [CommerceForgeController::class, 'createQuote'])->middleware('throttle:5,1');

    Route::middleware(['auth:sanctum', EnsurePlatformOwner::class])->group(function () {
        Route::get('/quote-requests', [CommerceForgeController::class, 'quotes']);
        Route::put('/stores/{slug}/config', [CommerceForgeController::class, 'updateStoreConfig']);
        Route::post('/stores/{slug}/clone', [CommerceForgeController::class, 'cloneStore']);
        Route::post('/stores/{slug}/products', [CommerceForgeController::class, 'createProduct']);
        Route::put('/stores/{slug}/products/{product}', [CommerceForgeController::class, 'updateProduct']);
        Route::delete('/stores/{slug}/products/{product}', [CommerceForgeController::class, 'deleteProduct']);
        Route::get('/stores/{slug}/categories', [CommerceForgeController::class, 'categories']);
        Route::post('/stores/{slug}/categories', [CommerceForgeController::class, 'createCategory']);
        Route::put('/stores/{slug}/categories/{category}', [CommerceForgeController::class, 'updateCategory']);
        Route::delete('/stores/{slug}/categories/{category}', [CommerceForgeController::class, 'deleteCategory']);
        Route::get('/stores/{slug}/orders', [CommerceForgeController::class, 'orders']);
        Route::patch('/stores/{slug}/orders/{order}', [CommerceForgeController::class, 'updateOrderStatus']);
    });

    Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/firebase-google', [AuthController::class, 'firebaseGoogle']);
        Route::post('/google/exchange', [AuthController::class, 'exchangeGoogleCode']);
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    Route::middleware(['auth:sanctum', EnsurePlatformOwner::class])
        ->prefix('admin')
        ->group(function () {
            Route::get('/access-check', fn () => response()->json(['authorized' => true]));
        });

    Route::middleware(['auth:sanctum', EnsureOwnsStore::class])
        ->get('/stores/{slug}/access-check', fn () => response()->json(['authorized' => true]));
});
