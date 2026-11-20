<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'exchange_api' => [
        'default' => 'exchange_rates',

        'fixer' => [
            'key' => env('FIXER_API_KEY'),
            'class' => 'Webkul\Core\Helpers\Exchange\FixerExchange',
        ],

        'exchange_rates' => [
            'key' => env('EXCHANGE_RATES_API_KEY'),
            'class' => 'Webkul\Core\Helpers\Exchange\ExchangeRates',
        ],
    ],

    'facebook' => [
        'client_id' => env('FACEBOOK_CLIENT_ID'),
        'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
        'redirect' => env('FACEBOOK_CALLBACK_URL'),
    ],

    'twitter' => [
        'client_id' => env('TWITTER_CLIENT_ID'),
        'client_secret' => env('TWITTER_CLIENT_SECRET'),
        'redirect' => env('TWITTER_CALLBACK_URL'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],
    'firebase' => [
        'project_id' => env('FIREBASE_PROJECT_ID', 'commerce-forge-c3d86'),
    ],

    'linkedin-openid' => [
        'client_id' => env('LINKEDIN_CLIENT_ID'),
        'client_secret' => env('LINKEDIN_CLIENT_SECRET'),
        'redirect' => env('LINKEDIN_CALLBACK_URL'),
    ],

    'github' => [
        'client_id' => env('GITHUB_CLIENT_ID'),
        'client_secret' => env('GITHUB_CLIENT_SECRET'),
        'redirect' => env('GITHUB_CALLBACK_URL'),
    ],
    'ai' => [
        'provider' => env('AI_PROVIDER') === 'off'
            ? 'local'
            : (in_array(env('AI_PROVIDER'), ['openai', 'gemini'], true)
                ? env('AI_PROVIDER')
                : (env('GEMINI_API_KEY') ? 'gemini' : (env('OPENAI_API_KEY') || env('AI_API_KEY') ? 'openai' : 'local'))),
        'api_key' => env('OPENAI_API_KEY', env('AI_API_KEY')),
        'base_url' => env('AI_BASE_URL', 'https://api.openai.com/v1'),
        'model' => env('OPENAI_MODEL', env('AI_MODEL', 'gpt-4o-mini')),
        'gemini_api_key' => env('GEMINI_API_KEY'),
        'gemini_model' => env('GEMINI_MODEL', 'gemini-2.0-flash'),
    ],
    'commerceforge' => [
        'payment_webhook_secret' => env('PAYMENT_WEBHOOK_SECRET'),
        'storefront_url' => env('STOREFRONT_URL', env('APP_URL')),
    ],
    'whatsapp' => [
        'token' => env('WHATSAPP_ACCESS_TOKEN'),
        'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
        'graph_version' => env('WHATSAPP_GRAPH_API_VERSION'),
        'order_template' => env('WHATSAPP_ORDER_TEMPLATE'),
        'store_template' => env('WHATSAPP_STORE_TEMPLATE'),
        'language' => env('WHATSAPP_TEMPLATE_LANGUAGE', 'ar'),
    ],
];
