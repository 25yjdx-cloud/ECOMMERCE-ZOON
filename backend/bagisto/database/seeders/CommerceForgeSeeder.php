<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CommerceForgeSeeder extends Seeder
{
    public function run(): void
    {
        $registryPath = (string) env(
            'COMMERCEFORGE_PRESET_REGISTRY',
            base_path('../../config/templates/presets.json'),
        );
        if (! is_file($registryPath)) {
            throw new \RuntimeException('CommerceForge template registry is missing.');
        }

        $registry = json_decode((string) file_get_contents($registryPath), true, flags: JSON_THROW_ON_ERROR);

        foreach ($registry['presets'] as $preset) {
            DB::table('cf_templates')->updateOrInsert(
                ['slug' => $preset['id']],
                [
                    'name_ar'   => $preset['name']['ar'],
                    'name_en'   => $preset['name']['en'],
                    'featured'  => (bool) $preset['featuredOnHome'],
                    'status'    => $preset['status'],
                    'metadata'  => json_encode($preset, JSON_THROW_ON_ERROR),
                    'updated_at'=> now(),
                    'created_at'=> now(),
                ],
            );

            DB::table('cf_stores')->updateOrInsert(
                ['slug' => $preset['id']],
                [
                    'template_slug' => $preset['id'],
                    'config'        => json_encode([
                        'store_name'        => $preset['name']['ar'],
                        'logo_url'          => null,
                        'primary_color'     => '#D9541E',
                        'background_color'  => '#F3EEE3',
                        'mode'              => 'light',
                        'hero_title'        => $preset['name']['ar'],
                        'hero_subtitle'     => '',
                        'hero_cta'          => 'تسوق الآن',
                        'sections'          => ['hero' => true, 'products' => true, 'categories' => true],
                    ], JSON_THROW_ON_ERROR),
                    'updated_at'    => now(),
                    'created_at'    => now(),
                ],
            );

            $categoryIds = [];

            foreach ($preset['categories'] ?? [] as $category) {
                DB::table('cf_categories')->updateOrInsert(
                    ['store_slug' => $preset['id'], 'name_ar' => $category['ar']],
                    [
                        'name_en' => $category['en'],
                        'updated_at' => now(),
                        'created_at' => now(),
                    ],
                );

                $categoryIds[$category['en']] = DB::table('cf_categories')
                    ->where('store_slug', $preset['id'])
                    ->where('name_ar', $category['ar'])
                    ->value('id');
            }

            foreach ($preset['products'] ?? [] as $product) {
                DB::table('cf_products')->updateOrInsert(
                    ['store_slug' => $preset['id'], 'external_id' => $product['id']],
                    [
                        'category_id' => $categoryIds[$product['category']] ?? null,
                        'name_ar' => $product['name']['ar'],
                        'name_en' => $product['name']['en'],
                        'description_ar' => $product['description']['ar'],
                        'description_en' => $product['description']['en'],
                        'price' => $product['price'],
                        'old_price' => $product['oldPrice'] ?? null,
                        'stock_qty' => $product['stockQty'] ?? 0,
                        'variants' => null,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ],
                );
            }
        }
    }
}
