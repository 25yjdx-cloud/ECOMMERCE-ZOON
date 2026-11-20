<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class EnsureStoreManager
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $slug = (string) $request->route('slug');
        $ownerEmail = strtolower(trim((string) config('commerceforge.owner_email')));
        $isPlatformOwner = $user instanceof User
            && $user->role === 'super_admin'
            && $ownerEmail !== ''
            && hash_equals($ownerEmail, strtolower($user->email));
        $isStoreManager = $user instanceof User
            && $user->role === 'merchant'
            && in_array($user->member_role, ['owner', 'manager'], true)
            && is_string($user->store_slug)
            && hash_equals($user->store_slug, $slug)
            && DB::table('cf_stores')->where('slug', $slug)->exists();

        abort_unless($isPlatformOwner || $isStoreManager, 403);

        return $next($request);
    }
}
