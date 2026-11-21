<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Support\SecurityEventLogger;
use DomainException;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Socialite\Facades\Socialite;
use PragmaRX\Google2FA\Google2FA;
use TypeError;
use UnexpectedValueException;

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
            'whatsapp_phone' => $data['whatsapp_phone'],
            'market' => $data['market'],
        ]);

        return $this->issueToken($user, 'storefront-registration', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();
        $rateLimitKey = 'commerceforge-login:'.hash('sha256', strtolower($data['email']).'|'.$request->ip());
        $maximumAttempts = app()->environment('local') ? 100 : 5;
        $decaySeconds = app()->environment('local') ? 60 : 900;

        if (RateLimiter::tooManyAttempts($rateLimitKey, $maximumAttempts)) {
            return response()->json(['message' => 'محاولات كثيرة. أعد المحاولة بعد 15 دقيقة.'], 429, [
                'Retry-After' => (string) RateLimiter::availableIn($rateLimitKey),
            ]);
        }

        $user = User::query()->where('email', strtolower($data['email']))->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            $attempts = RateLimiter::hit($rateLimitKey, $decaySeconds);
            SecurityEventLogger::record(
                $request,
                'login.failed',
                $attempts >= $maximumAttempts ? 'high' : 'medium',
                $user?->id,
                $data['email'],
                ['attempts' => $attempts],
            );

            return response()->json([
                'message' => 'بيانات تسجيل الدخول غير صحيحة.',
            ], $attempts >= $maximumAttempts ? 429 : 422);
        }

        if ($user->two_factor_enabled) {
            $code = $request->input('two_factor_code');
            if (! is_string($code) || $code === '') {
                return response()->json([
                    'message' => 'أدخل رمز التحقق بخطوتين.',
                    'two_factor_required' => true,
                ], 422);
            }

            if (! preg_match('/^\d{6}$/', $code) || ! app(Google2FA::class)->verifyKey((string) $user->two_factor_secret, $code)) {
                SecurityEventLogger::record($request, 'login.two_factor_failed', 'high', $user->id, $user->email);

                return response()->json(['message' => 'رمز التحقق غير صحيح.'], 422);
            }
        }

        RateLimiter::clear($rateLimitKey);
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

    public function setupTwoFactor(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        $secret = app(Google2FA::class)->generateSecretKey();
        $user->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_enabled' => false,
        ])->save();
        SecurityEventLogger::record($request, 'two_factor.setup_started', 'medium', $user->id);

        return response()->json([
            'secret' => $secret,
            'otpauth_url' => app(Google2FA::class)->getQRCodeUrl(config('app.name'), $user->email, $secret),
        ]);
    }

    public function verifyTwoFactor(Request $request): JsonResponse
    {
        $data = $request->validate(['code' => ['required', 'regex:/^\d{6}$/']]);
        $user = $request->user();
        abort_unless($user instanceof User && is_string($user->two_factor_secret), 409);

        if (! app(Google2FA::class)->verifyKey($user->two_factor_secret, $data['code'])) {
            SecurityEventLogger::record($request, 'two_factor.setup_failed', 'high', $user->id);

            return response()->json(['message' => 'رمز التحقق غير صحيح.'], 422);
        }

        $user->forceFill(['two_factor_enabled' => true])->save();
        SecurityEventLogger::record($request, 'two_factor.enabled', 'high', $user->id);

        return response()->json(['two_factor_enabled' => true]);
    }

    public function disableTwoFactor(Request $request): JsonResponse
    {
        $data = $request->validate(['code' => ['required', 'regex:/^\d{6}$/']]);
        $user = $request->user();
        abort_unless($user instanceof User && $user->two_factor_enabled, 409);

        if (! app(Google2FA::class)->verifyKey((string) $user->two_factor_secret, $data['code'])) {
            SecurityEventLogger::record($request, 'two_factor.disable_failed', 'high', $user->id);

            return response()->json(['message' => 'رمز التحقق غير صحيح.'], 422);
        }

        $user->forceFill(['two_factor_enabled' => false, 'two_factor_secret' => null])->save();
        SecurityEventLogger::record($request, 'two_factor.disabled', 'high', $user->id);

        return response()->json(['two_factor_enabled' => false]);
    }

    public function googleRedirect(Request $request): RedirectResponse
    {
        abort_unless(
            config('services.google.client_id')
                && config('services.google.client_secret')
                && config('services.google.redirect'),
            503,
            'تسجيل الدخول عبر Google غير مُعدّ بعد.',
        );

        $data = $request->validate([
            'mode' => ['sometimes', 'in:login,register'],
            'whatsapp_phone' => ['required_if:mode,register', 'nullable', 'regex:/^(?:\+20(?:10|11|12|15)[0-9]{8}|\+9665[0-9]{8})$/'],
            'market' => ['required_if:mode,register', 'nullable', 'in:EG,SA'],
        ]);
        if (($data['market'] ?? null) === 'EG' && ! str_starts_with((string) ($data['whatsapp_phone'] ?? ''), '+20')) {
            abort(422, 'مفتاح الدولة لا يتوافق مع السوق المختار.');
        }
        if (($data['market'] ?? null) === 'SA' && ! str_starts_with((string) ($data['whatsapp_phone'] ?? ''), '+966')) {
            abort(422, 'مفتاح الدولة لا يتوافق مع السوق المختار.');
        }
        if (($data['mode'] ?? 'login') === 'register') {
            $request->session()->put('commerceforge_google_registration', [
                'whatsapp_phone' => $data['whatsapp_phone'],
                'market' => $data['market'],
            ]);
        }

        return Socialite::driver('google')->redirect();
    }

    public function googleCallback(Request $request): RedirectResponse
    {
        $googleUser = Socialite::driver('google')->user();
        $email = strtolower(trim((string) $googleUser->getEmail()));
        $verified = filter_var(
            $googleUser->user['email_verified'] ?? false,
            FILTER_VALIDATE_BOOLEAN,
        );

        abort_unless($verified && filter_var($email, FILTER_VALIDATE_EMAIL), 403);

        $registration = $request->session()->pull('commerceforge_google_registration');
        $user = User::query()->firstOrNew(['email' => $email]);

        if (! $user->exists) {
            $user->name = trim((string) $googleUser->getName()) ?: $email;
            $user->password = Hash::make(Str::random(64));
            $user->market = 'EG';
            if (is_array($registration)) {
                $user->whatsapp_phone = $registration['whatsapp_phone'];
                $user->market = $registration['market'];
            }
        } elseif (is_array($registration) && $user->whatsapp_phone === null) {
            $user->whatsapp_phone = $registration['whatsapp_phone'];
            $user->market = $registration['market'];
        }

        $user->google_id = (string) $googleUser->getId();
        $user->role = $this->roleFor($email);
        $user->save();

        if ($user->two_factor_enabled) {
            SecurityEventLogger::record(request(), 'login.oauth_two_factor_blocked', 'high', $user->id, $user->email);

            return redirect()->away(
                rtrim(config('commerceforge.storefront_url'), '/').'/login?notice=oauth-two-factor-required',
            );
        }

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

        $personalAccessToken = PersonalAccessToken::findToken($token);
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
            'id_token' => ['required_without:idToken', 'string', 'min:20', 'max:8192'],
            'idToken' => ['required_without:id_token', 'string', 'min:20', 'max:8192'],
            'two_factor_code' => ['sometimes', 'digits:6'],
            'whatsapp_phone' => ['sometimes', 'nullable', 'regex:/^(?:\+20(?:10|11|12|15)[0-9]{8}|\+9665[0-9]{8})$/'],
            'market' => ['sometimes', 'nullable', 'in:EG,SA'],
        ]);
        if (isset($data['whatsapp_phone']) xor isset($data['market'])) {
            abort(422, 'يجب إرسال رقم واتساب والسوق معاً.');
        }
        if (($data['market'] ?? null) === 'EG' && isset($data['whatsapp_phone']) && ! str_starts_with($data['whatsapp_phone'], '+20')) {
            abort(422, 'مفتاح الدولة لا يتوافق مع السوق المختار.');
        }
        if (($data['market'] ?? null) === 'SA' && isset($data['whatsapp_phone']) && ! str_starts_with($data['whatsapp_phone'], '+966')) {
            abort(422, 'مفتاح الدولة لا يتوافق مع السوق المختار.');
        }
        $projectId = (string) config('services.firebase.project_id', 'commerce-forge-c3d86');
        abort_unless($projectId !== '', 503, 'تسجيل Firebase غير مُعدّ بعد.');

        try {
            $keySet = Cache::remember('google_firebase_certs', 3600, function () {
                $response = Http::acceptJson()
                    ->connectTimeout(5)
                    ->timeout(5)
                    ->get('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
                $response->throw();

                $keySet = $response->json();
                abort_unless(is_array($keySet) && is_array($keySet['keys'] ?? null), 503, 'تعذر تحميل مفاتيح التحقق من Firebase.');

                return $keySet;
            });
        } catch (ConnectionException|RequestException $exception) {
            report($exception);

            return response()->json(['message' => 'تعذر الاتصال بخدمة التحقق من Firebase.'], 503);
        }

        try {
            $claims = JWT::decode(
                (string) ($data['id_token'] ?? $data['idToken']),
                JWK::parseKeySet($keySet, 'RS256'),
            );
        } catch (UnexpectedValueException|DomainException|InvalidArgumentException|TypeError) {
            return response()->json(['message' => 'تعذر التحقق من حساب Google.'], 401);
        }

        $expectedIssuer = 'https://securetoken.google.com/'.$projectId;
        abort_unless(
            is_string($claims->iss ?? null) && hash_equals($expectedIssuer, $claims->iss)
                && is_string($claims->aud ?? null) && hash_equals($projectId, $claims->aud)
                && is_numeric($claims->exp ?? null) && (int) $claims->exp > time(),
            401,
            'تعذر التحقق من مصدر رمز تسجيل الدخول.',
        );

        $email = strtolower(trim((string) ($claims->email ?? '')));
        $verified = ($claims->email_verified ?? false) === true;
        $firebaseUid = trim((string) ($claims->sub ?? ''));
        abort_unless(
            $verified && $firebaseUid !== '' && filter_var($email, FILTER_VALIDATE_EMAIL),
            403,
            'يجب استخدام حساب Google موثق بالبريد الإلكتروني.',
        );

        $existingUser = User::query()->where('email', $email)->first();
        $role = $this->roleFor($email);
        $hasWhatsappPhoneColumn = Schema::hasColumn('users', 'whatsapp_phone');
        if ($existingUser?->two_factor_enabled) {
            if (! isset($data['two_factor_code'])) {
                return response()->json([
                    'message' => 'أدخل رمز التحقق بخطوتين.',
                    'two_factor_required' => true,
                ], 422);
            }

            if (! app(Google2FA::class)->verifyKey((string) $existingUser->two_factor_secret, $data['two_factor_code'])) {
                SecurityEventLogger::record($request, 'login.two_factor_failed', 'high', $existingUser->id, $existingUser->email);

                return response()->json(['message' => 'رمز التحقق غير صحيح.'], 422);
            }
        }

        $name = $existingUser?->name ?: trim((string) ($claims->name ?? '')) ?: $email;
        $nameParts = preg_split('/\s+/', $name, 2) ?: [];
        $attributes = ['name' => $name];
        if ($existingUser === null) {
            $attributes['password'] = Hash::make(Str::random(32));
        }
        if (Schema::hasColumn('users', 'role')) {
            $attributes['role'] = $role;
        }
        if (Schema::hasColumn('users', 'first_name')) {
            $attributes['first_name'] = $nameParts[0] ?? $name;
        }
        if (Schema::hasColumn('users', 'last_name')) {
            $attributes['last_name'] = $nameParts[1] ?? '';
        }
        if ($hasWhatsappPhoneColumn) {
            $attributes['whatsapp_phone'] = $existingUser?->whatsapp_phone
                ?? $data['whatsapp_phone']
                ?? null;
        }
        if (Schema::hasColumn('users', 'market')) {
            $attributes['market'] = $existingUser?->market
                ?? $data['market']
                ?? 'EG';
        }

        $user = User::unguarded(fn () => User::updateOrCreate(['email' => $email], $attributes));
        $extraAttributes = [];
        if (Schema::hasColumn('users', 'firebase_uid')) {
            $extraAttributes['firebase_uid'] = $firebaseUid;
        }
        if (Schema::hasColumn('users', 'avatar') && is_string($claims->picture ?? null)) {
            $extraAttributes['avatar'] = $claims->picture;
        }
        if ($extraAttributes !== []) {
            $user->forceFill($extraAttributes)->save();
        }

        SecurityEventLogger::record($request, 'login_success', 'low', $user->id, $user->email);

        $userData = $this->present($user);
        $userData['role'] = $user->role ?? $role;
        $userData['whatsapp_phone'] = $userData['whatsappPhone'];
        $userData['has_store'] = (bool) $user->store_slug;

        return response()->json([
            'status' => 'ok',
            'token' => $user->createToken('commerceforge-web')->plainTextToken,
            'user' => $userData,
        ]);
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
            'memberRole' => $user->member_role,
            'storeSlug'  => $user->store_slug,
            'whatsappPhone' => $user->whatsapp_phone,
            'market' => $user->market,
            'twoFactorEnabled' => (bool) $user->two_factor_enabled,
        ];
    }
}
