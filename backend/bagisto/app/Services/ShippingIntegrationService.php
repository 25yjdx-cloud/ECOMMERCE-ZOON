<?php

namespace App\Services;

use App\Exceptions\ShippingProviderException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use JsonException;

class ShippingIntegrationService
{
    private const PROVIDERS = ['bosta', 'oto', 'manual'];

    public function settings(string $storeSlug): array
    {
        $rows = DB::table('cf_store_shipping_integrations')
            ->where('store_slug', $storeSlug)
            ->get()
            ->keyBy('provider');

        return array_map(function (string $provider) use ($rows, $storeSlug) {
            $row = $rows->get($provider);
            $credentials = $row ? $this->decodeCredentials($row->credentials) : [];

            return [
                'provider' => $provider,
                'enabled' => $provider === 'manual' || (bool) ($row?->enabled ?? false),
                'configured' => $provider === 'manual'
                    || ($row !== null && isset($credentials['api_key']) && $credentials['api_key'] !== ''),
                'business_location_id' => $credentials['business_location_id'] ?? null,
                'package_type' => $credentials['package_type'] ?? null,
                'delivery_option_id' => $credentials['delivery_option_id'] ?? null,
                'pickup_location_code' => $credentials['pickup_location_code'] ?? null,
                'sender_name' => $credentials['sender_name'] ?? null,
                'webhook_url' => $this->webhookUrl($provider),
            ];
        }, self::PROVIDERS);
    }

    public function update(string $storeSlug, array $data): array
    {
        $provider = $data['provider'];
        $existing = DB::table('cf_store_shipping_integrations')
            ->where('store_slug', $storeSlug)
            ->where('provider', $provider)
            ->first();
        $credentials = $existing ? $this->decodeCredentials($existing->credentials) : [];

        foreach ([
            'api_key',
            'business_location_id',
            'package_type',
            'delivery_option_id',
            'pickup_location_code',
            'sender_name',
        ] as $key) {
            if (isset($data[$key]) && $data[$key] !== '') {
                $credentials[$key] = $data[$key];
            }
        }

        $credentials['webhook_secret'] = $credentials['webhook_secret'] ?? Str::random(64);
        $this->assertIntegrationCanBeEnabled($provider, (bool) $data['enabled'], $credentials);

        $now = now();
        DB::table('cf_store_shipping_integrations')->updateOrInsert(
            ['store_slug' => $storeSlug, 'provider' => $provider],
            [
                'enabled' => (bool) $data['enabled'],
                'credentials' => Crypt::encryptString(json_encode($credentials, JSON_THROW_ON_ERROR)),
                'webhook_secret_hash' => hash('sha256', $credentials['webhook_secret']),
                'created_at' => $existing?->created_at ?? $now,
                'updated_at' => $now,
            ],
        );

        if ($provider === 'oto' && (bool) $data['enabled']) {
            $this->registerOtoWebhook($credentials, $storeSlug);
        }

        return $this->settings($storeSlug);
    }

