<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AiAssistantController;
use App\Http\Controllers\Api\V1\CommerceForgeController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PlatformTelemetryController;
use App\Http\Controllers\Api\V1\PlatformIntegrationController;
use App\Http\Controllers\Api\V1\ShippingController;
use App\Http\Controllers\Api\V1\MerchantWorkspaceController;
use App\Http\Middleware\EnsurePlatformOwner;
use App\Http\Middleware\EnsureOwnsStore;
use App\Http\Middleware\EnsureStoreManager;
use App\Http\Middleware\EnsureMerchantWorkspace;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('throttle:120,1')->group(function () {
    Route::post('/telemetry/heartbeat', [PlatformTelemetryController::class, 'heartbeat'])->middleware('throttle:60,1');
    Route::get('/templates', [CommerceForgeController::class, 'templates']);
    Route::get('/templates/{slug}', [CommerceForgeController::class, 'template']);
    Route::get('/stores/{slug}/config', [CommerceForgeController::class, 'storeConfig']);
    Route::get('/stores/{slug}/products', [CommerceForgeController::class, 'products']);
    Route::get('/stores/{slug}/build-payload', [CommerceForgeController::class, 'buildPayload']);
    Route::post('/orders', [CommerceForgeController::class, 'createOrder'])->middleware('throttle:10,1');
    Route::post('/orders/track', [CommerceForgeController::class, 'trackOrder'])->middleware('throttle:5,1');
    Route::post('/stores/{slug}/returns', [CommerceForgeController::class, 'createReturnRequest'])->middleware('throttle:5,1');
    Route::post('/quote-requests', [CommerceForgeController::class, 'createQuote'])->middleware('throttle:5,1');
    Route::post('/leads', [CommerceForgeController::class, 'createQuote'])->middleware('throttle:5,1');
    Route::post('/webhooks/shipping/{provider}', [ShippingController::class, 'webhook'])
        ->whereIn('provider', ['bosta', 'oto']);
    Route::post('/ai/assist', [AiAssistantController::class, 'assist'])->middleware('throttle:10,1');
    Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
        Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
    });
    Route::middleware(['auth:sanctum', EnsureMerchantWorkspace::class, 'throttle:60,1'])
        ->prefix('merchant')
        ->group(function () {
            Route::get('/search', [MerchantWorkspaceController::class, 'search']);
            Route::get('/orders', [MerchantWorkspaceController::class, 'orders']);
            Route::post('/orders', [MerchantWorkspaceController::class, 'createOrder']);
            Route::patch('/orders/{order}', [MerchantWorkspaceController::class, 'updateOrder']);
            Route::post('/orders/{order}/waybill', [MerchantWorkspaceController::class, 'createWaybill']);
            Route::get('/returns', [MerchantWorkspaceController::class, 'returns']);
            Route::patch('/returns/{return}', [MerchantWorkspaceController::class, 'updateReturn']);
            Route::get('/products', [MerchantWorkspaceController::class, 'products']);
            Route::post('/products', [MerchantWorkspaceController::class, 'saveProduct']);
            Route::put('/products/{product}', [MerchantWorkspaceController::class, 'updateProduct']);
            Route::delete('/products/{product}', [MerchantWorkspaceController::class, 'deleteProduct']);
            Route::get('/collections', [MerchantWorkspaceController::class, 'collections']);
            Route::post('/collections', [MerchantWorkspaceController::class, 'createCollection']);
            Route::put('/collections/{collection}', [MerchantWorkspaceController::class, 'updateCollection']);
            Route::delete('/collections/{collection}', [MerchantWorkspaceController::class, 'deleteCollection']);
            Route::get('/files', [MerchantWorkspaceController::class, 'files']);
            Route::post('/files', [MerchantWorkspaceController::class, 'uploadFile']);
            Route::delete('/files/{file}', [MerchantWorkspaceController::class, 'deleteFile']);
            Route::get('/storefront', [MerchantWorkspaceController::class, 'storefront']);
            Route::put('/storefront', [MerchantWorkspaceController::class, 'updateStorefront']);
            Route::post('/storefront/domain/verify', [MerchantWorkspaceController::class, 'verifyDomain']);
            Route::post('/storefront/review-request', [MerchantWorkspaceController::class, 'requestRefinement']);
            Route::get('/analytics', [MerchantWorkspaceController::class, 'analytics']);
            Route::get('/coupons', [MerchantWorkspaceController::class, 'coupons']);
            Route::post('/coupons', [MerchantWorkspaceController::class, 'coupons']);
            Route::patch('/coupons/{coupon}', [MerchantWorkspaceController::class, 'coupons']);
            Route::delete('/coupons/{coupon}', [MerchantWorkspaceController::class, 'coupons']);
            Route::get('/staff', [MerchantWorkspaceController::class, 'staff']);
            Route::post('/staff', [MerchantWorkspaceController::class, 'staff']);
            Route::delete('/staff/{staff}', [MerchantWorkspaceController::class, 'staff']);
            Route::post('/plan-upgrade', [MerchantWorkspaceController::class, 'planUpgrade']);
        });
    Route::middleware(['auth:sanctum', 'throttle:20,1'])
        ->post('/merchant/staff/accept/{token}', [MerchantWorkspaceController::class, 'acceptStaffInvite']);
    Route::middleware('auth:sanctum')
        ->post('/merchant/stores', [CommerceForgeController::class, 'createMerchantStore']);

    Route::middleware(['auth:sanctum', EnsurePlatformOwner::class])->group(function () {
        Route::get('/admin/live-radar', [PlatformTelemetryController::class, 'radar']);
        Route::get('/admin/events', [PlatformTelemetryController::class, 'events']);
        Route::get('/admin/audit', [PlatformTelemetryController::class, 'audit']);
        Route::get('/admin/stores', [PlatformTelemetryController::class, 'stores']);
        Route::get('/admin/templates', [PlatformTelemetryController::class, 'templates']);
        Route::patch('/admin/templates/{slug}', [PlatformTelemetryController::class, 'updateTemplate']);
        Route::put('/admin/stores/{slug}/visual-config', [PlatformTelemetryController::class, 'updateStore']);
        Route::match(['get', 'put', 'post'], '/admin/integrations/google-sheets', [PlatformIntegrationController::class, 'googleSheets']);
        Route::get('/admin/exports/{dataset}', [PlatformIntegrationController::class, 'export']);
        Route::get('/quote-requests', [CommerceForgeController::class, 'quotes']);
        Route::post('/stores/{slug}/clone', [CommerceForgeController::class, 'cloneStore']);
        Route::get('/admin/refinement-queue', [CommerceForgeController::class, 'refinementQueue']);
        Route::patch('/admin/stores/{slug}/refinement', [CommerceForgeController::class, 'updateRefinementStatus']);
    });

    Route::middleware(['auth:sanctum', EnsureOwnsStore::class])->group(function () {
        Route::get('/stores/{slug}/shipping-rates', [CommerceForgeController::class, 'shippingRates']);
        Route::get('/stores/{slug}/categories', [CommerceForgeController::class, 'categories']);
        Route::get('/stores/{slug}/orders', [CommerceForgeController::class, 'orders']);
        Route::patch('/stores/{slug}/orders/{order}', [CommerceForgeController::class, 'updateOrderStatus']);
        Route::get('/stores/{slug}/shipping/integrations', [ShippingController::class, 'integrations']);
        Route::post('/stores/{slug}/orders/{order}/shipments', [ShippingController::class, 'createShipment']);
        Route::middleware(EnsureStoreManager::class)->group(function () {
            Route::put('/stores/{slug}/config', [CommerceForgeController::class, 'updateStoreConfig']);
            Route::put('/stores/{slug}/shipping-rates', [CommerceForgeController::class, 'updateShippingRates']);
            Route::put('/stores/{slug}/shipping/integrations', [ShippingController::class, 'updateIntegration']);
            Route::post('/stores/{slug}/products', [CommerceForgeController::class, 'createProduct']);
            Route::put('/stores/{slug}/products/{product}', [CommerceForgeController::class, 'updateProduct']);
            Route::delete('/stores/{slug}/products/{product}', [CommerceForgeController::class, 'deleteProduct']);
            Route::post('/stores/{slug}/categories', [CommerceForgeController::class, 'createCategory']);
            Route::put('/stores/{slug}/categories/{category}', [CommerceForgeController::class, 'updateCategory']);
            Route::delete('/stores/{slug}/categories/{category}', [CommerceForgeController::class, 'deleteCategory']);
        });
    });

    Route::prefix('auth')->group(function () {
        $authThrottle = app()->environment('local') ? 'throttle:60,1' : 'throttle:5,15';
        Route::post('/register', [AuthController::class, 'register'])->middleware($authThrottle);
        Route::post('/login', [AuthController::class, 'login'])->middleware($authThrottle);
        Route::post('/firebase', [AuthController::class, 'firebaseGoogle'])->middleware($authThrottle);
        Route::post('/firebase-google', [AuthController::class, 'firebaseGoogle'])->middleware($authThrottle);
        Route::post('/google/exchange', [AuthController::class, 'exchangeGoogleCode'])->middleware($authThrottle);
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

    Route::post('/webhooks/shipping/{provider}', [ShippingController::class, 'webhook'])
        ->middleware('throttle:120,1')
        ->whereIn('provider', ['bosta', 'oto']);
