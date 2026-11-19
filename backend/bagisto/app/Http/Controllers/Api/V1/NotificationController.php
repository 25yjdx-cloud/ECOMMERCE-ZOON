<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $locale = $request->query('lang') === 'en' ? 'en' : 'ar';
        $notifications = [
            [
                'id' => 'welcome',
                'title' => $locale === 'ar' ? 'مرحباً بك في CommerceForge' : 'Welcome to CommerceForge',
                'body' => $locale === 'ar' ? 'يمكنك البدء من أي قالب وإنشاء مساحة متجرك الخاصة.' : 'Choose a template and create your own store workspace.',
                'created_at' => now()->toIso8601String(),
            ],
            [
                'id' => 'templates-updated',
                'title' => $locale === 'ar' ? 'تم تحديث قوالب المتاجر الخمسة' : 'The five store templates were updated',
                'body' => $locale === 'ar' ? 'استكشف المعرض لمعاينة أحدث اتجاهات التصميم.' : 'Explore the gallery to preview the latest designs.',
                'created_at' => now()->toIso8601String(),
            ],
            [
                'id' => 'advisor-tip',
                'title' => $locale === 'ar' ? 'نصيحة المساعد الذكي لاختيار قالبك' : 'A smart tip for choosing your template',
                'body' => $locale === 'ar' ? 'أخبر المساعد بنوع نشاطك للحصول على توصية أولية.' : 'Tell the advisor about your business to get an initial recommendation.',
                'created_at' => now()->toIso8601String(),
            ],
        ];

        $user = Auth::guard('sanctum')->user();
        if ($user instanceof User && $user->role === 'merchant' && is_string($user->store_slug)) {
            $newOrders = DB::table('cf_orders')
                ->where('store_slug', $user->store_slug)
                ->where('status', 'new')
                ->count();

            if ($newOrders > 0) {
                $notifications[] = [
                    'id' => 'new-orders-'.$user->store_slug,
                    'title' => $locale === 'ar' ? 'لديك طلبات جديدة' : 'You have new orders',
                    'body' => $locale === 'ar' ? "عدد الطلبات الجديدة: {$newOrders}." : "New order count: {$newOrders}.",
                    'created_at' => now()->toIso8601String(),
                ];
            }
        }

        return response()->json(['data' => $notifications]);
    }
}
