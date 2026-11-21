<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Laravel\Socialite\Facades\Socialite;
use Tests\TestCase;

class FirebaseOnboardingTest extends TestCase
{
    public function test_new_oauth_user_gets_default_market_and_is_redirected_to_launch_flow(): void
    {
        $email = 'oauth-new-'.uniqid().'@example.test';
        $googleUser = \Mockery::mock(\Laravel\Socialite\Two\User::class);
        $googleUser->user = ['email_verified' => true];
        $googleUser->shouldReceive('getEmail')->once()->andReturn($email);
        $googleUser->shouldReceive('getName')->once()->andReturn('New OAuth Merchant');
        $googleUser->shouldReceive('getId')->once()->andReturn('new-oauth-uid');

        $provider = \Mockery::mock();
        $provider->shouldReceive('user')->once()->andReturn($googleUser);
        Socialite::shouldReceive('driver')->once()->with('google')->andReturn($provider);

        $response = $this->get('/api/v1/auth/google/callback');

        $response->assertRedirectContains('/api/auth/google/callback?code=');
        $this->assertDatabaseHas('users', [
            'email' => $email,
            'name' => 'New OAuth Merchant',
            'role' => 'merchant',
            'market' => 'EG',
            'whatsapp_phone' => null,
            'store_slug' => null,
        ]);
    }

    public function test_existing_google_user_without_whatsapp_can_sign_in(): void
    {
        $email = 'firebase-existing-'.uniqid().'@example.test';
        User::query()->create([
            'name' => 'Existing Google Merchant',
            'email' => $email,
            'password' => 'test-password',
            'role' => 'merchant',
            'member_role' => 'owner',
            'store_slug' => null,
            'whatsapp_phone' => null,
            'market' => 'EG',
        ]);

        $this->fakeFirebaseCertificates();

        $response = $this->postJson('/api/v1/auth/firebase', [
            'idToken' => $this->firebaseToken($email, 'existing-google-uid'),
        ]);

        $response->assertOk()
            ->assertJsonPath('user.email', $email)
            ->assertJsonPath('user.whatsappPhone', null)
            ->assertJsonStructure(['token', 'user']);
    }

    public function test_new_google_user_is_created_without_contact_details_and_gets_a_token(): void
    {
        $email = 'firebase-new-'.uniqid().'@example.test';
        $this->fakeFirebaseCertificates();

        $response = $this->postJson('/api/v1/auth/firebase', [
            'idToken' => $this->firebaseToken($email, 'new-google-uid'),
        ]);

        $response->assertOk()
            ->assertJsonPath('user.email', $email)
            ->assertJsonPath('user.role', 'merchant')
            ->assertJsonPath('user.storeSlug', null)
            ->assertJsonStructure(['token', 'user']);

        $this->assertDatabaseHas('users', [
            'email' => $email,
            'name' => 'New Google Merchant',
            'whatsapp_phone' => null,
            'store_slug' => null,
        ]);
    }

    private function fakeFirebaseCertificates(): void
    {
        Cache::forget('google_firebase_certs');
        $privateKey = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        $details = openssl_pkey_get_details($privateKey);

        Http::fake([
            'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com' => Http::response([
                'keys' => [[
                    'kid' => 'commerceforge-test-key',
                    'kty' => 'RSA',
                    'alg' => 'RS256',
                    'use' => 'sig',
                    'n' => $this->base64UrlEncode($details['rsa']['n']),
                    'e' => $this->base64UrlEncode($details['rsa']['e']),
                ]],
            ]),
        ]);

        $this->privateKey = $privateKey;
    }

    private mixed $privateKey = null;

    private function firebaseToken(string $email, string $uid): string
    {
        $projectId = (string) config('services.firebase.project_id', 'commerce-forge-c3d86');
        $header = $this->base64UrlEncode(json_encode([
            'alg' => 'RS256',
            'kid' => 'commerceforge-test-key',
            'typ' => 'JWT',
        ], JSON_THROW_ON_ERROR));
        $claims = $this->base64UrlEncode(json_encode([
            'aud' => $projectId,
            'iss' => 'https://securetoken.google.com/'.$projectId,
            'sub' => $uid,
            'email' => $email,
            'email_verified' => true,
            'name' => 'New Google Merchant',
            'iat' => time(),
            'exp' => time() + 300,
        ], JSON_THROW_ON_ERROR));
        $input = $header.'.'.$claims;
        openssl_sign($input, $signature, $this->privateKey, OPENSSL_ALGO_SHA256);

        return $input.'.'.$this->base64UrlEncode($signature);
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
