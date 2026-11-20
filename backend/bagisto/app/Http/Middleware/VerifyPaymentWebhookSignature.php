<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyPaymentWebhookSignature
{
    public function handle(Request $request, Closure $next): Response
    {
        $secret = (string) config('services.commerceforge.payment_webhook_secret');
        $signature = (string) $request->header('X-CommerceForge-Signature');

        abort_if($secret === '' || $signature === '', 401);

        $expected = hash_hmac('sha256', $request->getContent(), $secret);
        abort_unless(hash_equals($expected, $signature), 401);

        return $next($request);
    }
}
