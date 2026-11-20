<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CommerceForge\AiAssistRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class AiAssistantController extends Controller
{
    private const RECOMMENDATIONS = [
        'classic' => [
            'ar' => ['name' => 'كلاسيكي', 'color' => 'كريمي دافئ مع لمسات عنبرية'],
            'en' => ['name' => 'Classic', 'color' => 'Warm cream with amber accents'],
        ],
        'nabd' => [
            'ar' => ['name' => 'نَبض', 'color' => 'أسود فحمي مع أخضر ليموني'],
            'en' => ['name' => 'Nabd', 'color' => 'Obsidian with neon lime'],
        ],
        'fashion' => [
            'ar' => ['name' => 'فريدة', 'color' => 'فحمي مع ذهبي شامبانيا'],
            'en' => ['name' => 'Farida', 'color' => 'Charcoal with champagne gold'],
        ],
        'furniture' => [
            'ar' => ['name' => 'دارك', 'color' => 'جوزي دافئ مع رملي هادئ'],
            'en' => ['name' => 'Darak', 'color' => 'Warm walnut with soft sand'],
        ],
        'local-brand' => [
            'ar' => ['name' => 'هوية', 'color' => 'أسود حضري مع برتقالي محروق'],
            'en' => ['name' => 'Hawia', 'color' => 'Urban ink with burnt orange'],
        ],
    ];

    public function assist(AiAssistRequest $request): JsonResponse
    {
        $data = $request->validated();
        $locale = $data['locale'];
        $template = $this->recommendTemplate($data['question']);
        $recommendation = self::RECOMMENDATIONS[$template][$locale];
        if (! $this->hasKnownIntent($data['question'])) {
            $this->recordUnansweredQuestion($data['question'], $locale);
        }
        $pricing = $locale === 'ar'
            ? 'ابدأ بتجربة مجانية 14 يوماً؛ الاشتراكات من 399 إلى 999 ج.م في مصر أو 49 إلى 119 ر.س في السعودية، والتنفيذ الخاص حسب السوق.'
            : 'Start with a 14-day free trial; subscriptions range from EGP 399–999 in Egypt or SAR 49–119 in Saudi Arabia, with turnkey pricing by market.';
        $answer = $locale === 'ar'
            ? "أنسب بداية هي قالب {$recommendation['name']}. {$recommendation['color']}. يمكنك البدء بالباقة المجانية وتجربة المتجر قبل الترقية."
            : "A good starting point is the {$recommendation['name']} template. {$recommendation['color']}. Start free and test your store before upgrading.";
        $normalizedQuestion = mb_strtolower($data['question']);
        if (
            str_contains($normalizedQuestion, 'باقات')
            || str_contains($normalizedQuestion, 'اشتراك')
            || str_contains($normalizedQuestion, 'pricing')
            || str_contains($normalizedQuestion, 'subscription')
        ) {
            $answer = $locale === 'ar'
                ? 'الاشتراك الشهري يتيح لك إدارة متجرك بنفسك مع تجربة 14 يوماً: مصر 399 أو 599 أو 999 ج.م، والسعودية 49 أو 69 أو 119 ر.س. التنفيذ الخاص لمرة واحدة: مصر 2,000 أو 4,500 أو 7,000 ج.م، والسعودية 179 أو 379 أو 599 ر.س.'
                : 'Subscriptions include a 14-day trial: Egypt EGP 399/599/999 and Saudi Arabia SAR 49/69/119 monthly. One-time turnkey setup is EGP 2,000/4,500/7,000 or SAR 179/379/599.';
        } elseif (
            str_contains($normalizedQuestion, 'ألوان')
            || str_contains($normalizedQuestion, 'هوية')
            || str_contains($normalizedQuestion, 'color')
            || str_contains($normalizedQuestion, 'brand')
        ) {
            $answer = $locale === 'ar'
                ? "لوحة مناسبة لقالب {$recommendation['name']}: {$recommendation['color']}. حافظ على لون أساسي واحد مع خلفية هادئة وتباين واضح للأزرار."
                : "A palette that suits {$recommendation['name']}: {$recommendation['color']}. Keep one primary color, a calm background, and clear button contrast.";
        } elseif (
            str_contains($normalizedQuestion, 'واتساب')
            || str_contains($normalizedQuestion, 'whatsapp')
            || str_contains($normalizedQuestion, 'تواصل')
        ) {
            $answer = $locale === 'ar'
                ? 'يمكنك التواصل مباشرة مع فريق التنفيذ على رقم واتساب 01145335168 لمناقشة احتياجات متجرك.'
                : 'Contact the implementation team directly on WhatsApp at 01145335168 to discuss your store needs.';
        }
        $domainTip = $locale === 'ar'
            ? 'ابدأ بنطاق فرعي مجاني، واربط دومينك الخاص عند الاستعداد للنشر.'
            : 'Start with a free subdomain, then connect a custom domain when you are ready to publish.';

        if (config('services.ai.provider') === 'openai' && config('services.ai.api_key')) {
            $response = Http::acceptJson()
                ->withToken(config('services.ai.api_key'))
                ->timeout(20)
                ->post(rtrim((string) config('services.ai.base_url'), '/').'/chat/completions', [
                    'model' => config('services.ai.model'),
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => $locale === 'ar'
                                ? 'أنت مساعد CommerceForge. أجب بإيجاز وبالعربية، والأسعار الثابتة: مصر 0/399/599/999 ج.م شهرياً والسعودية 0/49/69/119 ر.س شهرياً؛ التنفيذ الخاص مصر 2000/4500/7000 ج.م والسعودية 179/379/599 ر.س. التجربة 14 يوماً ونموذج الإطلاق 70/30.'
                                : 'You are the CommerceForge store advisor. Answer concisely in English. Fixed monthly plans: Egypt EGP 0/399/599/999 and Saudi Arabia SAR 0/49/69/119; turnkey Egypt EGP 2,000/4,500/7,000 and Saudi Arabia SAR 179/379/599. Trial is 14 days; launch model is 70/30.',
                        ],
                        ['role' => 'user', 'content' => $data['question']],
                    ],
                    'max_tokens' => 350,
                ]);

            if (! $response->successful()) {
                return response()->json(['message' => 'The AI provider is temporarily unavailable.'], 502);
            }
            $content = $response->json('choices.0.message.content');
            if (is_string($content) && trim($content) !== '') {
                $answer = trim($content);
            }
        } elseif (config('services.ai.provider') === 'gemini' && config('services.ai.gemini_api_key')) {
            $model = rawurlencode((string) config('services.ai.gemini_model'));
            $response = Http::acceptJson()
                ->withHeaders(['x-goog-api-key' => (string) config('services.ai.gemini_api_key')])
                ->timeout(20)
                ->post('https://generativelanguage.googleapis.com/v1beta/models/'.$model.':generateContent', [
                    'systemInstruction' => [
                        'parts' => [[
                            'text' => $locale === 'ar'
                                ? 'أنت مساعد CommerceForge. أجب بالعربية بإيجاز، والتزم بالأسعار المعتمدة لمصر والسعودية والتجربة المجانية 14 يوماً.'
                                : 'You are the CommerceForge advisor. Answer concisely in English and use only approved Egypt and Saudi prices and the 14-day trial.',
                        ]],
                    ],
                    'contents' => [['role' => 'user', 'parts' => [['text' => $data['question']]]]],
                    'generationConfig' => ['maxOutputTokens' => 350],
                ]);

            if (! $response->successful()) {
                return response()->json(['message' => 'The AI provider is temporarily unavailable.'], 502);
            }

            $content = $response->json('candidates.0.content.parts.0.text');
            if (is_string($content) && trim($content) !== '') {
                $answer = trim($content);
            }
        }

        return response()->json([
            'data' => [
                'answer' => $answer,
                'template' => $template,
                'template_name' => $recommendation['name'],
                'color' => $recommendation['color'],
                'domain_tip' => $domainTip,
                'pricing' => $pricing,
                'preview_url' => '/preview/'.$template,
                'final_preview_url' => '/final-preview/'.$template,
            ],
        ]);
    }

    private function recommendTemplate(string $question): string
    {
        $normalized = mb_strtolower($question);

        return match (true) {
            str_contains($normalized, 'business_type:sports'),
            str_contains($normalized, 'رياض'),
            str_contains($normalized, 'جيم'),
            str_contains($normalized, 'gym'),
            str_contains($normalized, 'sport') => 'nabd',
            str_contains($normalized, 'business_type:fashion'),
            str_contains($normalized, 'ملابس'),
            str_contains($normalized, 'أزياء'),
            str_contains($normalized, 'fashion'),
            str_contains($normalized, 'clothing') => 'fashion',
            str_contains($normalized, 'business_type:furniture'),
            str_contains($normalized, 'أثاث'),
            str_contains($normalized, 'ديكور'),
            str_contains($normalized, 'furniture'),
            str_contains($normalized, 'decor') => 'furniture',
            str_contains($normalized, 'business_type:local-brand'),
            str_contains($normalized, 'لوكال'),
            str_contains($normalized, 'محلي'),
            str_contains($normalized, 'local brand') => 'local-brand',
            default => 'classic',
        };
    }

    private function hasKnownIntent(string $question): bool
    {
        $normalized = mb_strtolower($question);
        $knownTerms = [
            'business_type:', 'ملابس', 'أزياء', 'fashion', 'clothing', 'رياض', 'جيم', 'sports', 'gym',
            'أثاث', 'ديكور', 'furniture', 'decor', 'لوكال', 'محلي', 'local brand', 'هدايا', 'gifts',
            'عطور', 'perfume', 'إلكترونيات', 'electronics', 'قهوة', 'كافيه', 'coffee', 'digital',
            'باقات', 'اشتراك', 'pricing', 'subscription', 'سعر', 'price', 'تجربة', 'trial', 'مجاني',
            '70%', '30%', 'إطلاق', 'launch', 'ألوان', 'هوية', 'color', 'brand', 'واتساب', 'whatsapp',
            'الدفع', 'cod', 'instapay', 'فودافون', 'mada', 'stc pay', 'apple pay', 'شحن', 'shipping',
            'باركود', 'barcode', 'بيكسل', 'pixel', 'دومين', 'domain', 'سلة', 'cart', 'مخزون', 'inventory',
            'ملكية', 'ownership', 'كوبون', 'coupon', 'تحليلات', 'analytics', 'تسجيل', 'register',
            'قالب', 'template', 'صور', 'products', 'أمان', 'security', 'استضافة', 'hosting', 'دعم', 'support',
        ];

        foreach ($knownTerms as $term) {
            if (str_contains($normalized, mb_strtolower($term))) {
                return true;
            }
        }

        return false;
    }

    private function recordUnansweredQuestion(string $question, string $locale): void
    {
        $sanitizedQuestion = preg_replace(
            ['/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/u', '/\+?\d[\d\s().-]{7,}\d/u'],
            ['[email]', '[phone]'],
            $question,
        );
        if (! is_string($sanitizedQuestion) || trim($sanitizedQuestion) === '') {
            return;
        }

        $normalizedQuestion = mb_strtolower(trim($sanitizedQuestion));
        $hash = hash('sha256', $locale.'|'.$normalizedQuestion);
        DB::transaction(function () use ($hash, $sanitizedQuestion, $locale) {
            $existing = DB::table('ai_unanswered_queries')
                ->where('question_hash', $hash)
                ->lockForUpdate()
                ->first();

            if ($existing) {
                DB::table('ai_unanswered_queries')->where('id', $existing->id)->update([
                    'occurrences' => $existing->occurrences + 1,
                    'last_asked_at' => now(),
                    'updated_at' => now(),
                ]);

                return;
            }

            DB::table('ai_unanswered_queries')->insert([
                'question_hash' => $hash,
                'question' => trim($sanitizedQuestion),
                'locale' => $locale,
                'occurrences' => 1,
                'last_asked_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });
    }
}
