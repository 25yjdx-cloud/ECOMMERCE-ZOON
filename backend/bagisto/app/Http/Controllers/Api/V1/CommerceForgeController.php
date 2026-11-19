<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CommerceForgeController extends Controller
{
    private const GOVERNORATES = [
        'cairo' => 50, 'giza' => 50, 'alexandria' => 65, 'dakahlia' => 70,
        'gharbia' => 70, 'sharqia' => 70, 'monufia' => 70, 'qalyubia' => 60,
        'beheira' => 75, 'kafr-el-sheikh' => 75, 'damietta' => 75, 'port-said' => 75,
        'ismailia' => 75, 'suez' => 75, 'faiyum' => 80, 'beni-suef' => 80,
        'minya' => 85, 'asyut' => 85, 'sohag' => 90, 'qena' => 90,
        'luxor' => 95, 'aswan' => 95, 'red-sea' => 100, 'matrouh' => 100,
        'north-sinai' => 110, 'south-sinai' => 110, 'new-valley' => 110,
    ];

    public function templates(): JsonResponse
    {
        return response()->json(['data' => DB::table('cf_templates')->orderBy('slug')->get()]);
    }

    public function template(string $slug): JsonResponse
    {
        $template = DB::table('cf_templates')->where('slug', $slug)->first();
        abort_unless($template, 404);

        return response()->json(['data' => $template]);
    }

    public function storeConfig(string $slug): JsonResponse
    {
        $store = DB::table('cf_stores')->where('slug', $slug)->first();
        abort_unless($store, 404);

        return response()->json([
            'data' => [
                'slug' => $store->slug,
                'templateSlug' => $store->template_slug,
                'config' => json_decode($store->config, true, flags: JSON_THROW_ON_ERROR),
            ],
        ]);
    }

    public function updateStoreConfig(Request $request, string $slug): JsonResponse
    {
        $data = $request->validate([
            'store_name' => ['sometimes', 'required', 'string', 'min:2', 'max:120'],
            'logo_url' => ['nullable', 'url', 'max:2048'],
            'whatsapp' => ['nullable', 'regex:/^01[0125][0-9]{8}$/'],
            'primary_color' => ['sometimes', 'required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'background_color' => ['sometimes', 'required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'mode' => ['sometimes', 'required', 'in:light,dark'],
            'hero_title' => ['sometimes', 'required', 'string', 'max:180'],
            'hero_subtitle' => ['nullable', 'string', 'max:500'],
            'hero_cta' => ['sometimes', 'required', 'string', 'max:60'],
            'sections' => ['sometimes', 'required', 'array'],
            'sections.*' => ['boolean'],
        ]);
        $store = DB::table('cf_stores')->where('slug', $slug)->first();
        abort_unless($store, 404);
        $config = array_replace_recursive(json_decode($store->config, true, flags: JSON_THROW_ON_ERROR), $data);
        DB::table('cf_stores')->where('id', $store->id)->update([
            'config' => json_encode($config, JSON_THROW_ON_ERROR),
            'updated_at' => now(),
        ]);

        return response()->json(['data' => $config]);
    }

    public function cloneStore(Request $request, string $slug): JsonResponse
    {
        $data = $request->validate([
            'client_slug' => ['required', 'string', 'min:3', 'max:48', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'unique:cf_stores,slug'],
        ]);
        $source = DB::table('cf_stores')->where('slug', $slug)->first();
        abort_unless($source, 404);

        $cloneId = DB::transaction(fn () => $this->duplicateStoreContents(
            $source,
            $data['client_slug'],
            $request->user()->id,
            json_decode($source->config, true, flags: JSON_THROW_ON_ERROR),
        ));

        return response()->json(['id' => $cloneId, 'slug' => $data['client_slug']], 201);
    }

    public function createMerchantStore(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User && $user->role === 'merchant', 403);
        abort_if($user->store_slug !== null, 409, 'This account already has a store.');

        $data = $request->validate([
            'store_slug' => ['required', 'string', 'min:3', 'max:48', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'unique:cf_stores,slug'],
            'template_slug' => ['required', 'string', 'exists:cf_templates,slug'],
            'store_name' => ['required', 'string', 'min:2', 'max:120'],
            'logo_url' => ['nullable', 'url', 'max:2048'],
            'primary_color' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'whatsapp' => ['required', 'regex:/^01[0125][0-9]{8}$/'],
            'domain_mode' => ['required', 'in:subdomain,custom'],
            'custom_domain' => ['nullable', 'string', 'max:253', 'regex:/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,63}$/i'],
        ]);

        abort_unless(
            DB::table('cf_templates')->where('slug', $data['template_slug'])->where('status', 'live')->exists(),
            422,
            'The selected template is not available.',
        );
        $source = DB::table('cf_stores')->where('slug', $data['template_slug'])->first();
        abort_unless($source, 404);

        $config = array_replace_recursive(json_decode($source->config, true, flags: JSON_THROW_ON_ERROR), [
            'store_name' => trim($data['store_name']),
            'logo_url' => $data['logo_url'] ?? null,
            'primary_color' => $data['primary_color'],
            'whatsapp' => $data['whatsapp'],
            'plan' => 'free',
            'domain_mode' => $data['domain_mode'],
            'domain' => $data['domain_mode'] === 'subdomain'
                ? $data['store_slug'].'.elmatajer.com'
                : ($data['custom_domain'] ?? null),
            'custom_domain_status' => $data['domain_mode'] === 'custom' ? 'pending' : 'active',
        ]);

        $storeId = DB::transaction(function () use ($source, $data, $config, $user) {
            $id = $this->duplicateStoreContents($source, $data['store_slug'], $user->id, $config);
            $user->forceFill(['store_slug' => $data['store_slug']])->save();

            return $id;
        });

        return response()->json([
            'data' => [
                'id' => $storeId,
                'slug' => $data['store_slug'],
                'domain' => $config['domain'],
                'plan' => $config['plan'],
                'custom_domain_status' => $config['custom_domain_status'],
            ],
        ], 201);
    }

    private function duplicateStoreContents(object $source, string $slug, int $ownerId, array $config): int
    {
        $now = now();
        $id = DB::table('cf_stores')->insertGetId([
            'slug' => $slug,
            'template_slug' => $source->template_slug,
            'owner_user_id' => $ownerId,
            'config' => json_encode($config, JSON_THROW_ON_ERROR),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $categoryIds = [];
        foreach (DB::table('cf_categories')->where('store_slug', $source->slug)->get() as $category) {
            $categoryIds[$category->id] = DB::table('cf_categories')->insertGetId([
                'store_slug' => $slug,
                'name_ar' => $category->name_ar,
                'name_en' => $category->name_en,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        foreach (DB::table('cf_products')->where('store_slug', $source->slug)->get() as $product) {
            DB::table('cf_products')->insert([
                'store_slug' => $slug,
                'external_id' => $product->external_id,
                'category_id' => $product->category_id ? ($categoryIds[$product->category_id] ?? null) : null,
                'name_ar' => $product->name_ar,
                'name_en' => $product->name_en,
                'description_ar' => $product->description_ar,
                'description_en' => $product->description_en,
                'price' => $product->price,
                'old_price' => $product->old_price,
                'stock_qty' => $product->stock_qty,
                'variants' => $product->variants,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        return $id;
    }

    public function products(string $slug): JsonResponse
    {
        abort_unless(DB::table('cf_stores')->where('slug', $slug)->exists(), 404);

        return response()->json([
            'data' => DB::table('cf_products')
                ->leftJoin('cf_categories', 'cf_products.category_id', '=', 'cf_categories.id')
                ->where('cf_products.store_slug', $slug)
                ->orderByDesc('cf_products.id')
                ->get([
                    'cf_products.*',
                    'cf_categories.name_ar as category_ar',
                    'cf_categories.name_en as category_en',
                ]),
        ]);
    }

    public function createProduct(Request $request, string $slug): JsonResponse
    {
        $data = $this->validatedProduct($request);
        abort_unless(DB::table('cf_stores')->where('slug', $slug)->exists(), 404);
        $data['store_slug'] = $slug;
        $data['variants'] = isset($data['variants']) ? json_encode($data['variants'], JSON_THROW_ON_ERROR) : null;
        $data['created_at'] = now();
        $data['updated_at'] = now();
        $id = DB::table('cf_products')->insertGetId($data);

        return response()->json(['data' => DB::table('cf_products')->find($id)], 201);
    }

    public function updateProduct(Request $request, string $slug, int $product): JsonResponse
    {
        $data = $this->validatedProduct($request);
        $row = DB::table('cf_products')->where('store_slug', $slug)->where('id', $product)->first();
        abort_unless($row, 404);
        $data['variants'] = isset($data['variants']) ? json_encode($data['variants'], JSON_THROW_ON_ERROR) : null;
        $data['updated_at'] = now();
        DB::table('cf_products')->where('id', $product)->update($data);

        return response()->json(['data' => DB::table('cf_products')->find($product)]);
    }

    public function deleteProduct(string $slug, int $product): JsonResponse
    {
        $deleted = DB::table('cf_products')->where('store_slug', $slug)->where('id', $product)->delete();
        abort_unless($deleted, 404);

        return response()->json(['deleted' => true]);
    }

    public function categories(string $slug): JsonResponse
    {
        abort_unless(DB::table('cf_stores')->where('slug', $slug)->exists(), 404);

        return response()->json(['data' => DB::table('cf_categories')->where('store_slug', $slug)->orderBy('name_ar')->get()]);
    }

    public function createCategory(Request $request, string $slug): JsonResponse
    {
        abort_unless(DB::table('cf_stores')->where('slug', $slug)->exists(), 404);
        $data = $request->validate([
            'name_ar' => ['required', 'string', 'min:2', 'max:100'],
            'name_en' => ['required', 'string', 'min:2', 'max:100'],
        ]);
        $now = now();
        $id = DB::table('cf_categories')->insertGetId([
            ...$data, 'store_slug' => $slug, 'created_at' => $now, 'updated_at' => $now,
        ]);

        return response()->json(['data' => DB::table('cf_categories')->find($id)], 201);
    }

    public function updateCategory(Request $request, string $slug, int $category): JsonResponse
    {
        $data = $request->validate([
            'name_ar' => ['required', 'string', 'min:2', 'max:100'],
            'name_en' => ['required', 'string', 'min:2', 'max:100'],
        ]);
        $updated = DB::table('cf_categories')->where('store_slug', $slug)->where('id', $category)->update([
            ...$data, 'updated_at' => now(),
        ]);
        abort_unless($updated, 404);

        return response()->json(['data' => DB::table('cf_categories')->find($category)]);
    }

    public function deleteCategory(string $slug, int $category): JsonResponse
    {
        $deleted = DB::table('cf_categories')->where('store_slug', $slug)->where('id', $category)->delete();
        abort_unless($deleted, 404);

        return response()->json(['deleted' => true]);
    }

    public function orders(string $slug): JsonResponse
    {
        abort_unless(DB::table('cf_stores')->where('slug', $slug)->exists(), 404);

        return response()->json(['data' => DB::table('cf_orders')->where('store_slug', $slug)->orderByDesc('id')->get()]);
    }

    public function updateOrderStatus(Request $request, string $slug, int $order): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:new,processing,shipped,delivered,cancelled']]);
        $updated = DB::table('cf_orders')->where('store_slug', $slug)->where('id', $order)->update([
            'status' => $data['status'],
            'updated_at' => now(),
        ]);
        abort_unless($updated, 404);

        return response()->json(['data' => DB::table('cf_orders')->find($order)]);
    }

    public function createOrder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'storeSlug' => ['required', 'string', 'exists:cf_stores,slug'],
            'customer.name' => ['required', 'string', 'min:4', 'max:120', 'regex:/^[\p{Arabic}a-zA-Z\s]+$/u', 'not_regex:/(.)\1{2,}/u'],
            'customer.phone' => ['required', 'regex:/^01[0125][0-9]{8}$/'],
            'customer.governorate' => ['required', 'in:'.implode(',', array_keys(self::GOVERNORATES))],
            'customer.address' => ['required', 'string', 'min:10', 'max:1000', 'not_regex:/(.)\1{3,}/u'],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.productId' => ['required', 'string', 'max:64'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100'],
        ]);

        $result = DB::transaction(function () use ($data) {
            $lines = [];
            $subtotal = 0.0;
            foreach ($data['items'] as $item) {
                $query = DB::table('cf_products')->where('store_slug', $data['storeSlug']);
                $productId = filter_var($item['productId'], FILTER_VALIDATE_INT);
                $product = $productId
                    ? $query->where('id', $productId)->lockForUpdate()->first()
                    : $query->where('external_id', $item['productId'])->lockForUpdate()->first();
                abort_unless($product, 422, 'أحد المنتجات لم يعد متاحاً.');
                abort_if($product->stock_qty < $item['quantity'], 422, 'الكمية المطلوبة غير متاحة.');

                $lineTotal = (float) $product->price * (int) $item['quantity'];
                $subtotal += $lineTotal;
                $lines[] = [
                    'product_id' => $product->id,
                    'name_ar' => $product->name_ar,
                    'name_en' => $product->name_en,
                    'quantity' => (int) $item['quantity'],
                    'unit_price' => (float) $product->price,
                    'line_total' => $lineTotal,
                ];
                DB::table('cf_products')->where('id', $product->id)->decrement('stock_qty', (int) $item['quantity']);
            }

            $shippingFee = self::GOVERNORATES[$data['customer']['governorate']];
            $orderNumber = '#IOY'.strtoupper(Str::random(3)).random_int(100, 999);
            $id = DB::table('cf_orders')->insertGetId([
                'order_number' => $orderNumber,
                'store_slug' => $data['storeSlug'],
                'customer_name' => trim($data['customer']['name']),
                'phone' => $data['customer']['phone'],
                'governorate' => $data['customer']['governorate'],
                'address' => trim($data['customer']['address']),
                'items' => json_encode($lines, JSON_THROW_ON_ERROR),
                'subtotal' => $subtotal,
                'shipping_fee' => $shippingFee,
                'total' => $subtotal + $shippingFee,
                'status' => 'new',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return ['id' => $id, 'orderNumber' => $orderNumber];
        });

        return response()->json($result, 201);
    }

    public function createQuote(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:4', 'max:120', 'regex:/^[\p{Arabic}a-zA-Z\s]+$/u', 'not_regex:/(.)\1{2,}/u'],
            'phone' => ['required', 'regex:/^01[0125][0-9]{8}$/'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'package_id' => ['nullable', 'in:launch,growth,complete'],
            'message' => ['nullable', 'string', 'max:2000', 'not_regex:/(.)\1{5,}/u'],
        ]);
        $id = DB::table('cf_quote_requests')->insertGetId([
            ...$data, 'created_at' => now(), 'updated_at' => now(),
        ]);

        return response()->json(['id' => $id, 'received' => true], 201);
    }

    public function quotes(): JsonResponse
    {
        return response()->json(['data' => DB::table('cf_quote_requests')->orderByDesc('id')->get()]);
    }

    private function validatedProduct(Request $request): array
    {
        $data = $request->validate([
            'external_id' => ['nullable', 'string', 'max:64'],
            'category_id' => ['nullable', 'integer', 'exists:cf_categories,id'],
            'name_ar' => ['required', 'string', 'min:2', 'max:180'],
            'name_en' => ['required', 'string', 'min:2', 'max:180'],
            'description_ar' => ['nullable', 'string', 'max:2000'],
            'description_en' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999999'],
            'old_price' => ['nullable', 'numeric', 'gt:price', 'max:999999999'],
            'stock_qty' => ['required', 'integer', 'min:0', 'max:10000000'],
            'variants' => ['nullable', 'array', 'max:100'],
            'variants.*' => ['string', 'max:100'],
        ]);

        if (isset($data['external_id'])) {
            $storeSlug = (string) $request->route('slug');
            $duplicate = DB::table('cf_products')
                ->where('store_slug', $storeSlug)
                ->where('external_id', $data['external_id'])
                ->when($request->route('product'), fn ($query, $id) => $query->where('id', '<>', $id))
                ->exists();
            abort_if($duplicate, 422, 'معرّف المنتج مستخدم بالفعل في هذا المتجر.');
        }

        if (isset($data['category_id'])) {
            abort_unless(
                DB::table('cf_categories')
                    ->where('id', $data['category_id'])
                    ->where('store_slug', $request->route('slug'))
                    ->exists(),
                422,
                'القسم المحدد لا يتبع هذا المتجر.',
            );
        }

        return $data;
    }
}
