<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class PlatformIntegrationController extends Controller
{
    public function googleSheets(Request $request): JsonResponse
    {
        if ($request->isMethod('get')) {
            $setting = DB::table('cf_platform_integrations')->where('integration_key', 'google_sheets')->first();
            return response()->json([
                'enabled' => (bool) ($setting?->enabled ?? false),
                'url' => $setting?->encrypted_value ? Crypt::decryptString($setting->encrypted_value) : '',
            ]);
        }

        $data = $request->validate([
            'url' => ['nullable', 'url', 'max:2048'],
            'enabled' => ['required', 'boolean'],
            'test' => ['sometimes', 'boolean'],
        ]);
        if ($request->isMethod('put')) {
            $url = trim((string) ($data['url'] ?? ''));
            if ($data['enabled'] && ! $this->isAllowedWebhook($url)) {
                return response()->json(['message' => 'Use HTTPS with a Google Apps Script, Zapier, or Make webhook URL.'], 422);
            }
            DB::table('cf_platform_integrations')->updateOrInsert(
                ['integration_key' => 'google_sheets'],
                ['encrypted_value' => $url !== '' ? Crypt::encryptString($url) : null, 'enabled' => $data['enabled'], 'updated_at' => now()],
            );
            return response()->json(['saved' => true]);
        }

        $setting = DB::table('cf_platform_integrations')->where('integration_key', 'google_sheets')->first();
        if (! $setting?->enabled || ! $setting->encrypted_value) {
            return response()->json(['sent' => false, 'message' => 'Save and enable a webhook URL first.'], 409);
        }
        try {
            $url = Crypt::decryptString($setting->encrypted_value);
            if (! $this->isAllowedWebhook($url)) return response()->json(['sent' => false, 'message' => 'The saved webhook URL is not allowed.'], 422);
            $response = Http::acceptJson()->timeout(4)->post($url, [
                'event' => 'test_sync', 'source' => 'CommerceForge', 'created_at' => now()->toIso8601String(),
            ]);
            return response()->json(['sent' => $response->successful(), 'message' => $response->successful() ? 'Test row delivered.' : 'Webhook returned HTTP '.$response->status()], $response->successful() ? 200 : 502);
        } catch (\Throwable $exception) {
            report($exception);
            return response()->json(['sent' => false, 'message' => 'Webhook could not be reached.'], 502);
        }
    }

    public function export(string $dataset): JsonResponse|\Illuminate\Http\Response
    {
        $allowed = ['stores', 'events', 'orders'];
        abort_unless(in_array($dataset, $allowed, true), 404);
        $rows = match ($dataset) {
            'stores' => DB::table('cf_stores')->leftJoin('users', 'users.id', '=', 'cf_stores.owner_user_id')->orderBy('cf_stores.id')->limit(5000)->get(['cf_stores.slug', 'cf_stores.template_slug', 'cf_stores.config', 'users.name', 'users.email']),
            'events' => DB::table('cf_platform_events')->orderBy('id')->limit(10000)->get(['event_type', 'actor_user_id', 'store_slug', 'subject', 'created_at']),
            'orders' => DB::table('cf_orders')->orderBy('id')->limit(10000)->get(['order_number', 'store_slug', 'total', 'status', 'created_at']),
        };
        $stream = fopen('php://temp', 'r+');
        fputcsv($stream, array_keys((array) ($rows->first() ?? ['data' => ''])));
        foreach ($rows as $row) {
            $values = (array) $row;
            foreach ($values as $key => $value) {
                if ($key === 'config') {
                    $config = json_decode((string) $value, true) ?: [];
                    $value = $config['store_name'] ?? '';
                }
                $values[$key] = preg_match('/^[=+@-]/', (string) $value) ? "'".$value : $value;
            }
            fputcsv($stream, $values);
        }
        rewind($stream);
        $csv = "\xEF\xBB\xBF".stream_get_contents($stream);
        fclose($stream);
        return response($csv, 200, ['Content-Type' => 'text/csv; charset=UTF-8', 'Content-Disposition' => 'attachment; filename="commerceforge-'.$dataset.'.csv"']);
    }

    private function isAllowedWebhook(string $url): bool
    {
        $parts = parse_url($url);
        if (($parts['scheme'] ?? '') !== 'https' || empty($parts['host'])) return false;
        $host = strtolower($parts['host']);
        return $host === 'script.google.com'
            || $host === 'hooks.zapier.com'
            || preg_match('/^hook\.[a-z0-9-]+\.make\.com$/', $host) === 1;
    }
}
