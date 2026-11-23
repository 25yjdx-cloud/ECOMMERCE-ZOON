<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Exceptions\ShippingProviderException;
use App\Models\User;
use App\Services\ShippingIntegrationService;
use App\Support\PlatformEventRecorder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class MerchantWorkspaceController extends Controller
{
    private function context(Request $request): array
    {
        $user = $request->user();
        $store = $request->attributes->get('merchant_store');
        abort_unless($user instanceof User && $store, 403);

        return [$user, $store, (string) $store->slug];
    }

    private function manager(User $user): void
    {
        abort_unless(in_array($user->member_role, ['owner', 'manager'], true), 403, 'تحتاج هذه العملية صلاحية مالك أو مدير المتجر.');
    }

    public function search(Request $request): JsonResponse
    {
        [$user, $store, $slug] = $this->context($request);
        $term = trim((string) $request->query('q', ''));
        if (mb_strlen($term) < 2) return response()->json(['data' => []]);

        $hits = [];
        if (in_array($user->member_role, ['owner', 'manager'], true)) {
            foreach (DB::table('cf_products')->where('store_slug', $slug)->where(fn ($q) => $q->where('name_ar', 'like', "%{$term}%")->orWhere('name_en', 'like', "%{$term}%")->orWhere('sku', 'like', "%{$term}%"))->limit(5)->get() as $product) {
                $hits[] = ['type' => 'product', 'title' => $product->name_ar, 'detail' => $product->sku ?? $product->name_en, 'href' => '/dashboard/products'];
            }
            if (DB::getSchemaBuilder()->hasTable('cf_store_files')) {
                foreach (DB::table('cf_store_files')->where('store_slug', $slug)->where('original_name', 'like', "%{$term}%")->limit(5)->get() as $file) {
                    $hits[] = ['type' => 'file', 'title' => $file->original_name, 'detail' => $file->mime_type, 'href' => '/dashboard/files'];
                }
            }
        }
        foreach (DB::table('cf_orders')->where('store_slug', $slug)->where(fn ($q) => $q->where('order_number', 'like', "%{$term}%")->orWhere('customer_name', 'like', "%{$term}%")->orWhere('phone', 'like', "%{$term}%"))->limit(5)->get() as $order) {
            $hits[] = ['type' => 'order', 'title' => $order->order_number.' · '.$order->customer_name, 'detail' => $order->phone, 'href' => '/dashboard/orders'];
        }

        return response()->json(['data' => array_slice($hits, 0, 12)]);
    }

    public function orders(Request $request): JsonResponse
    {
        [, , $slug] = $this->context($request);
        $orders = DB::table('cf_orders')->where('store_slug', $slug)->orderByDesc('id')->get();

        return response()->json(['data' => $orders]);
    }

    public function createOrder(Request $request): JsonResponse
    {
        [$user, , $slug] = $this->context($request);
        $this->manager($user);
        $data = $request->validate([
            'customer_name' => ['required', 'string', 'min:2', 'max:180'],
            'phone' => ['required', 'regex:/^01[0125][0-9]{8}$/'],
            'governorate' => ['required', 'string', 'max:120'],
            'address' => ['required', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100000'],
        ]);
        $id = DB::transaction(function () use ($data, $slug) {
            $items = [];
            $subtotal = 0;
            foreach ($data['items'] as $line) {
                $product = DB::table('cf_products')->where('store_slug', $slug)->where('id', $line['product_id'])->lockForUpdate()->first();
                abort_unless($product, 422, 'يوجد منتج غير تابع لهذا المتجر.');
                abort_if($product->stock_qty < $line['quantity'], 422, 'الكمية المطلوبة أكبر من المخزون.');
                $amount = round((float) $product->price * (int) $line['quantity'], 2);
                $subtotal += $amount;
                $items[] = ['product_id' => (int) $product->id, 'name_ar' => $product->name_ar, 'name_en' => $product->name_en, 'quantity' => (int) $line['quantity'], 'unit_price' => $product->price, 'line_total' => number_format($amount, 2, '.', '')];
            }
            $number = '#CF'.strtoupper(Str::random(4)).random_int(100, 999);
            $now = now();

            return DB::table('cf_orders')->insertGetId([
                'order_number' => $number, 'store_slug' => $slug, 'customer_name' => trim($data['customer_name']),
                'phone' => $data['phone'], 'governorate' => $data['governorate'], 'address' => trim($data['address']),
                'items' => json_encode($items, JSON_THROW_ON_ERROR), 'subtotal' => number_format($subtotal, 2, '.', ''),
                'shipping_fee' => '0.00', 'total' => number_format($subtotal, 2, '.', ''), 'status' => 'draft',
                'created_at' => $now, 'updated_at' => $now,
            ]);
        });

        app(PlatformEventRecorder::class)->record('order_created', $user->id, $slug, (string) DB::table('cf_orders')->where('id', $id)->value('order_number'), ['source' => 'merchant_draft']);

        return response()->json(['data' => DB::table('cf_orders')->where('id', $id)->first()], 201);
    }

    public function updateOrder(Request $request, int $order): JsonResponse
    {
        [$user, , $slug] = $this->context($request);
        abort_unless(in_array($user->member_role, ['owner', 'manager', 'staff', 'order_manager'], true), 403);
        $data = $request->validate(['status' => ['required', Rule::in(['new', 'processing', 'shipped', 'delivered', 'cancelled'])]]);
        $updated = DB::table('cf_orders')->where('store_slug', $slug)->where('id', $order)->update(['status' => $data['status'], 'updated_at' => now()]);
        abort_unless($updated, 404);

        return response()->json(['data' => DB::table('cf_orders')->where('id', $order)->first()]);
    }

    public function returns(Request $request): JsonResponse
    {
        [, , $slug] = $this->context($request);
        $rows = DB::table('cf_return_requests')->where('store_slug', $slug)->orderByDesc('id')->get();

        return response()->json(['data' => $rows]);
    }

    public function updateReturn(Request $request, int $return): JsonResponse
    {
        [$user, , $slug] = $this->context($request);
        abort_unless(in_array($user->member_role, ['owner', 'manager', 'staff', 'order_manager'], true), 403);
        $data = $request->validate(['status' => ['required', Rule::in(['approved', 'rejected'])]]);
        $result = DB::transaction(function () use ($data, $slug, $return) {
            $row = DB::table('cf_return_requests')->where('store_slug', $slug)->where('id', $return)->lockForUpdate()->first();
            abort_unless($row, 404);
            abort_unless($row->status === 'new', 409, 'تمت معالجة طلب الإرجاع مسبقاً.');
            DB::table('cf_return_requests')->where('id', $return)->update(['status' => $data['status'], 'updated_at' => now()]);
            if ($data['status'] === 'approved') {
                $order = DB::table('cf_orders')->where('store_slug', $slug)->where('id', $row->order_id)->lockForUpdate()->first();
                if ($order) {
                    $items = json_decode($order->items, true) ?: [];
                    foreach ($items as $item) {
                        if (isset($item['product_id'], $item['quantity'])) {
                            DB::table('cf_products')->where('store_slug', $slug)->where('id', $item['product_id'])->increment('stock_qty', (int) $item['quantity']);
                        }
                    }
                    DB::table('cf_orders')->where('id', $order->id)->update(['status' => 'cancelled', 'updated_at' => now()]);
                }
            }

            return DB::table('cf_return_requests')->where('id', $return)->first();
        });

        return response()->json(['data' => $result]);
    }

    public function products(Request $request): JsonResponse
    {
        [$user, , $slug] = $this->context($request);
        abort_unless(in_array($user->member_role, ['owner', 'manager'], true), 403);

        return response()->json(['data' => DB::table('cf_products')->where('store_slug', $slug)->orderByDesc('id')->get()->map(function (object $product) {
            $product->variants = $product->variants ? json_decode($product->variants, true) : [];
            return $product;
        })]);
    }

    public function updateProduct(Request $request, int $product): JsonResponse
    {
        return $this->saveProduct($request, $product);
    }

    public function saveProduct(Request $request, ?int $product = null): JsonResponse
    {
        [$user, , $slug] = $this->context($request);
        $this->manager($user);
        $data = $request->validate([
            'category_id' => ['nullable', 'integer'],
            'name_ar' => ['required', 'string', 'min:2', 'max:180'], 'name_en' => ['required', 'string', 'min:2', 'max:180'],
            'description_ar' => ['nullable', 'string', 'max:2000'], 'description_en' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999999'], 'old_price' => ['nullable', 'numeric', 'gt:price'],
            'stock_qty' => ['required', 'integer', 'min:0', 'max:10000000'], 'sku' => ['nullable', 'string', 'max:80'],
            'image_url' => ['nullable', 'url', 'max:1024'], 'variants' => ['nullable', 'array', 'max:100'],
            'variants.*' => ['string', 'max:100'],
        ]);
        if (! empty($data['category_id'])) abort_unless(DB::table('cf_categories')->where('store_slug', $slug)->where('id', $data['category_id'])->exists(), 422);
        $data['variants'] = json_encode($data['variants'] ?? [], JSON_THROW_ON_ERROR);
        $data['updated_at'] = now();
        if ($product) {
            $updated = DB::table('cf_products')->where('store_slug', $slug)->where('id', $product)->update($data);
            abort_unless($updated, 404);
            $id = $product;
        } else {
            $data['store_slug'] = $slug;
            $data['created_at'] = now();
            $id = DB::table('cf_products')->insertGetId($data);
        }

        return response()->json(['data' => DB::table('cf_products')->where('store_slug', $slug)->where('id', $id)->first()], $product ? 200 : 201);
    }

    public function deleteProduct(Request $request, int $product): JsonResponse
    {
        [$user, , $slug] = $this->context($request);
        $this->manager($user);
        abort_unless(DB::table('cf_products')->where('store_slug', $slug)->where('id', $product)->delete(), 404);

        return response()->json(['deleted' => true]);
    }

    public function collections(Request $request): JsonResponse
    {
        [$user, , $slug] = $this->context($request);
        abort_unless(in_array($user->member_role, ['owner', 'manager'], true), 403);

        return response()->json(['data' => DB::table('cf_categories')->where('store_slug', $slug)->orderBy('name_ar')->get()]);
    }

    public function createCollection(Request $request): JsonResponse
    {
        [$user, , $slug] = $this->context($request);
        $this->manager($user);
        $data = $request->validate(['name_ar' => ['required', 'string', 'min:2', 'max:120'], 'name_en' => ['required', 'string', 'min:2', 'max:120']]);
        $id = DB::table('cf_categories')->insertGetId([...$data, 'store_slug' => $slug, 'created_at' => now(), 'updated_at' => now()]);

        return response()->json(['data' => DB::table('cf_categories')->where('id', $id)->first()], 201);
    }

    public function updateCollection(Request $request, int $collection): JsonResponse
    {
        [$user, , $slug] = $this->context($request);
        $this->manager($user);
        $data = $request->validate(['name_ar' => ['required', 'string', 'min:2', 'max:120'], 'name_en' => ['required', 'string', 'min:2', 'max:120']]);
        abort_unless(DB::table('cf_categories')->where('store_slug', $slug)->where('id', $collection)->update([...$data, 'updated_at' => now()]), 404);

        return response()->json(['data' => DB::table('cf_categories')->where('id', $collection)->first()]);
    }

    public function deleteCollection(Request $request, int $collection): JsonResponse
    {
        [$user, , $slug] = $this->context($request);
        $this->manager($user);
        abort_unless(DB::table('cf_categories')->where('store_slug', $slug)->where('id', $collection)->delete(), 404);

        return response()->json(['deleted' => true]);
    }

    public function createWaybill(Request $request, int $order, ShippingIntegrationService $shipping): JsonResponse
    {
        [$user, , $slug] = $this->context($request);
        abort_unless(in_array($user->member_role, ['owner', 'manager', 'staff', 'order_manager'], true), 403);
        $data = $request->validate([
            'provider' => ['required', Rule::in(['manual', 'bosta', 'oto'])],
            'tracking_number' => ['required_if:provider,manual', 'nullable', 'string', 'max:120'],
            'label_url' => ['nullable', 'url', 'max:2048'],
        ]);
        try {
            $shipment = $shipping->createShipment($slug, $order, $data);
        } catch (ShippingProviderException $exception) {
            return response()->json(['message' => $exception->getMessage()], 502);
        }

        return response()->json(['data' => $shipment], 201);
    }

    public function files(Request $request): JsonResponse
    {
        [$user, $store, $slug] = $this->context($request);
        $this->manager($user);
        $rows = DB::table('cf_store_files')->where('store_slug', $slug)->orderByDesc('id')->get();

        return response()->json(['data' => $rows, 'quota' => ['used_bytes' => (int) $rows->sum('size_bytes'), 'limit_bytes' => 536870912]]);
    }

    public function uploadFile(Request $request): JsonResponse
    {
        [$user, $store, $slug] = $this->context($request);
        $this->manager($user);
        $data = $request->validate(['file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,svg', 'max:10240']]);
        $file = $data['file'];
        abort_if($file->getMimeType() === 'image/svg+xml' && preg_match('/<script|<foreignObject|\\son[a-z]+\\s*=|javascript:/i', $file->getContent()), 422, 'ملف SVG يحتوي على محتوى غير مسموح.');
        $used = (int) DB::table('cf_store_files')->where('store_slug', $slug)->sum('size_bytes');
        abort_if($used + $file->getSize() > 536870912, 413, 'تم تجاوز مساحة التخزين المسموحة.');
        $extension = strtolower($file->getClientOriginalExtension() ?: 'bin');
        $path = $file->storePubliclyAs('stores/'.$store->id, Str::uuid().'.'.$extension, 'public');
        $url = Storage::disk('public')->url($path);
        $id = DB::table('cf_store_files')->insertGetId([
            'store_slug' => $slug, 'uploaded_by' => $user->id, 'disk_path' => $path, 'public_url' => $url,
            'original_name' => mb_substr($file->getClientOriginalName(), 0, 255), 'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(), 'created_at' => now(), 'updated_at' => now(),
        ]);

        return response()->json(['data' => DB::table('cf_store_files')->where('id', $id)->first()], 201);
    }

    public function deleteFile(Request $request, int $file): JsonResponse
    {
        [$user, , $slug] = $this->context($request);
        $this->manager($user);
        $row = DB::table('cf_store_files')->where('store_slug', $slug)->where('id', $file)->first();
        abort_unless($row, 404);
        Storage::disk('public')->delete($row->disk_path);
        DB::table('cf_store_files')->where('id', $file)->delete();

        return response()->json(['deleted' => true]);
    }

    public function storefront(Request $request): JsonResponse
    {
        [$user, $store, $slug] = $this->context($request);
        abort_unless(in_array($user->member_role, ['owner', 'manager'], true), 403);

        return response()->json(['data' => ['slug' => $slug, 'template_slug' => $store->template_slug, 'config' => json_decode($store->config, true) ?: []]]);
    }

    public function updateStorefront(Request $request): JsonResponse
    {
        [$user, $store, $slug] = $this->context($request);
        $this->manager($user);
        $data = $request->validate([
            'store_name' => ['sometimes', 'string', 'min:2', 'max:120'], 'logo_url' => ['sometimes', 'nullable', 'url', 'max:1024'],
            'primary_color' => ['sometimes', 'regex:/^#[0-9A-Fa-f]{6}$/'], 'secondary_color' => ['sometimes', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'accent_color' => ['sometimes', 'regex:/^#[0-9A-Fa-f]{6}$/'], 'background_color' => ['sometimes', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'hero_title' => ['sometimes', 'string', 'max:180'], 'hero_subtitle' => ['sometimes', 'string', 'max:500'],
            'whatsapp' => ['sometimes', 'string', 'max:20'], 'returns_window_days' => ['sometimes', 'integer', Rule::in([7, 14])],
            'meta_pixel_id' => ['sometimes', 'nullable', 'string', 'max:64'], 'tiktok_pixel_id' => ['sometimes', 'nullable', 'string', 'max:64'],
            'snapchat_pixel_id' => ['sometimes', 'nullable', 'string', 'max:64'], 'domain' => ['sometimes', 'nullable', 'string', 'max:253'],
        ]);
        $config = array_replace_recursive(json_decode($store->config, true) ?: [], $data);
        if (isset($data['returns_window_days'])) {
            $days = $data['returns_window_days'];
            $config['returns_policy'] = ['ar' => "يمكن طلب الاستبدال أو الإرجاع خلال {$days} يوماً من استلام الطلب وفق حالة المنتج.", 'en' => "Returns and exchanges may be requested within {$days} days of delivery, subject to item condition."];
        }
        DB::table('cf_stores')->where('slug', $slug)->update(['config' => json_encode($config, JSON_THROW_ON_ERROR), 'updated_at' => now()]);

        return response()->json(['data' => $config]);
    }

    public function verifyDomain(Request $request): JsonResponse
    {
        [$user, $store, $slug] = $this->context($request);
        $this->manager($user);
        $config = json_decode($store->config, true) ?: [];
        $domain = strtolower(rtrim(trim((string) ($config['domain'] ?? '')), '.'));
        abort_if($domain === '', 422, 'أدخل نطاقاً مخصصاً أولاً.');
        $records = function_exists('dns_get_record') ? @dns_get_record($domain, DNS_CNAME) : false;
        $target = is_array($records) ? strtolower((string) ($records[0]['target'] ?? '')) : '';
        $verified = $target !== '' && (str_ends_with($target, '.elmatajer.com') || $target === 'elmatajer.com');
        if ($verified) {
            $config['custom_domain_status'] = 'active';
            DB::table('cf_stores')->where('slug', $slug)->update(['config' => json_encode($config, JSON_THROW_ON_ERROR), 'updated_at' => now()]);
        }

        return response()->json(['verified' => $verified, 'domain' => $domain, 'cname_target' => $target ?: null, 'expected_target' => $slug.'.elmatajer.com']);
    }

    public function analytics(Request $request): JsonResponse
    {
        [$user, , $slug] = $this->context($request);
        abort_unless(in_array($user->member_role, ['owner', 'manager'], true), 403);
        $orders = DB::table('cf_orders')->where('store_slug', $slug)->get();
        $products = DB::table('cf_products')->where('store_slug', $slug)->get();
        $delivered = $orders->where('status', 'delivered')->count();
        $sales = (float) $orders->where('status', '<>', 'cancelled')->sum('total');
        $coupons = DB::table('cf_coupons')->where('store_slug', $slug)->orderByDesc('id')->get();
        $daily = $orders->groupBy(fn (object $order) => substr((string) $order->created_at, 0, 10))->map(fn ($items, $day) => [
            'day' => $day,
            'sales' => (float) $items->where('status', '<>', 'cancelled')->sum('total'),
            'orders' => $items->count(),
            'delivered_orders' => $items->where('status', 'delivered')->count(),
        ])->values();

        $store = $request->attributes->get('merchant_store');
        $config = json_decode($store->config, true) ?: [];
        $shippingConfigured = DB::table('cf_store_shipping_rates')->where('store_slug', $slug)->exists()
            || DB::table('cf_store_shipping_integrations')->where('store_slug', $slug)->where('enabled', true)->exists();

        return response()->json(['data' => [
            'sales' => $sales, 'orders_total' => $orders->count(), 'delivery_success_rate' => $orders->count() ? round($delivered / $orders->count() * 100) : 0,
            'active_products' => $products->count(), 'low_stock' => $products->where('stock_qty', '<=', 5)->count(),
            'series' => $daily, 'coupons' => $coupons, 'storefront' => $config, 'shipping_configured' => $shippingConfigured,
        ]]);
    }

    public function requestRefinement(Request $request): JsonResponse
    {
        [$user, $store, $slug] = $this->context($request);
        $this->manager($user);
        $config = json_decode($store->config, true) ?: [];
        $config['developer_refinement_status'] = 'pending';
        $config['review_requested_at'] = now()->toIso8601String();
        DB::table('cf_stores')->where('slug', $slug)->update(['config' => json_encode($config, JSON_THROW_ON_ERROR), 'updated_at' => now()]);
        app(PlatformEventRecorder::class)->record('store_visual_updated', $user->id, $slug, 'review_requested', ['action' => 'merchant_review_request']);

        return response()->json(['requested' => true, 'status' => 'pending']);
    }

    public function coupons(Request $request, ?int $coupon = null): JsonResponse
    {
        [$user, , $slug] = $this->context($request);
        $this->manager($user);
        if ($request->isMethod('GET')) return response()->json(['data' => DB::table('cf_coupons')->where('store_slug', $slug)->orderByDesc('id')->get()]);
        if ($request->isMethod('DELETE')) {
            abort_unless(DB::table('cf_coupons')->where('store_slug', $slug)->where('id', $coupon)->delete(), 404);
            return response()->json(['deleted' => true]);
        }
        $rules = [
            'code' => ['sometimes', 'required', 'string', 'min:3', 'max:64', 'regex:/^[A-Za-z0-9_-]+$/'],
            'discount_type' => ['sometimes', 'required', Rule::in(['percentage', 'fixed', 'free_shipping'])],
            'discount_value' => ['sometimes', 'required', 'numeric', 'min:0', 'max:1000000'],
            'minimum_order' => ['sometimes', 'numeric', 'min:0'], 'usage_limit' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'expires_at' => ['sometimes', 'nullable', 'date', 'after:now'], 'is_active' => ['sometimes', 'boolean'],
        ];
        $data = $request->validate($rules);
        if ($coupon) {
            unset($data['code']);
            $updated = DB::table('cf_coupons')->where('store_slug', $slug)->where('id', $coupon)->update([...$data, 'updated_at' => now()]);
            abort_unless($updated, 404);
        } else {
            $data = [...['discount_type' => 'percentage', 'discount_value' => 0, 'minimum_order' => 0, 'is_active' => true, 'used_count' => 0], ...$data, 'store_slug' => $slug, 'created_at' => now(), 'updated_at' => now()];
            $coupon = DB::table('cf_coupons')->insertGetId($data);
        }

        return response()->json(['data' => DB::table('cf_coupons')->where('id', $coupon)->first()], $request->isMethod('POST') ? 201 : 200);
    }

    public function staff(Request $request, ?int $staff = null): JsonResponse
    {
        [$user, , $slug] = $this->context($request);
        $this->manager($user);
        if ($request->isMethod('GET')) {
            $members = User::query()->where('role', 'merchant')->where('store_slug', $slug)->whereIn('member_role', ['manager', 'staff', 'order_manager'])->get(['id', 'name', 'email', 'member_role']);
            $invites = DB::table('cf_staff_invitations')->where('store_slug', $slug)->whereNull('accepted_at')->where('expires_at', '>', now())->get(['id', 'email', 'member_role', 'expires_at']);
            return response()->json(['data' => ['members' => $members, 'invitations' => $invites]]);
        }
        if ($request->isMethod('DELETE')) {
            $member = User::query()->where('id', $staff)->where('store_slug', $slug)->whereIn('member_role', ['manager', 'staff', 'order_manager'])->first();
            abort_unless($member, 404);
            $member->forceFill(['store_slug' => null, 'member_role' => null])->save();
            return response()->json(['removed' => true]);
        }
        $data = $request->validate(['email' => ['required', 'email', 'max:255'], 'member_role' => ['required', Rule::in(['staff', 'order_manager'])]]);
        abort_if(strtolower($data['email']) === strtolower($user->email), 422, 'لا يمكن دعوة الحساب نفسه.');
        $token = Str::random(48);
        $inviteId = DB::table('cf_staff_invitations')->insertGetId([
            'store_slug' => $slug, 'email' => strtolower($data['email']), 'member_role' => $data['member_role'],
            'permissions' => json_encode(['orders' => true, 'returns' => true, 'billing' => false, 'carrier_secrets' => false, 'analytics' => false]),
            'token_hash' => hash('sha256', $token), 'invited_by' => $user->id, 'expires_at' => now()->addDays(7),
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $invite = DB::table('cf_staff_invitations')->where('id', $inviteId)->first(['id', 'email', 'member_role', 'expires_at']);

        return response()->json(['data' => $invite, 'accept_url' => url('/dashboard/invite/'.$token)], 201);
    }

    public function acceptStaffInvite(Request $request, string $token): JsonResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User && $user->role === 'merchant' && ! $user->store_slug, 403);
        $invite = DB::table('cf_staff_invitations')->where('token_hash', hash('sha256', $token))->whereNull('accepted_at')->where('expires_at', '>', now())->first();
        abort_unless($invite && hash_equals(strtolower($invite->email), strtolower($user->email)), 403);
        DB::transaction(function () use ($invite, $user) {
            DB::table('cf_staff_invitations')->where('id', $invite->id)->update(['accepted_at' => now(), 'updated_at' => now()]);
            $user->forceFill(['store_slug' => $invite->store_slug, 'member_role' => $invite->member_role])->save();
        });

        return response()->json(['accepted' => true, 'store_slug' => $invite->store_slug]);
    }

    public function planUpgrade(Request $request): JsonResponse
    {
        [$user, , $slug] = $this->context($request);
        $this->manager($user);
        $data = $request->validate(['plan' => ['required', Rule::in(['pro', 'enterprise'])]]);
        $id = DB::table('cf_plan_upgrade_requests')->insertGetId([
            'store_slug' => $slug, 'user_id' => $user->id, 'requested_plan' => $data['plan'], 'status' => 'new',
            'created_at' => now(), 'updated_at' => now(),
        ]);
        app(PlatformEventRecorder::class)->record('plan_upgrade_requested', $user->id, $slug, $data['plan']);

        return response()->json(['data' => DB::table('cf_plan_upgrade_requests')->where('id', $id)->first()], 201);
    }
}
