<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\CommerceForge\BuildStorePayloadAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\CommerceForge\AiAssistRequest;
use App\Http\Requests\CommerceForge\CategoryRequest;
use App\Http\Requests\CommerceForge\CloneStoreRequest;
use App\Http\Requests\CommerceForge\CreateMerchantStoreRequest;
use App\Http\Requests\CommerceForge\CreateOrderRequest;
use App\Http\Requests\CommerceForge\CreateQuoteRequest;
use App\Http\Requests\CommerceForge\ProductRequest;
use App\Http\Requests\CommerceForge\UpdateOrderStatusRequest;
use App\Http\Requests\CommerceForge\UpdateRefinementStatusRequest;
use App\Http\Requests\CommerceForge\TrackOrderRequest;
use App\Http\Requests\CommerceForge\UpdateShippingRatesRequest;
use App\Http\Requests\CommerceForge\UpdateStoreConfigRequest;
use App\Models\User;
use App\Repositories\CommerceForgeStoreRepository;
use App\Services\CommerceForgeNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CommerceForgeController extends Controller
{
    public function __construct(
        private readonly CommerceForgeStoreRepository $storeRepository,
        private readonly CommerceForgeNotificationService $notifications,
    ) {}

    public function refinementQueue(): JsonResponse
    {
        return response()->json([
            'data' => $this->storeRepository->refinementQueue(),
            'summary' => $this->storeRepository->platformSummary(),
            'leads' => DB::table('cf_quote_requests')->orderByDesc('id')->limit(50)->get(),
            'merchant_contacts' => DB::table('users')
                ->where('role', 'merchant')
                ->orderByDesc('id')
                ->limit(100)
                ->get(['name', 'email', 'whatsapp_phone', 'market', 'store_slug']),
            'unanswered_queries' => DB::table('ai_unanswered_queries')
                ->orderByDesc('last_asked_at')
                ->limit(50)
                ->get(['question', 'locale', 'occurrences', 'last_asked_at']),
        ]);
    }

    public function updateRefinementStatus(UpdateRefinementStatusRequest $request, string $slug): JsonResponse
    {
        $data = $request->validated();

        return response()->json(['data' => $this->storeRepository->updateRefinementStatus($slug, $data['status'])]);
    }

    public function trackOrder(TrackOrderRequest $request): JsonResponse
    {
        $data = $request->validated();
        $order = $this->storeRepository->trackOrder($data['order_number'], $data['phone']);
        abort_unless($order, 404, 'Order not found.');

        return response()->json(['data' => $order]);
    }

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
                'shipping' => $this->shippingSettingsForStore($store),
                'paused' => $this->storeIsPaused($store),
                'trial_ends_at' => $store->trial_ends_at,
            ],
        ]);
    }

    public function buildPayload(string $slug, BuildStorePayloadAction $buildStorePayload): JsonResponse
    {
        return response()->json(['data' => $buildStorePayload->execute($slug)]);
    }

    public function shippingRates(string $slug): JsonResponse
    {
        $store = DB::table('cf_stores')->where('slug', $slug)->first();
        abort_unless($store, 404);

        return response()->json(['data' => $this->shippingSettingsForStore($store)]);
    }

    public function updateShippingRates(UpdateShippingRatesRequest $request, string $slug): JsonResponse
    {
        $data = $request->validated();
        $now = now();

        DB::transaction(function () use ($data, $slug, $now) {
            DB::table('cf_store_shipping_rates')->where('store_slug', $slug)->delete();
            DB::table('cf_store_shipping_rates')->insert(array_map(
                fn (array $rate) => [
                    'store_slug' => $slug,
                    'governorate' => $rate['governorate'],
                    'fee' => $rate['fee'],
                    'requires_approval' => $data['requires_approval'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                $data['rates'],
            ));
        });

        return $this->shippingRates($slug);
    }

    public function updateStoreConfig(UpdateStoreConfigRequest $request, string $slug): JsonResponse
    {
        $data = $request->validated();
        $store = DB::table('cf_stores')->where('slug', $slug)->first();
        abort_unless($store, 404);
        $config = array_replace_recursive(json_decode($store->config, true, flags: JSON_THROW_ON_ERROR), $data);
        DB::table('cf_stores')->where('id', $store->id)->update([
            'config' => json_encode($config, JSON_THROW_ON_ERROR),
            'updated_at' => now(),
        ]);

        return response()->json(['data' => $config]);
    }

    public function cloneStore(CloneStoreRequest $request, string $slug): JsonResponse
    {
        $data = $request->validated();
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

    public function createMerchantStore(CreateMerchantStoreRequest $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User && $user->role === 'merchant', 403);
        abort_if($user->store_slug !== null, 409, 'This account already has a store.');

        $data = $request->validated();
        $data['domain_mode'] = $data['hosting_mode'] === 'saas' ? 'subdomain' : 'custom';
        $trialEndsAt = now()->addDays(14);

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
            'market' => $data['market'],
            'trial_ends_at' => $trialEndsAt->toIso8601String(),
            'hosting_mode' => $data['hosting_mode'],
            'domain_mode' => $data['domain_mode'],
            'domain' => $data['domain_mode'] === 'subdomain'
                ? $data['store_slug'].'.elmatajer.com'
                : ($data['custom_domain'] ?? null),
            'custom_domain_status' => $data['domain_mode'] === 'custom' ? 'pending' : 'active',
            'build_completion' => 70,
            'developer_refinement_status' => 'pending',
        ]);

        $storeId = DB::transaction(function () use ($source, $data, $config, $user, $trialEndsAt) {
            $id = $this->duplicateStoreContents($source, $data['store_slug'], $user->id, $config);
            DB::table('cf_stores')->where('id', $id)->update([
                'trial_ends_at' => $trialEndsAt,
                'subscription_status' => 'trialing',
            ]);
            $this->storeRepository->createInitialProducts($data['store_slug'], $data['initial_products'] ?? []);
            $user->forceFill([
                'store_slug' => $data['store_slug'],
                'member_role' => 'owner',
                'market' => $data['market'],
                'whatsapp_phone' => $data['whatsapp'],
            ])->save();

            return $id;
        });

        $this->notifications->storeCreated($storeId, $data['store_slug'], $user->id, trim($data['store_name']));

        return response()->json([
            'data' => [
                'id' => $storeId,
                'slug' => $data['store_slug'],
                'domain' => $config['domain'],
                'plan' => $config['plan'],
                'hosting_mode' => $config['hosting_mode'],
                'custom_domain_status' => $config['custom_domain_status'],
                'build_completion' => $config['build_completion'],
                'developer_refinement_status' => $config['developer_refinement_status'],
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

    public function products(Request $request, string $slug): JsonResponse
    {
        $store = DB::table('cf_stores')->where('slug', $slug)->first();
        abort_unless($store, 404);
        abort_if(
            ! $request->user() && $this->storeIsPaused($store),
            410,
            'هذا المتجر متوقف مؤقتاً لانتهاء الفترة التجريبية — يرجى تجديد الاشتراك لإعادة التفعيل فوراً',
        );

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

    public function createProduct(ProductRequest $request, string $slug): JsonResponse
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

    public function updateProduct(ProductRequest $request, string $slug, int $product): JsonResponse
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

    public function createCategory(CategoryRequest $request, string $slug): JsonResponse
    {
        abort_unless(DB::table('cf_stores')->where('slug', $slug)->exists(), 404);
        $data = $request->validated();
        $now = now();
        $id = DB::table('cf_categories')->insertGetId([
            ...$data, 'store_slug' => $slug, 'created_at' => $now, 'updated_at' => $now,
        ]);

        return response()->json(['data' => DB::table('cf_categories')->find($id)], 201);
    }

    public function updateCategory(CategoryRequest $request, string $slug, int $category): JsonResponse
    {
        $data = $request->validated();
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

        $orders = DB::table('cf_orders')->where('store_slug', $slug)->orderByDesc('id')->get();
        $shipments = DB::table('cf_shipments')
            ->where('store_slug', $slug)
            ->whereIn('order_id', $orders->pluck('id'))
            ->orderByDesc('id')
            ->get()
            ->groupBy('order_id');

        return response()->json([
            'data' => $orders->map(function (object $order) use ($shipments) {
                $shipment = $shipments[$order->id]->first() ?? null;

                return [
                    ...(array) $order,
                    'shipment' => $shipment ? [
                        'id' => $shipment->id,
                        'provider' => $shipment->provider,
                        'tracking_number' => $shipment->tracking_number,
                        'status' => $shipment->status,
                        'label_url' => $shipment->label_url,
                    ] : null,
                ];
            }),
        ]);
    }

    public function updateOrderStatus(UpdateOrderStatusRequest $request, string $slug, int $order): JsonResponse
    {
        $data = $request->validated();
        $updated = DB::table('cf_orders')->where('store_slug', $slug)->where('id', $order)->update([
            'status' => $data['status'],
            'updated_at' => now(),
        ]);
        abort_unless($updated, 404);

        return response()->json(['data' => DB::table('cf_orders')->find($order)]);
    }

    public function createOrder(CreateOrderRequest $request): JsonResponse
    {
        $data = $request->validated();

        $result = DB::transaction(function () use ($data) {
            $store = DB::table('cf_stores')->where('slug', $data['storeSlug'])->first();
            abort_unless($store, 404);
            abort_if(
                $this->storeIsPaused($store),
                410,
                'هذا المتجر متوقف مؤقتاً لانتهاء الفترة التجريبية — يرجى تجديد الاشتراك لإعادة التفعيل فوراً',
            );

            $lines = [];
            $subtotalCents = 0;
            foreach ($data['items'] as $item) {
                $query = DB::table('cf_products')->where('store_slug', $data['storeSlug']);
                $productId = filter_var($item['productId'], FILTER_VALIDATE_INT);
                $product = $productId
                    ? $query->where('id', $productId)->lockForUpdate()->first()
                    : $query->where('external_id', $item['productId'])->lockForUpdate()->first();
                abort_unless($product, 422, 'أحد المنتجات لم يعد متاحاً.');
                abort_if($product->stock_qty < $item['quantity'], 422, 'الكمية المطلوبة غير متاحة.');

                $unitPriceCents = (int) round(((float) $product->price) * 100);
                $lineTotalCents = $unitPriceCents * (int) $item['quantity'];
                $subtotalCents += $lineTotalCents;
                $lines[] = [
                    'product_id' => $product->id,
                    'name_ar' => $product->name_ar,
                    'name_en' => $product->name_en,
                    'quantity' => (int) $item['quantity'],
                    'unit_price' => number_format($unitPriceCents / 100, 2, '.', ''),
                    'line_total' => number_format($lineTotalCents / 100, 2, '.', ''),
                ];
                DB::table('cf_products')->where('id', $product->id)->decrement('stock_qty', (int) $item['quantity']);
            }

            $storeShippingRate = DB::table('cf_store_shipping_rates')
                ->where('store_slug', $data['storeSlug'])
                ->where('governorate', $data['customer']['governorate'])
                ->first();
            $shippingFee = $storeShippingRate?->fee
                ?? DB::table('cf_shipping_rates')
                    ->where('governorate', $data['customer']['governorate'])
                    ->value('fee');
            abort_unless(is_numeric($shippingFee), 422, 'منطقة التوصيل غير متاحة.');
            $shippingRequiresApproval = $storeShippingRate
                ? (bool) $storeShippingRate->requires_approval
                : $store->template_slug === 'furniture';
            $shippingCents = $shippingRequiresApproval ? 0 : (int) round(((float) $shippingFee) * 100);
            $totalCents = $subtotalCents + $shippingCents;
            $orderNumber = '#IOY'.strtoupper(Str::random(3)).random_int(100, 999);
            $id = DB::table('cf_orders')->insertGetId([
                'order_number' => $orderNumber,
                'store_slug' => $data['storeSlug'],
                'customer_name' => trim($data['customer']['name']),
                'phone' => $data['customer']['phone'],
                'governorate' => $data['customer']['governorate'],
                'address' => trim($data['customer']['address']),
                'items' => json_encode($lines, JSON_THROW_ON_ERROR),
                'subtotal' => number_format($subtotalCents / 100, 2, '.', ''),
                'shipping_fee' => number_format($shippingCents / 100, 2, '.', ''),
                'shipping_requires_approval' => $shippingRequiresApproval,
                'total' => number_format($totalCents / 100, 2, '.', ''),
                'status' => 'new',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return [
                'id' => $id,
                'orderNumber' => $orderNumber,
                'total' => number_format($totalCents / 100, 2, '.', ''),
                'shippingRequiresApproval' => $shippingRequiresApproval,
                'shippingFee' => number_format($shippingCents / 100, 2, '.', ''),
            ];
        });

        $this->notifications->orderCreated(
            $data['storeSlug'],
            $result['id'],
            $result['orderNumber'],
            $result['total'],
        );

        return response()->json($result, 201);
    }

    public function createQuote(CreateQuoteRequest $request): JsonResponse
    {
        $data = $request->validated();
        $id = DB::table('cf_quote_requests')->insertGetId([
            ...$data, 'created_at' => now(), 'updated_at' => now(),
        ]);

        return response()->json(['id' => $id, 'received' => true], 201);
    }

    private function storeIsPaused(object $store): bool
    {
        return $store->subscription_status !== 'active'
            && $store->trial_ends_at !== null
            && now()->greaterThanOrEqualTo($store->trial_ends_at);
    }

    private function shippingSettingsForStore(object $store): array
    {
        $overrides = DB::table('cf_store_shipping_rates')
            ->where('store_slug', $store->slug)
            ->get()
            ->keyBy('governorate');
        $defaults = DB::table('cf_shipping_rates')->orderBy('governorate')->get();

        return [
            'requires_approval' => $overrides->isNotEmpty()
                ? (bool) $overrides->first()->requires_approval
                : $store->template_slug === 'furniture',
            'rates' => $defaults->map(fn (object $rate) => [
                'governorate' => $rate->governorate,
                'fee' => (float) ($overrides->get($rate->governorate)?->fee ?? $rate->fee),
            ])->values(),
        ];
    }

    public function quotes(): JsonResponse
    {
        return response()->json(['data' => DB::table('cf_quote_requests')->orderByDesc('id')->get()]);
    }

    private function validatedProduct(ProductRequest $request): array
    {
        $data = $request->validated();

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
