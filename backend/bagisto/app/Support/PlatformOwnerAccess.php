<?php

namespace App\Support;

use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;

class PlatformOwnerAccess
{
    public static function allowedEmails(): array
    {
        $emails = config('commerceforge.manager_allowed_google_emails', []);

        return is_array($emails) && count($emails) === 2 ? $emails : [];
    }

    public static function isAllowedEmail(string $email): bool
    {
        return in_array(strtolower(trim($email)), self::allowedEmails(), true);
    }

    public static function isGoogleAuthenticated(User $user): bool
    {
        $token = $user->currentAccessToken();

        return $token instanceof PersonalAccessToken
            && in_array($token->name, ['commerceforge-google-owner', 'storefront-google-owner'], true);
    }

    public static function canManage(User $user): bool
    {
        return $user->role === 'super_admin'
            && self::isAllowedEmail($user->email)
            && self::isGoogleAuthenticated($user)
            && ((string) $user->google_id !== '' || (string) ($user->firebase_uid ?? '') !== '');
    }
}
