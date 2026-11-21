<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class PlatformOwnerAccessTest extends TestCase
{
    public function test_only_whitelisted_google_owner_tokens_can_access_admin_api(): void
    {
        config(['commerceforge.manager_allowed_google_emails' => ['owner-one@example.test', 'owner-two@example.test']]);
        $owner = User::query()->create([
            'name' => 'Whitelisted Owner', 'email' => 'owner-one@example.test', 'password' => 'test-password',
            'role' => 'super_admin', 'google_id' => 'google-owner-uid', 'market' => 'EG',
        ]);
        $ownerToken = $owner->createToken('commerceforge-google-owner')->plainTextToken;
        Auth::forgetGuards();
        $this->getJson('/api/v1/admin/access-check', ['Authorization' => 'Bearer '.$ownerToken])->assertOk();

        $unlisted = User::query()->create([
            'name' => 'Unlisted Owner', 'email' => 'unlisted@example.test', 'password' => 'test-password',
            'role' => 'super_admin', 'google_id' => 'google-unlisted-uid', 'market' => 'EG',
        ]);
        $unlistedToken = $unlisted->createToken('commerceforge-google-owner')->plainTextToken;
        Auth::forgetGuards();
        $this->getJson('/api/v1/admin/access-check', ['Authorization' => 'Bearer '.$unlistedToken])->assertForbidden();

        $passwordToken = $owner->createToken('storefront-login')->plainTextToken;
        Auth::forgetGuards();
        $this->getJson('/api/v1/admin/access-check', ['Authorization' => 'Bearer '.$passwordToken])->assertForbidden();
    }

    public function test_allowlist_must_contain_exactly_two_valid_addresses(): void
    {
        config(['commerceforge.manager_allowed_google_emails' => ['owner-one@example.test']]);
        $owner = User::query()->create([
            'name' => 'Fail Closed Owner', 'email' => 'owner-one@example.test', 'password' => 'test-password',
            'role' => 'super_admin', 'google_id' => 'google-fail-closed-uid', 'market' => 'EG',
        ]);
        $token = $owner->createToken('commerceforge-google-owner')->plainTextToken;
        $this->getJson('/api/v1/admin/access-check', ['Authorization' => 'Bearer '.$token])->assertForbidden();
    }
}
