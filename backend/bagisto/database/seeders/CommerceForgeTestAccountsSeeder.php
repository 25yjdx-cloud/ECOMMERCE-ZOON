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
        });
    }
}
