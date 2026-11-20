<?php

namespace App\Support;

use App\Models\SecurityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SecurityEventLogger
{
    public static function record(
        Request $request,
        string $event,
        string $severity = 'medium',
        ?int $userId = null,
        ?string $identifier = null,
        array $context = [],
    ): void {
        $identifierHash = $identifier === null ? null : hash('sha256', mb_strtolower(trim($identifier)));
        $userAgent = mb_substr((string) $request->userAgent(), 0, 500);

        SecurityLog::query()->create([
            'user_id' => $userId,
            'event' => $event,
            'severity' => $severity,
            'identifier_hash' => $identifierHash,
            'ip_address' => $request->ip(),
            'user_agent' => $userAgent,
            'context' => $context,
        ]);

        Log::channel('security')->log($severity === 'high' ? 'critical' : 'warning', $event, [
            'user_id' => $userId,
            'identifier_hash' => $identifierHash,
            'ip_address' => $request->ip(),
            'user_agent' => $userAgent,
            'context' => $context,
        ]);
    }
}
