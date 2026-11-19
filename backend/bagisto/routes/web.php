<?php

use App\Http\Controllers\Api\V1\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('api/v1/auth/google')->middleware('throttle:10,1')->group(function () {
    Route::get('/redirect', [AuthController::class, 'googleRedirect']);
    Route::get('/callback', [AuthController::class, 'googleCallback']);
});
