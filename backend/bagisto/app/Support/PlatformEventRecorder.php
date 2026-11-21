<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Throwable;

class PlatformEventRecorder
{
    private const TYPES = [
        'new_signup', 'plan_free_activated', 'plan_paid_confirmed', 'store_generated',
        'template_generated', 'order_created', 'return_requested',
        'store_visual_updated', 'store_suspended', 'store_activated', 'template_status_changed',
    ];

    public function record(string $type, ?int $actorId = null, ?string $storeSlug = null, ?string $subject = null, array $metadata = []): void
    {
        if (! in_array($type, self::TYPES, true) || ! DB::getSchemaBuilder()->hasTable('cf_platform_events')) {
            return;
        }

        unset($metadata['email'], $metadata['phone'], $metadata['whatsapp'], $metadata['token'], $metadata['password']);
        try {
            $eventId = DB::table('cf_platform_events')->insertGetId([
                'event_type' => $type,
                'actor_user_id' => $actorId,
                'store_slug' => $storeSlug,
                'subject' => $subject ? mb_substr($subject, 0, 180) : null,
                'metadata' => $metadata === [] ? null : json_encode($metadata, JSON_THROW_ON_ERROR),
                'created_at' => now(),
            ]);
            $integration = DB::table('cf_platform_integrations')->where('integration_key', 'google_sheets')->first();
            if ($integration?->enabled && $integration->encrypted_value) {
                $url = Crypt::decryptString($integration->encrypted_value);
                $host = strtolower((string) parse_url($url, PHP_URL_HOST));
                $safeHost = $host === 'script.google.com' || $host === 'hooks.zapier.com' || preg_match('/^hook\.[a-z0-9-]+\.make\.com$/', $host) === 1;
                if ($safeHost && parse_url($url, PHP_URL_SCHEME) === 'https') {
                    Http::acceptJson()->timeout(2)->post($url, [
                        'id' => $eventId,
                        'event' => $type,
                        'actor_user_id' => $actorId,
                        'store_slug' => $storeSlug,
                        'subject' => $subject,
                        'metadata' => $metadata,
                        'created_at' => now()->toIso8601String(),
                    ]);
                }
            }
        } catch (Throwable $exception) {
            report($exception);
        }
    }
}
