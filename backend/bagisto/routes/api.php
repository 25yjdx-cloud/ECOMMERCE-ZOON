<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AiAssistantController;
use App\Http\Controllers\Api\V1\CommerceForgeController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Middleware\EnsurePlatformOwner;
use App\Http\Middleware\EnsureOwnsStore;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('throttle:120,1')->group(function () {
    Route::get('/templates', [CommerceForgeController::class, 'templates']);
    Route::get('/templates/{slug}', [CommerceForgeController::class, 'template']);
    Route::get('/stores/{slug}/config', [CommerceForgeController::class, 'storeConfig']);
    Route::get('/stores/{slug}/products', [CommerceForgeController::class, 'products']);
    Route::post('/orders', [CommerceForgeController::class, 'createOrder'])->middleware('throttle:10,1');
    Route::post('/orders/track', [CommerceForgeController::class, 'trackOrder'])->middleware('throttle:5,1');
    Route::post('/quote-requests', [CommerceForgeController::class, 'createQuote'])->middleware('throttle:5,1');
    Route::post('/leads', [CommerceForgeController::class, 'createQuote'])->middleware('throttle:5,1');
    Route::get('/notifications', [NotificationController::class, 'index'])->middleware('throttle:60,1');
    Route::post('/ai/assist', [AiAssistantController::class, 'assist'])->middleware('throttle:10,1');
    Route::middleware('auth:sanctum')
        ->post('/merchant/stores', [CommerceForgeController::class, 'createMerchantStore']);

    Route::middleware(['auth:sanctum', EnsurePlatformOwner::class])->group(function () {
        Route::get('/quote-requests', [CommerceForgeController::class, 'quotes']);
        Route::post('/stores/{slug}/clone', [CommerceForgeController::class, 'cloneStore']);
        Route::get('/admin/refinement-queue', [CommerceForgeController::class, 'refinementQueue']);
        Route::patch('/admin/stores/{slug}/refinement', [CommerceForgeController::class, 'updateRefinementStatus']);
    });

    Route::middleware(['auth:sanctum', EnsureOwnsStore::class])->group(function () {
        Route::put('/stores/{slug}/config', [CommerceForgeController::class, 'updateStoreConfig']);
        Route::get('/stores/{slug}/shipping-rates', [CommerceForgeController::class, 'shippingRates']);
        Route::put('/stores/{slug}/shipping-rates', [CommerceForgeController::class, 'updateShippingRates']);
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

    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,15');
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,15');
        Route::post('/firebase', [AuthController::class, 'firebaseGoogle'])->middleware('throttle:5,15');
        Route::post('/firebase-google', [AuthController::class, 'firebaseGoogle'])->middleware('throttle:5,15');
        Route::post('/google/exchange', [AuthController::class, 'exchangeGoogleCode'])->middleware('throttle:5,15');
        Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/two-factor/setup', [AuthController::class, 'setupTwoFactor']);
            Route::post('/two-factor/verify', [AuthController::class, 'verifyTwoFactor']);
            Route::delete('/two-factor', [AuthController::class, 'disableTwoFactor']);
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
