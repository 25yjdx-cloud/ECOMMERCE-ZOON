<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CommerceForgeNotificationService
{
    public function orderCreated(string $storeSlug, int $orderId, string $orderNumber, string $total): void
    {
        $store = DB::table('cf_stores')->where('slug', $storeSlug)->first();
        abort_unless($store, 404);

        $notificationId = $this->create([
            'recipient_role' => 'store_member',
            'store_slug' => $storeSlug,
            'event_key' => "order:{$orderId}:created:store:{$storeSlug}",
            'type' => 'new_order',
            'title_ar' => 'طلب جديد: '.$orderNumber,
            'title_en' => 'New order: '.$orderNumber,
            'body_ar' => 'وصل طلب جديد بقيمة '.$total.'.',
            'body_en' => 'A new order worth '.$total.' was placed.',
        ]);

        if ($notificationId !== null) {
            $owner = $store->owner_user_id === null
                ? null
                : DB::table('users')->where('id', $store->owner_user_id)->first();
            $this->sendWhatsApp($notificationId, $owner, 'order_template', [$orderNumber, $total]);
        }
    }

    public function storeCreated(int $storeId, string $storeSlug, int $ownerUserId, string $storeName): void
    {
        $owner = DB::table('users')->where('id', $ownerUserId)->first();
        $notificationId = $this->create([
            'recipient_user_id' => $ownerUserId,
            'store_slug' => $storeSlug,
            'event_key' => "store:{$storeId}:created:owner:{$ownerUserId}",
            'type' => 'store_created',
            'title_ar' => 'تم تسجيل متجرك',
            'title_en' => 'Your store is registered',
            'body_ar' => 'تم إنشاء متجر '.$storeName.' بنجاح.',
            'body_en' => 'The '.$storeName.' store was created successfully.',
        ]);

        if ($notificationId !== null) {
            $this->sendWhatsApp($notificationId, $owner, 'store_template', [$storeName]);
        }

        $this->create([
            'recipient_role' => 'super_admin',
            'store_slug' => $storeSlug,
            'event_key' => "store:{$storeId}:created:platform",
            'type' => 'store_registered',
            'title_ar' => 'متجر جديد على المنصة',
            'title_en' => 'A new store joined the platform',
            'body_ar' => 'تم تسجيل متجر '.$storeName.' ('.$storeSlug.').',
            'body_en' => 'The '.$storeName.' store ('.$storeSlug.') was registered.',
        ]);
    }

    private function create(array $notification): ?int
    {
        $now = now();
        $inserted = DB::table('cf_notifications')->insertOrIgnore([
            ...$notification,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        if ($inserted === 0) {
            return null;
        }

        return (int) DB::table('cf_notifications')
            ->where('event_key', $notification['event_key'])
            ->value('id');
    }

    private function sendWhatsApp(int $notificationId, ?object $recipient, string $templateConfigKey, array $parameters): void
    {
        $config = config('services.whatsapp');
        $phone = $recipient ? $this->normalizePhone($recipient->whatsapp_phone, $recipient->market) : null;
        $template = is_array($config) ? ($config[$templateConfigKey] ?? null) : null;
        $token = is_array($config) ? ($config['token'] ?? null) : null;
        $phoneNumberId = is_array($config) ? ($config['phone_number_id'] ?? null) : null;
        $version = is_array($config) ? ($config['graph_version'] ?? null) : null;

        if (! $phone || ! is_string($template) || $template === '' || ! is_string($token) || $token === ''
            || ! is_string($phoneNumberId) || $phoneNumberId === '' || ! is_string($version) || $version === '') {
            return;
        }

        try {
            $response = Http::withToken($token)
                ->acceptJson()
                ->timeout(6)
                ->post("https://graph.facebook.com/{$version}/{$phoneNumberId}/messages", [
                    'messaging_product' => 'whatsapp',
                    'to' => $phone,
                    'type' => 'template',
                    'template' => [
                        'name' => $template,
                        'language' => ['code' => config('services.whatsapp.language', 'ar')],
                        'components' => [[
                            'type' => 'body',
                            'parameters' => array_map(
                                fn (string $value) => ['type' => 'text', 'text' => $value],
                                $parameters,
                            ),
                        ]],
                    ],
                ]);
        } catch (ConnectionException) {
            $this->recordDeliveryFailure($notificationId, 'connection_error');

            return;
        }

        if (! $response->successful()) {
            $code = data_get($response->json(), 'error.code');
            $this->recordDeliveryFailure($notificationId, is_scalar($code) ? (string) $code : 'provider_error');

            return;
        }

        DB::table('cf_notifications')->where('id', $notificationId)->update([
            'whatsapp_status' => 'sent',
            'whatsapp_error_code' => null,
            'whatsapp_sent_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function recordDeliveryFailure(int $notificationId, string $errorCode): void
    {
        DB::table('cf_notifications')->where('id', $notificationId)->update([
            'whatsapp_status' => 'failed',
            'whatsapp_error_code' => mb_substr($errorCode, 0, 50),
            'updated_at' => now(),
        ]);

        Log::warning('CommerceForge WhatsApp notification delivery failed.', [
            'notification_id' => $notificationId,
            'error_code' => $errorCode,
        ]);
    }

    private function normalizePhone(?string $phone, ?string $market): ?string
    {
        if (! is_string($phone) || $phone === '') {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $phone);
        if (! is_string($digits) || $digits === '') {
            return null;
        }

        if ($market === 'EG' && str_starts_with($digits, '01')) {
            return '20'.substr($digits, 1);
        }

        if ($market === 'SA' && str_starts_with($digits, '05')) {
            return '966'.substr($digits, 1);
        }

        return $digits;
    }
}
