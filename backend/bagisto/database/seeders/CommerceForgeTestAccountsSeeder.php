<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CommerceForgeTestAccountsSeeder extends Seeder
{
    public function run(): void
    {
        $password = (string) env('COMMERCEFORGE_TEST_PASSWORD', 'Password123!');

        DB::transaction(function () use ($password): void {
            User::updateOrCreate(
                ['email' => 'admin@commerceforge.com'],
                [
                    'name' => 'CommerceForge Platform Owner',
                    'password' => Hash::make($password),
                    'role' => 'super_admin',
                    'member_role' => null,
                    'store_slug' => null,
                ],
            );

            $merchant = User::updateOrCreate(
                ['email' => 'merchant@commerceforge.com'],
                [
                    'name' => 'CommerceForge Demo Merchant',
                    'password' => Hash::make($password),
                    'role' => 'merchant',
                    'member_role' => 'owner',
                    'store_slug' => 'demo',
                ],
            );

            User::updateOrCreate(
                ['email' => 'staff@commerceforge.com'],
                [
                    'name' => 'CommerceForge Order Manager',
                    'password' => Hash::make($password),
                    'role' => 'merchant',
                    'member_role' => 'order_manager',
                    'store_slug' => 'demo',
                ],
            );

            $classicStore = DB::table('cf_stores')->where('slug', 'classic')->first();
            if (! $classicStore) {
                throw new \RuntimeException('The classic CommerceForge store must be seeded before demo accounts.');
            }

            $storeConfig = json_decode($classicStore->config, true, flags: JSON_THROW_ON_ERROR);
            $storeConfig['store_name'] = 'متجر CommerceForge التجريبي';
            $storeConfig['hero_title'] = 'متجر CommerceForge التجريبي';

            DB::table('cf_stores')->updateOrInsert(
                ['slug' => 'demo'],
                [
                    'template_slug' => 'classic',
                    'owner_user_id' => $merchant->id,
                    'config' => json_encode($storeConfig, JSON_THROW_ON_ERROR),
                    'updated_at' => now(),
                    'created_at' => now(),
                ],
            );

            $categoryIds = [];
            foreach (DB::table('cf_categories')->where('store_slug', 'classic')->get() as $category) {
                DB::table('cf_categories')->updateOrInsert(
                    ['store_slug' => 'demo', 'name_ar' => $category->name_ar],
                    [
                        'name_en' => $category->name_en,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ],
                );

                $categoryIds[$category->id] = DB::table('cf_categories')
                    ->where('store_slug', 'demo')
                    ->where('name_ar', $category->name_ar)
                    ->value('id');
            }

            foreach (DB::table('cf_products')->where('store_slug', 'classic')->get() as $product) {
                DB::table('cf_products')->updateOrInsert(
                    ['store_slug' => 'demo', 'external_id' => $product->external_id],
                    [
                        'category_id' => $categoryIds[$product->category_id] ?? null,
                        'name_ar' => $product->name_ar,
                        'name_en' => $product->name_en,
                        'description_ar' => $product->description_ar,
                        'description_en' => $product->description_en,
                        'price' => $product->price,
                        'old_price' => $product->old_price,
                        'stock_qty' => $product->stock_qty,
                        'variants' => $product->variants,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ],
                );
            }

            $demoProduct = DB::table('cf_products')
                ->where('store_slug', 'demo')
                ->orderBy('id')
                ->first();
            if (! $demoProduct) {
                throw new \RuntimeException('Demo products must be seeded before sample orders.');
            }

            foreach ([
                ['number' => 'CF-DEMO-0001', 'status' => 'new', 'days' => 0],
                ['number' => 'CF-DEMO-0002', 'status' => 'processing', 'days' => 1],
                ['number' => 'CF-DEMO-0003', 'status' => 'shipped', 'days' => 2],
                ['number' => 'CF-DEMO-0004', 'status' => 'delivered', 'days' => 3],
            ] as $sampleOrder) {
                $createdAt = now()->subDays($sampleOrder['days']);
                DB::table('cf_orders')->updateOrInsert(
                    ['order_number' => $sampleOrder['number']],
                    [
                        'store_slug' => 'demo',
                        'customer_name' => 'عميل تجريبي',
                        'phone' => '01000000000',
                        'governorate' => 'Cairo',
                        'address' => 'عنوان تجريبي غير حقيقي',
                        'items' => json_encode([[
                            'product_id' => $demoProduct->id,
                            'name_ar' => $demoProduct->name_ar,
                            'name_en' => $demoProduct->name_en,
                            'quantity' => 1,
                            'unit_price' => $demoProduct->price,
                            'line_total' => $demoProduct->price,
                        ]], JSON_THROW_ON_ERROR),
                        'subtotal' => $demoProduct->price,
                        'shipping_fee' => 0,
                        'total' => $demoProduct->price,
                        'status' => $sampleOrder['status'],
                        'updated_at' => $createdAt,
                        'created_at' => $createdAt,
                    ],
                );
            }

            foreach ([
                [
                    'event_key' => 'demo:store-created:merchant',
                    'recipient_user_id' => $merchant->id,
                    'recipient_role' => null,
                    'store_slug' => 'demo',
                    'type' => 'store_created',
                    'title_ar' => 'تم تسجيل متجرك التجريبي',
                    'title_en' => 'Your demo store is ready',
                    'body_ar' => 'يمكنك الآن مراجعة المنتجات والطلبات التجريبية.',
                    'body_en' => 'You can now review the sample products and orders.',
                ],
                [
                    'event_key' => 'demo:store-created:platform',
                    'recipient_user_id' => null,
                    'recipient_role' => 'super_admin',
                    'store_slug' => 'demo',
                    'type' => 'store_registered',
                    'title_ar' => 'متجر تجريبي جاهز',
                    'title_en' => 'Demo store is ready',
                    'body_ar' => 'تم تجهيز متجر demo بمنتجات وطلبات تجريبية.',
                    'body_en' => 'The demo store has sample products and orders.',
                ],
                [
                    'event_key' => 'demo:order-created',
                    'recipient_user_id' => null,
                    'recipient_role' => 'store_member',
                    'store_slug' => 'demo',
                    'type' => 'new_order',
                    'title_ar' => 'طلب تجريبي جديد',
                    'title_en' => 'New sample order',
                    'body_ar' => 'يوجد طلب تجريبي لمراجعته في لوحة المتجر.',
                    'body_en' => 'A sample order is ready to review in the store dashboard.',
                ],
            ] as $notification) {
                DB::table('cf_notifications')->insertOrIgnore([
                    ...$notification,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });
    }
}
