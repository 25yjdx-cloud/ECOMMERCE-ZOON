<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class EnsureOwnsStore
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $ownerEmail = strtolower(trim((string) config('commerceforge.owner_email')));
        $isPlatformOwner = $user instanceof User
            && $user->role === 'super_admin'
            && $ownerEmail !== ''
            && hash_equals($ownerEmail, strtolower($user->email));
        $isStoreOwner = $user instanceof User
            && $user->role === 'merchant'
            && is_string($user->store_slug)
            && hash_equals($user->store_slug, (string) $request->route('slug'))
            && DB::table('cf_stores')
                ->where('slug', $user->store_slug)
                ->where('owner_user_id', $user->id)
                ->exists();

        abort_unless($isPlatformOwner || $isStoreOwner, 403);

        return $next($request);
    }
}
