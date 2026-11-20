<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\SecurityEventLogger;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePlatformOwner
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $ownerEmail = strtolower(trim((string) config('commerceforge.owner_email')));

        $authorized = $user instanceof User
                && $user->role === 'super_admin'
                && $ownerEmail !== ''
                && hash_equals($ownerEmail, strtolower($user->email));

        SecurityEventLogger::record(
            $request,
            $authorized ? 'admin.access' : 'admin.access_denied',
            $authorized ? 'medium' : 'high',
            $user instanceof User ? $user->id : null,
        );

        abort_unless($authorized, 403, 'هذه الصفحة مخصصة لإدارة المنصة فقط.');

        return $next($request);
    }
}
