<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $locale = $request->query('lang') === 'en' ? 'en' : 'ar';
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        $query = $this->visibleNotifications($user);
        $unreadCount = (clone $query)
            ->leftJoin('cf_notification_reads as reads', function ($join) use ($user) {
                $join->on('reads.notification_id', '=', 'cf_notifications.id')
                    ->where('reads.user_id', '=', $user->id);
            })
            ->whereNull('reads.id')
            ->count();

        $data = $query
            ->leftJoin('cf_notification_reads as reads', function ($join) use ($user) {
                $join->on('reads.notification_id', '=', 'cf_notifications.id')
                    ->where('reads.user_id', '=', $user->id);
            })
            ->select([
                'cf_notifications.id',
                'cf_notifications.type',
                'cf_notifications.created_at',
                DB::raw($locale === 'ar' ? 'cf_notifications.title_ar as title' : 'cf_notifications.title_en as title'),
                DB::raw($locale === 'ar' ? 'cf_notifications.body_ar as body' : 'cf_notifications.body_en as body'),
                DB::raw('reads.id is not null as is_read'),
            ])
            ->orderByDesc('cf_notifications.id')
            ->limit(50)
            ->get()
            ->map(fn (object $item) => [
                'id' => $item->id,
                'type' => $item->type,
                'title' => $item->title,
                'body' => $item->body,
                'created_at' => $item->created_at,
                'read' => (bool) $item->is_read,
            ]);

        return response()->json(['data' => $data, 'unread_count' => $unreadCount]);
    }

    public function markRead(Request $request, int $notification): JsonResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);
        $visible = $this->visibleNotifications($user)->where('cf_notifications.id', $notification)->exists();
        abort_unless($visible, 404);

        DB::table('cf_notification_reads')->insertOrIgnore([
            'notification_id' => $notification,
            'user_id' => $user->id,
            'read_at' => now(),
        ]);

        return response()->json(['read' => true]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);
        $now = now();

        $rows = $this->visibleNotifications($user)->pluck('cf_notifications.id')
            ->map(fn (int $id) => [
                'notification_id' => $id,
                'user_id' => $user->id,
                'read_at' => $now,
            ])
            ->all();

        if ($rows !== []) {
            DB::table('cf_notification_reads')->insertOrIgnore($rows);
        }

        return response()->json(['read' => true]);
    }

    private function visibleNotifications(User $user): \Illuminate\Database\Query\Builder
    {
        return DB::table('cf_notifications')->where(function ($query) use ($user) {
            $query->where('cf_notifications.recipient_user_id', $user->id);

            if ($user->role === 'super_admin') {
                $query->orWhere('cf_notifications.recipient_role', 'super_admin');
            } elseif (is_string($user->store_slug)) {
                $query->orWhere(function ($storeQuery) use ($user) {
                    $storeQuery->where('cf_notifications.recipient_role', 'store_member')
                        ->where('cf_notifications.store_slug', $user->store_slug);
                });
            }
        });
    }
}
