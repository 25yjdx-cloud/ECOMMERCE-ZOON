<?php

return [
    'owner_email' => strtolower(trim((string) env('OWNER_EMAIL', ''))),
    'manager_allowed_google_emails' => array_values(array_unique(array_filter(array_map(
        static fn (string $email): string => strtolower(trim($email)),
        preg_split('/\s*,\s*/', (string) env('MANAGER_ALLOWED_GOOGLE_EMAILS', ''), -1, PREG_SPLIT_NO_EMPTY) ?: [],
    ), static fn (string $email): bool => filter_var($email, FILTER_VALIDATE_EMAIL) !== false))),
    'storefront_url' => env('STOREFRONT_URL', 'http://localhost:3006'),
];
