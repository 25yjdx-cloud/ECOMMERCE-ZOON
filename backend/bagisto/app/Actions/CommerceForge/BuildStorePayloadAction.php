<?php

namespace App\Actions\CommerceForge;

use Illuminate\Support\Facades\DB;

class BuildStorePayloadAction
{
    public function execute(string $slug): array
    {
        $store = DB::table('cf_stores')->where('slug', $slug)->first();
        abort_unless($store, 404);

        $paused = $store->subscription_status !== 'active'
            && $store->trial_ends_at !== null
            && now()->greaterThanOrEqualTo($store->trial_ends_at);
        $overrides = DB::table('cf_store_shipping_rates')
            ->where('store_slug', $slug)
            ->get()
            ->keyBy('governorate');
        $defaultRates = DB::table('cf_shipping_rates')->orderBy('governorate')->get();

        return [
            'slug' => $store->slug,
            'templateSlug' => $store->template_slug,
            'config' => json_decode($store->config, true, flags: JSON_THROW_ON_ERROR),
            'shipping' => [
                'requires_approval' => $overrides->isNotEmpty()
                    ? (bool) $overrides->first()->requires_approval
                    : $store->template_slug === 'furniture',
                'rates' => $defaultRates->map(fn (object $rate) => [
                    'governorate' => $rate->governorate,
                    'fee' => (float) ($overrides->get($rate->governorate)?->fee ?? $rate->fee),
                ])->values()->all(),
            ],
            'paused' => $paused,
            'trial_ends_at' => $store->trial_ends_at,
            'products' => $paused
                ? []
                : DB::table('cf_products')
                    ->leftJoin('cf_categories', 'cf_products.category_id', '=', 'cf_categories.id')
                    ->where('cf_products.store_slug', $slug)
                    ->orderByDesc('cf_products.id')
                    ->get([
                        'cf_products.*',
                        'cf_categories.name_ar as category_ar',
                        'cf_categories.name_en as category_en',
                    ])
                    ->all(),
        ];
    }
}
