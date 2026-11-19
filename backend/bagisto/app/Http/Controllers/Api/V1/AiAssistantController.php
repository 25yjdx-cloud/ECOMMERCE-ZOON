<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

    public function assist(Request $request): JsonResponse
    {
        $data = $request->validate([
            'question' => ['required', 'string', 'min:2', 'max:1000'],
            'locale' => ['required', 'in:ar,en'],
        ]);
        $locale = $data['locale'];
        $template = $this->recommendTemplate($data['question']);
        $recommendation = self::RECOMMENDATIONS[$template][$locale];
        $pricing = $locale === 'ar'
            ? 'ابدأ مجاناً؛ باقات SaaS من 399 إلى 999 ج.م شهرياً، أو تنفيذ خاص من 2,000 إلى 7,000 ج.م.'
            : 'Start free; SaaS plans range from EGP 399 to 999 monthly, or choose turnkey implementation from EGP 2,000 to 7,000.';
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
                ? 'الاشتراك الشهري يتيح لك إدارة متجرك بنفسك على المنصة، ويبدأ مجاناً ثم 399 أو 599 أو 999 ج.م شهرياً. التنفيذ الخاص خدمة تجهيز مخصصة لمرة واحدة بأسعار 2,000 أو 4,500 أو 7,000 ج.م، ولا تشمل الاستضافة أو الدومين.'
                : 'A monthly subscription lets you run your store on the platform: free, then EGP 399, 599 or 999 per month. Turnkey implementation is a one-time tailored setup for EGP 2,000, 4,500 or 7,000, excluding hosting and domain.';
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
                                ? 'أنت مساعد CommerceForge للمتاجر في مصر. أجب بإيجاز وبالعربية، ولا تخترع أسعاراً خارج: اشتراك 0 أو 399 أو 599 أو 999 ج.م شهرياً؛ والتنفيذ الخاص 2000 أو 4500 أو 7000 ج.م.'
                                : 'You are the CommerceForge store advisor for Egypt. Answer concisely in English. Do not invent prices beyond monthly plans EGP 0, 399, 599, 999 and turnkey packages EGP 2,000, 4,500, 7,000.',
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
}
