<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class CommerceForgeStoreRepository
{
    public function trackOrder(string $orderNumber, string $phone): ?array
    {
        $order = DB::table('cf_orders')
            ->where('order_number', $orderNumber)
            ->where('phone', $phone)
            ->first(['order_number', 'status', 'created_at', 'total']);

        if (! $order) {
            return null;
        }

        return [
            'order_number' => $order->order_number,
            'status' => $order->status,
            'created_at' => $order->created_at,
            'total' => $order->total,
        ];
    }

    public function platformSummary(): array
    {
        return [
            'client_count' => DB::table('users')->where('role', 'merchant')->count(),
            'active_saas_stores' => DB::table('cf_stores')
                ->whereNotNull('owner_user_id')
                ->where('config->hosting_mode', 'saas')
                ->count(),
            'pending_refinement_count' => count($this->refinementQueue()),
            'monthly_subscription_revenue' => null,
        ];
    }

    public function refinementQueue(): array
    {
        return DB::table('cf_stores')
            ->orderByDesc('updated_at')
            ->get(['slug', 'template_slug', 'owner_user_id', 'config', 'created_at', 'updated_at'])
            ->map(function (object $store): ?array {
                $config = json_decode($store->config, true, flags: JSON_THROW_ON_ERROR);
                $status = $config['developer_refinement_status'] ?? null;
                if (! in_array($status, ['pending', 'in_progress'], true)) {
                    return null;
                }

                return [
                    'slug' => $store->slug,
                    'template_slug' => $store->template_slug,
                    'owner_user_id' => $store->owner_user_id,
                    'store_name' => $config['store_name'] ?? $store->slug,
                    'hosting_mode' => $config['hosting_mode'] ?? 'saas',
                    'domain' => $config['domain'] ?? null,
                    'status' => $status,
                    'build_completion' => $config['build_completion'] ?? 70,
                    'updated_at' => $store->updated_at,
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    public function updateRefinementStatus(string $slug, string $status): array
    {
        $store = DB::table('cf_stores')->where('slug', $slug)->first();
        abort_unless($store, 404);
        $config = json_decode($store->config, true, flags: JSON_THROW_ON_ERROR);
        $config['developer_refinement_status'] = $status;
        $config['build_completion'] = $status === 'delivered' ? 100 : ($status === 'in_progress' ? 85 : 70);
        $config['final_delivered_at'] = $status === 'delivered' ? now()->toIso8601String() : null;

        DB::table('cf_stores')->where('slug', $slug)->update([
            'config' => json_encode($config, JSON_THROW_ON_ERROR),
            'updated_at' => now(),
        ]);

        return [
            'slug' => $store->slug,
            'developer_refinement_status' => $config['developer_refinement_status'],
            'build_completion' => $config['build_completion'],
        ];
    }

    public function createInitialProducts(string $storeSlug, array $products): void
    {
        $now = now();

        foreach ($products as $product) {
            DB::table('cf_products')->insert([
                'store_slug' => $storeSlug,
                'external_id' => null,
                'category_id' => null,
                'name_ar' => trim($product['name_ar']),
                'name_en' => trim($product['name_en']),
                'description_ar' => null,
                'description_en' => null,
                'price' => $product['price'],
                'old_price' => null,
                'stock_qty' => $product['stock_qty'],
                'variants' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
}
