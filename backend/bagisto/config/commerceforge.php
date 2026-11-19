<?php

return [
    'owner_email' => strtolower(trim((string) env('OWNER_EMAIL', ''))),
    'storefront_url' => env('STOREFRONT_URL', 'http://localhost:3006'),
];
