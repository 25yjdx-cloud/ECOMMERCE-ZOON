<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class EnsureMerchantWorkspace
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User && $user->role === 'merchant' && is_string($user->store_slug), 403);

        $store = DB::table('cf_stores')->where('slug', $user->store_slug)->first();
        $isOwner = $store && (int) $store->owner_user_id === (int) $user->id && $user->member_role === 'owner';
        $isMember = in_array($user->member_role, ['manager', 'staff', 'order_manager'], true);
        abort_unless($store && ($isOwner || $isMember), 403);

        $request->attributes->set('merchant_store', $store);

        return $next($request);
    }
}