    public function createShipment(string $storeSlug, int $orderId, array $data): array
    {
        $order = DB::table('cf_orders')
            ->where('store_slug', $storeSlug)
            ->where('id', $orderId)
            ->first();
        abort_unless($order, 404);

        $provider = $data['provider'];
        $existing = DB::table('cf_shipments')
            ->where('store_slug', $storeSlug)
            ->where('order_id', $orderId)
            ->where('provider', $provider)
            ->first();
        if ($existing) {
            return $this->presentShipment($existing);
        }

        $integration = $provider === 'manual'
            ? null
            : DB::table('cf_store_shipping_integrations')
                ->where('store_slug', $storeSlug)
                ->where('provider', $provider)
                ->where('enabled', true)
                ->first();
        abort_if($provider !== 'manual' && ! $integration, 409, 'Shipping provider is not configured for this store.');

        $credentials = $integration ? $this->decodeCredentials($integration->credentials) : [];
        $shipmentId = DB::table('cf_shipments')->insertGetId([
            'store_slug' => $storeSlug,
            'order_id' => $orderId,
            'provider' => $provider,
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        try {
            $result = match ($provider) {
                'bosta' => $this->createBostaShipment($order, $credentials, $storeSlug),
                'oto' => $this->createOtoShipment($order, $credentials, $storeSlug),
                'manual' => [
                    'provider_shipment_id' => null,
                    'tracking_number' => $data['tracking_number'],
                    'label_url' => $data['label_url'] ?? null,
                    'label_payload' => null,
                    'label_mime_type' => null,
                ],
            };
        } catch (ShippingProviderException $exception) {
            DB::table('cf_shipments')->where('id', $shipmentId)->update([
                'status' => 'failed',
                'error_code' => $exception->getMessage(),
                'updated_at' => now(),
            ]);

            throw $exception;
        }

        DB::table('cf_shipments')->where('id', $shipmentId)->update([
            'provider_shipment_id' => $result['provider_shipment_id'],
            'tracking_number' => $result['tracking_number'],
            'status' => 'shipped',
            'label_url' => $result['label_url'],
            'label_payload' => is_string($result['label_payload'])
                ? Crypt::encryptString($result['label_payload'])
                : null,
            'label_mime_type' => $result['label_mime_type'],
            'error_code' => null,
            'updated_at' => now(),
        ]);
        DB::table('cf_orders')->where('id', $orderId)->where('store_slug', $storeSlug)->update([
            'status' => 'shipped',
            'updated_at' => now(),
        ]);

        return $this->presentShipment(DB::table('cf_shipments')->where('id', $shipmentId)->first());
    }

    public function processWebhook(string $provider, Request $request): array
    {
        abort_unless(in_array($provider, ['bosta', 'oto'], true), 404);
        try {
            $payload = json_decode($request->getContent(), true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            abort(400, 'Invalid webhook payload.');
        }
        abort_unless(is_array($payload), 400);

        $orderReference = $this->orderReference($payload);
        abort_unless($orderReference, 422, 'Missing order reference.');
        $order = DB::table('cf_orders')->where('order_number', $orderReference)->first();
        abort_unless($order, 404);

        $integration = DB::table('cf_store_shipping_integrations')
            ->where('store_slug', $order->store_slug)
            ->where('provider', $provider)
            ->where('enabled', true)
            ->first();
        abort_unless($integration, 404);
        $providedSecret = trim((string) $request->header('Authorization', ''));
        if (str_starts_with(strtolower($providedSecret), 'bearer ')) {
            $providedSecret = trim(substr($providedSecret, 7));
        }
        abort_unless(
            $providedSecret !== '' && hash_equals($integration->webhook_secret_hash, hash('sha256', $providedSecret)),
            401,
        );

        $shipment = DB::table('cf_shipments')
            ->where('store_slug', $order->store_slug)
            ->where('order_id', $order->id)
            ->where('provider', $provider)
            ->first();
        abort_unless($shipment, 404);

        $eventKey = $this->eventKey($provider, $payload, $request->getContent());
        $status = $this->mapStatus($payload);
        $duplicate = DB::transaction(function () use ($provider, $eventKey, $shipment, $order, $status, $payload) {
            if (DB::table('cf_shipping_webhook_events')
                ->where('provider', $provider)
                ->where('event_key', $eventKey)
                ->exists()) {
                return true;
            }

            DB::table('cf_shipping_webhook_events')->insert([
                'provider' => $provider,
                'event_key' => $eventKey,
                'processed_at' => now(),
            ]);
            DB::table('cf_shipments')->where('id', $shipment->id)->update([
                'status' => $status,
                'tracking_number' => $this->trackingNumber($payload) ?? $shipment->tracking_number,
                'updated_at' => now(),
            ]);

            if (in_array($status, ['delivered', 'shipped'], true)) {
                DB::table('cf_orders')->where('id', $order->id)->where('store_slug', $order->store_slug)->update([
                    'status' => $status,
                    'updated_at' => now(),
                ]);
            }

            return false;
        });

        return ['accepted' => true, 'duplicate' => $duplicate];
    }

    private function createBostaShipment(object $order, array $credentials, string $storeSlug): array
    {
        $items = json_decode($order->items, true, flags: JSON_THROW_ON_ERROR);
        $itemsCount = array_sum(array_map(fn (array $item) => (int) ($item['quantity'] ?? 0), $items));
        $webhookSecret = $credentials['webhook_secret'];
        $response = $this->carrierRequest(
            'https://app.bosta.co/api/v2/deliveries?apiVersion=1',
            $credentials['api_key'],
            [
                'type' => 10,
                'businessLocationId' => $credentials['business_location_id'],
                'businessReference' => $order->order_number,
                'cod' => (float) $order->total,
                'dropOffAddress' => [
                    'firstLine' => $order->address,
                    'city' => $order->governorate,
                    'zone' => $order->governorate,
                    'district' => $order->governorate,
                ],
                'receiver' => [
                    'firstName' => $order->customer_name,
                    'phone' => $order->phone,
                ],
                'specs' => [
                    'packageType' => $credentials['package_type'],
                    'packageDetails' => [
                        'description' => 'Order '.$order->order_number,
                        'itemsCount' => max(1, $itemsCount),
                    ],
                ],
                'webhookUrl' => $this->webhookUrl('bosta'),
                'webhookCustomHeaders' => ['Authorization' => $webhookSecret],
            ],
        );
        $trackingNumber = data_get($response, 'data.trackingNumber') ?? data_get($response, 'trackingNumber');
        $providerId = data_get($response, 'data._id') ?? data_get($response, '_id');
        if (! is_string($trackingNumber) && ! is_numeric($trackingNumber)) {
            throw new ShippingProviderException('Bosta did not return a tracking number.');
        }

        $label = $this->getBostaLabel((string) $trackingNumber, $credentials['api_key']);

        return [
            'provider_shipment_id' => is_scalar($providerId) ? (string) $providerId : null,
            'tracking_number' => (string) $trackingNumber,
            'label_url' => $label['url'],
            'label_payload' => $label['payload'],
            'label_mime_type' => $label['mime_type'],
        ];
    }

    private function createOtoShipment(object $order, array $credentials, string $storeSlug): array
    {
        $store = DB::table('cf_stores')->where('slug', $storeSlug)->first();
        $storeConfig = json_decode($store->config, true, flags: JSON_THROW_ON_ERROR);
        $market = $storeConfig['market'] ?? 'EG';
        $items = json_decode($order->items, true, flags: JSON_THROW_ON_ERROR);
        $this->carrierRequest('https://api.tryoto.com/rest/v2/createOrder', $credentials['api_key'], [
            'orderId' => $order->order_number,
            'pickupLocationCode' => $credentials['pickup_location_code'],
            'createShipment' => false,
            'deliveryOptionId' => $credentials['delivery_option_id'],
            'payment_method' => 'COD',
            'amount' => (float) $order->total,
            'amount_due' => (float) $order->total,
            'currency' => $market === 'SA' ? 'SAR' : 'EGP',
            'shippingAmount' => (float) $order->shipping_fee,
            'subtotal' => (float) $order->subtotal,
            'senderName' => $credentials['sender_name'],
            'customer' => [
                'name' => $order->customer_name,
                'mobile' => $order->phone,
                'address' => [
                    'address' => $order->address,
                    'city' => $order->governorate,
                    'country' => $market === 'SA' ? 'SA' : 'EG',
                ],
            ],
            'items' => array_map(fn (array $item) => [
                'name' => $item['name_en'] ?? $item['name_ar'] ?? 'Item',
                'price' => (float) ($item['unit_price'] ?? 0),
                'rowTotal' => (float) ($item['line_total'] ?? 0),
                'quantity' => (int) ($item['quantity'] ?? 1),
            ], $items),
        ]);
        $shipmentResponse = $this->carrierRequest(
            'https://api.tryoto.com/rest/v2/createShipment',
            $credentials['api_key'],
            [
                'orderId' => $order->order_number,
                'deliveryOptionId' => $credentials['delivery_option_id'],
            ],
        );
        try {
            $printResponse = $this->carrierGet(
                'https://api.tryoto.com/rest/v2/print/'.rawurlencode($order->order_number),
                $credentials['api_key'],
            );
        } catch (ShippingProviderException) {
            Log::warning('OTO created a shipment but did not return its label.', ['order_id' => $order->id]);
            $printResponse = [];
        }
        $trackingNumber = data_get($printResponse, 'trackingNumber')
            ?? data_get($shipmentResponse, 'trackingNumber')
            ?? data_get($shipmentResponse, 'otoId');
        $labelUrl = data_get($printResponse, 'printAWBURL');
        if (! is_string($trackingNumber) && ! is_numeric($trackingNumber)) {
            throw new ShippingProviderException('OTO did not return a tracking number.');
        }

        return [
            'provider_shipment_id' => is_scalar(data_get($shipmentResponse, 'otoId'))
                ? (string) data_get($shipmentResponse, 'otoId')
                : null,
            'tracking_number' => (string) $trackingNumber,
            'label_url' => is_string($labelUrl) ? $labelUrl : null,
            'label_payload' => null,
            'label_mime_type' => null,
        ];
    }

    private function getBostaLabel(string $trackingNumber, string $apiKey): array
    {
        try {
            $response = Http::withHeaders(['Authorization' => $apiKey])
                ->acceptJson()
                ->timeout(15)
                ->post('https://app.bosta.co/api/v2/deliveries/mass-awb', [
                    'trackingNumbers' => $trackingNumber,
                    'requestedAwbType' => 'A4',
                    'lang' => 'ar',
                ]);
        } catch (ConnectionException) {
            return ['url' => null, 'payload' => null, 'mime_type' => null];
        }

        if (! $response->successful()) {
            return ['url' => null, 'payload' => null, 'mime_type' => null];
        }

        $body = $response->json();
        $payload = data_get($body, 'data.pdf')
            ?? data_get($body, 'data.base64')
            ?? data_get($body, 'pdf')
            ?? data_get($body, 'base64');
        $url = data_get($body, 'data.url') ?? data_get($body, 'url');

        return [
            'url' => is_string($url) && filter_var($url, FILTER_VALIDATE_URL) ? $url : null,
            'payload' => is_string($payload) && $payload !== '' ? $payload : null,
            'mime_type' => is_string($payload) && $payload !== '' ? 'application/pdf' : null,
        ];
    }

    private function registerOtoWebhook(array $credentials, string $storeSlug): void
    {
        $this->carrierRequest('https://api.tryoto.com/rest/v2/webhook', $credentials['api_key'], [
            'method' => 'post',
            'url' => $this->webhookUrl('oto'),
            'orderPrefix' => $storeSlug,
            'timestampFormat' => 'Y-m-d H:i:s',
            'secretKey' => $credentials['webhook_secret'],
            'authorizationKey' => $credentials['webhook_secret'],
            'webhookType' => 'orderStatus',
        ]);
    }

    private function carrierRequest(string $url, string $apiKey, array $payload): array
    {
        try {
            $response = Http::withHeaders(['Authorization' => $apiKey])
                ->acceptJson()
                ->timeout(15)
                ->post($url, $payload);
        } catch (ConnectionException) {
            throw new ShippingProviderException('Shipping provider connection failed.');
        }

        if (! $response->successful()) {
            throw new ShippingProviderException('Shipping provider rejected the request ('.$response->status().').');
        }

        $body = $response->json();
        if (! is_array($body) || ($body['success'] ?? true) === false) {
            throw new ShippingProviderException('Shipping provider returned an invalid response.');
        }

        return $body;
    }

    private function carrierGet(string $url, string $apiKey): array
    {
        try {
            $response = Http::withHeaders(['Authorization' => $apiKey])
                ->acceptJson()
                ->timeout(15)
                ->get($url);
        } catch (ConnectionException) {
            throw new ShippingProviderException('Shipping provider connection failed.');
        }

        if (! $response->successful() || ! is_array($response->json())) {
            throw new ShippingProviderException('Shipping provider label request failed.');
        }

        return $response->json();
    }

    private function assertIntegrationCanBeEnabled(string $provider, bool $enabled, array $credentials): void
    {
        if (! $enabled || $provider === 'manual') {
            return;
        }

        $required = $provider === 'bosta'
            ? ['api_key', 'business_location_id', 'package_type']
            : ['api_key', 'delivery_option_id', 'pickup_location_code', 'sender_name'];
        foreach ($required as $key) {
            abort_if(! isset($credentials[$key]) || $credentials[$key] === '', 422, 'Complete the required shipping provider settings.');
        }
    }

    private function decodeCredentials(string $encrypted): array
    {
        $decoded = json_decode(Crypt::decryptString($encrypted), true, flags: JSON_THROW_ON_ERROR);

        return is_array($decoded) ? $decoded : [];
    }

    private function presentShipment(object $shipment): array
    {
        return [
            'id' => $shipment->id,
            'provider' => $shipment->provider,
            'provider_shipment_id' => $shipment->provider_shipment_id,
            'tracking_number' => $shipment->tracking_number,
            'status' => $shipment->status,
            'label_url' => $shipment->label_url,
            'label_data' => is_string($shipment->label_payload)
                ? Crypt::decryptString($shipment->label_payload)
                : null,
            'label_mime_type' => $shipment->label_mime_type,
        ];
    }

    private function webhookUrl(string $provider): string
    {
        return rtrim((string) config('services.commerceforge.storefront_url'), '/')
            .'/api/webhooks/shipping/'.$provider;
    }

    private function orderReference(array $payload): ?string
    {
        foreach (['businessReference', 'orderId', 'order_id', 'reference', 'refID'] as $key) {
            if (isset($payload[$key]) && is_scalar($payload[$key])) {
                return (string) $payload[$key];
            }
        }

        return null;
    }

    private function trackingNumber(array $payload): ?string
    {
        foreach (['trackingNumber', 'tracking_number', 'awb', 'shipmentId', '_id'] as $key) {
            if (isset($payload[$key]) && is_scalar($payload[$key])) {
                return (string) $payload[$key];
            }
        }

        return null;
    }

    private function mapStatus(array $payload): string
    {
        if (($payload['isConfirmedDelivery'] ?? false) === true) {
            return 'delivered';
        }

        $raw = $payload['status'] ?? $payload['state'] ?? $payload['event'] ?? '';
        $status = strtolower((string) $raw);
        if (str_contains($status, 'deliver')) {
            return 'delivered';
        }
        if (str_contains($status, 'cancel') || str_contains($status, 'return')) {
            return 'cancelled';
        }

        return 'shipped';
    }

    private function eventKey(string $provider, array $payload, string $rawBody): string
    {
        $eventId = $payload['eventId'] ?? $payload['event_id'] ?? $payload['id'] ?? null;
        if (is_scalar($eventId)) {
            return hash('sha256', $provider.':'.(string) $eventId);
        }

        return hash('sha256', $provider.':'.$rawBody);
    }
}
