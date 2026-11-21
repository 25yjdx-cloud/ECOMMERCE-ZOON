<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PlatformTelemetryController extends Controller
{
    private const ZONES = ['marketing', 'merchant_dashboard', 'storefront', 'other'];

    public function heartbeat(Request $request): JsonResponse
    {
        $data = $request->validate([
            'session_id' => ['required', 'uuid'],
            'zone' => ['required', 'in:marketing,merchant_dashboard,storefront,other'],
        ]);
        $user = $request->user('sanctum');
        $sessionHash = hash('sha256', $data['session_id']);
        DB::table('cf_active_sessions')->updateOrInsert(
            ['session_hash' => $sessionHash],
            ['user_id' => $user?->id, 'zone' => $data['zone'], 'last_seen' => now()],
        );

        return response()->json(['accepted' => true], 202);
    }

    public function radar(): JsonResponse
    {
        $cutoff = now()->subSeconds(45);
        DB::table('cf_active_sessions')->where('last_seen', '<', $cutoff)->delete();
        $zones = DB::table('cf_active_sessions')->where('last_seen', '>=', $cutoff)
            ->select('zone', DB::raw('count(*) as total'))->groupBy('zone')->pluck('total', 'zone');

        $stores = DB::table('cf_stores')->whereNotNull('owner_user_id')->get(['slug', 'config']);
        $planCounts = ['free' => 0, 'paid' => 0];
        $pending = 0;
        foreach ($stores as $store) {
            $config = json_decode($store->config, true) ?: [];
            $plan = strtolower((string) ($config['plan'] ?? 'free'));
            $planCounts[$plan === 'free' ? 'free' : 'paid']++;
            if (($config['developer_refinement_status'] ?? 'pending') !== 'delivered') $pending++;
        }
        $eventSeries = DB::table('cf_platform_events')
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->whereIn('event_type', ['new_signup', 'store_generated'])
            ->select(DB::raw('DATE(created_at) as day'), 'event_type', DB::raw('count(*) as total'))
            ->groupBy('day', 'event_type')->orderBy('day')->get();
        $storeSeries = DB::table('cf_stores')->whereNotNull('owner_user_id')->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->select(DB::raw('DATE(created_at) as day'), DB::raw("'stores' as event_type"), DB::raw('count(*) as total'))
            ->groupBy('day')->orderBy('day')->get();
        $gmvSeries = DB::table('cf_orders')->join('cf_stores', 'cf_stores.slug', '=', 'cf_orders.store_slug')
            ->whereNotNull('cf_stores.owner_user_id')->where('cf_orders.created_at', '>=', now()->subDays(29)->startOfDay())
            ->select(DB::raw('DATE(cf_orders.created_at) as day'), DB::raw("'gmv' as event_type"), DB::raw('SUM(cf_orders.total) as total'))
            ->groupBy('day')->orderBy('day')->get();
        $series = $eventSeries->merge($storeSeries)->merge($gmvSeries)->values();

        return response()->json([
            'online_total' => (int) $zones->sum(),
            'online_by_zone' => collect(self::ZONES)->mapWithKeys(fn (string $zone) => [$zone => (int) ($zones[$zone] ?? 0)]),
            'stores_total' => $stores->count(),
            'stores_pending_review' => $pending,
            'plans' => $planCounts,
            'confirmed_revenue' => null,
            'gmv' => (float) DB::table('cf_orders')->join('cf_stores', 'cf_stores.slug', '=', 'cf_orders.store_slug')->whereNotNull('cf_stores.owner_user_id')->sum('cf_orders.total'),
            'orders_total' => (int) DB::table('cf_orders')->join('cf_stores', 'cf_stores.slug', '=', 'cf_orders.store_slug')->whereNotNull('cf_stores.owner_user_id')->count(),
            'series' => $series,
            'generated_at' => now()->toIso8601String(),
            'google_allowlist_count' => count(config('commerceforge.manager_allowed_google_emails', [])),
            'manager_lock_ready' => count(config('commerceforge.manager_allowed_google_emails', [])) === 2,
        ]);
    }

    public function events(Request $request): JsonResponse
    {
        $after = $request->integer('after', 0);
        $events = DB::table('cf_platform_events')->where('id', '>', max(0, $after))
            ->orderByDesc('id')->limit(60)->get()->reverse()->values()->map(function (object $event) {
                return [
                    'id' => (int) $event->id,
                    'type' => $event->event_type,
                    'actor_user_id' => $event->actor_user_id ? (int) $event->actor_user_id : null,
                    'store_slug' => $event->store_slug,
                    'subject' => $event->subject,
                    'metadata' => $event->metadata ? json_decode($event->metadata, true) : [],
                    'created_at' => $event->created_at,
                ];
            });

        return response()->json(['data' => $events]);
    }

    public function audit(): JsonResponse
    {
        $security = Schema::hasTable('security_logs')
            ? DB::table('security_logs')->orderByDesc('id')->limit(200)->get(['id', 'user_id', 'event', 'severity', 'identifier_hash', 'ip_address', 'created_at'])
            : collect();
        $audit = Schema::hasTable('cf_audit_logs')
            ? DB::table('cf_audit_logs')->orderByDesc('id')->limit(200)->get()
            : collect();

        return response()->json(['security' => $security, 'audit' => $audit]);
    }

    public function stores(Request $request): JsonResponse
    {
        $term = trim((string) $request->query('q', ''));
        $stores = DB::table('cf_stores')->whereNotNull('cf_stores.owner_user_id')->leftJoin('users', 'users.id', '=', 'cf_stores.owner_user_id')
            ->when($term !== '', fn ($query) => $query->where(function ($query) use ($term) {
                $query->where('cf_stores.slug', 'like', '%'.$term.'%')
                    ->orWhere('users.name', 'like', '%'.$term.'%')
                    ->orWhere('users.email', 'like', '%'.$term.'%')
                    ->orWhere('users.whatsapp_phone', 'like', '%'.$term.'%')
                    ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(cf_stores.config, '$.domain')) LIKE ?", ['%'.$term.'%']);
            }))
            ->orderByDesc('cf_stores.id')->limit(100)
            ->get(['cf_stores.slug', 'cf_stores.template_slug', 'cf_stores.config', 'cf_stores.created_at', 'cf_stores.subscription_status', 'users.name as owner_name', 'users.email as owner_email']);

        return response()->json(['data' => $stores->map(function (object $store) {
            $config = json_decode($store->config, true) ?: [];
            return [
                'slug' => $store->slug,
                'template_slug' => $store->template_slug,
                'store_name' => $config['store_name'] ?? $store->slug,
                'plan' => $config['plan'] ?? 'free',
                'status' => $store->subscription_status ?? 'active',
                'build_completion' => (int) ($config['build_completion'] ?? 100),
                'owner_name' => $store->owner_name,
                'owner_email' => $store->owner_email,
                'created_at' => $store->created_at,
                'config' => $config,
            ];
        })]);
    }

    public function templates(): JsonResponse
    {
        $templates = DB::table('cf_templates')->leftJoin('cf_stores', function ($join) {
            $join->on('cf_stores.template_slug', '=', 'cf_templates.slug')->whereNotNull('cf_stores.owner_user_id');
        })->groupBy('cf_templates.id', 'cf_templates.slug', 'cf_templates.name_ar', 'cf_templates.name_en', 'cf_templates.status', 'cf_templates.featured')
            ->orderBy('cf_templates.slug')
            ->get(['cf_templates.slug', 'cf_templates.name_ar', 'cf_templates.name_en', 'cf_templates.status', 'cf_templates.featured', DB::raw('count(cf_stores.id) as active_store_count')]);
        return response()->json(['data' => $templates]);
    }

    public function updateTemplate(Request $request, string $slug): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:live,draft']]);
        $updated = DB::table('cf_templates')->where('slug', $slug)->update(['status' => $data['status'], 'updated_at' => now()]);
        abort_unless($updated, 404);
        app(\App\Support\PlatformEventRecorder::class)->record('template_status_changed', $request->user()?->id, null, $slug, ['status' => $data['status']]);
        return response()->json(['slug' => $slug, 'status' => $data['status']]);
    }

    public function updateStore(Request $request, string $slug): JsonResponse
    {
        $data = $request->validate([
            'store_name' => ['sometimes', 'string', 'min:2', 'max:120'],
            'store_name_en' => ['sometimes', 'string', 'min:2', 'max:120'],
            'hero_title' => ['sometimes', 'string', 'max:180'],
            'hero_title_en' => ['sometimes', 'string', 'max:180'],
            'hero_subtitle' => ['sometimes', 'nullable', 'string', 'max:500'],
            'hero_subtitle_en' => ['sometimes', 'nullable', 'string', 'max:500'],
            'hero_cta' => ['sometimes', 'string', 'max:60'],
            'hero_cta_en' => ['sometimes', 'string', 'max:60'],
            'primary_color' => ['sometimes', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'button_color' => ['sometimes', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'background_color' => ['sometimes', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'button_width' => ['sometimes', 'integer', 'min:120', 'max:520'],
            'button_height' => ['sometimes', 'integer', 'min:36', 'max:100'],
            'button_font_size' => ['sometimes', 'integer', 'min:12', 'max:28'],
            'button_radius' => ['sometimes', 'integer', 'min:0', 'max:48'],
            'trust_badges' => ['sometimes', 'array', 'max:6'],
            'trust_badges.*.ar' => ['required_with:trust_badges', 'string', 'max:100'],
            'trust_badges.*.en' => ['required_with:trust_badges', 'string', 'max:100'],
            'domain' => ['sometimes', 'nullable', 'string', 'max:253'],
            'custom_domain_status' => ['sometimes', 'in:pending,active,suspended'],
            'subscription_status' => ['sometimes', 'in:active,suspended'],
        ]);
        $store = DB::table('cf_stores')->where('slug', $slug)->first();
        abort_unless($store, 404);
        $config = json_decode($store->config, true, flags: JSON_THROW_ON_ERROR);
        $subscriptionStatus = $data['subscription_status'] ?? null;
        unset($data['subscription_status']);
        $config = array_replace($config, $data);
        if (isset($data['domain']) || isset($data['custom_domain_status'])) {
            $config['domain_mode'] = isset($data['domain']) ? 'custom' : ($config['domain_mode'] ?? 'subdomain');
        }
        $updates = ['config' => json_encode($config, JSON_THROW_ON_ERROR), 'updated_at' => now()];
        if ($subscriptionStatus !== null) $updates['subscription_status'] = $subscriptionStatus;
        DB::table('cf_stores')->where('slug', $slug)->update($updates);
        $eventType = match ($subscriptionStatus) {
            'suspended' => 'store_suspended',
            'active' => 'store_activated',
            default => 'store_visual_updated',
        };
        app(\App\Support\PlatformEventRecorder::class)->record($eventType, $request->user()?->id, $slug, $config['store_name'] ?? $slug);

        return response()->json(['data' => $config]);
    }
}
