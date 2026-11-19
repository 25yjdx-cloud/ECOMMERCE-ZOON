<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = User::create([
            'name'     => trim($data['name']),
            'email'    => strtolower($data['email']),
            'password' => $data['password'],
            'role'     => $this->roleFor($data['email']),
        ]);

        return $this->issueToken($user, 'storefront-registration', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = User::query()->where('email', strtolower($data['email']))->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'بيانات تسجيل الدخول غير صحيحة.',
            ], 422);
        }

        $this->synchronizeRole($user);

        return $this->issueToken($user, 'storefront-login');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        abort_unless($user instanceof User, 401);
        $this->synchronizeRole($user);

        return response()->json(['user' => $this->present($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'تم تسجيل الخروج.']);
    }

    public function googleRedirect(): RedirectResponse
    {
        abort_unless(
            config('services.google.client_id')
                && config('services.google.client_secret')
                && config('services.google.redirect'),
            503,
            'تسجيل الدخول عبر Google غير مُعدّ بعد.',
        );

        return Socialite::driver('google')->redirect();
    }

    public function googleCallback(): RedirectResponse
    {
        $googleUser = Socialite::driver('google')->user();
        $email = strtolower(trim((string) $googleUser->getEmail()));
        $verified = filter_var(
            $googleUser->user['email_verified'] ?? false,
            FILTER_VALIDATE_BOOLEAN,
        );

        abort_unless($verified && filter_var($email, FILTER_VALIDATE_EMAIL), 403);

        $user = User::query()->firstOrNew(['email' => $email]);

        if (! $user->exists) {
            $user->name = trim((string) $googleUser->getName()) ?: $email;
            $user->password = Hash::make(Str::random(64));
        }

        $user->google_id = (string) $googleUser->getId();
        $user->role = $this->roleFor($email);
        $user->save();

        $token = $user->createToken('storefront-google-login')->plainTextToken;
        $code = Str::random(64);
        Cache::put('commerceforge_google_oauth:'.$code, $token, now()->addMinute());

        return redirect()->away(
            rtrim(config('commerceforge.storefront_url'), '/').'/api/auth/google/callback?code='.urlencode($code),
        );
    }

    public function exchangeGoogleCode(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'size:64'],
        ]);
        $token = Cache::pull('commerceforge_google_oauth:'.$data['code']);

        abort_unless(is_string($token), 401, 'انتهت صلاحية تسجيل Google. أعد المحاولة.');

        $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
        abort_unless($personalAccessToken, 401);
        $user = $personalAccessToken->tokenable;
        abort_unless($user instanceof User, 401);

        return response()->json([
            'token' => $token,
            'user'  => $this->present($user),
        ]);
    }

    public function firebaseGoogle(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id_token' => ['required', 'string', 'min:20', 'max:8192'],
        ]);
        $apiKey = (string) config('services.firebase.api_key');

        abort_unless($apiKey !== '', 503, 'تسجيل Firebase غير مُعدّ بعد.');

        $identity = Http::acceptJson()
            ->timeout(10)
            ->post('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key='.urlencode($apiKey), [
                'idToken' => $data['id_token'],
            ]);

        if (! $identity->successful()) {
            return response()->json(['message' => 'تعذر التحقق من حساب Google.'], 401);
        }

        $firebaseUser = $identity->json('users.0');
        $email = strtolower(trim((string) data_get($firebaseUser, 'email', '')));
        $verified = filter_var(data_get($firebaseUser, 'emailVerified', false), FILTER_VALIDATE_BOOLEAN);

        abort_unless(
            $verified && filter_var($email, FILTER_VALIDATE_EMAIL),
            403,
            'يجب استخدام حساب Google موثق بالبريد الإلكتروني.',
        );

        $user = User::query()->firstOrNew(['email' => $email]);
        if (! $user->exists) {
            $user->name = trim((string) data_get($firebaseUser, 'displayName', '')) ?: $email;
            $user->password = Hash::make(Str::random(64));
        }

        $user->google_id = (string) data_get($firebaseUser, 'localId');
        $user->role = $this->roleFor($email);
        $user->save();

        return $this->issueToken($user, 'storefront-firebase-google');
    }

    private function issueToken(User $user, string $device, int $status = 200): JsonResponse
    {
        return response()->json([
            'token' => $user->createToken($device)->plainTextToken,
            'user'  => $this->present($user),
        ], $status);
    }

    private function synchronizeRole(User $user): void
    {
        $role = $this->roleFor($user->email);

        if ($user->role !== $role) {
            $user->forceFill(['role' => $role])->save();
        }
    }

    private function roleFor(string $email): string
    {
        $ownerEmail = strtolower(trim((string) config('commerceforge.owner_email')));

        return $ownerEmail !== '' && hash_equals($ownerEmail, strtolower($email))
            ? 'super_admin'
            : 'merchant';
    }

    private function present(User $user): array
    {
        return [
            'id'        => $user->id,
            'name'      => $user->name,
            'email'     => $user->email,
            'role'      => $user->role,
            'storeSlug' => $user->store_slug,
        ];
    }
}
