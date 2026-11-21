<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\PlatformOwnerAccess;
use App\Support\SecurityEventLogger;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePlatformOwner
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $authorized = $user instanceof User && PlatformOwnerAccess::canManage($user);

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
