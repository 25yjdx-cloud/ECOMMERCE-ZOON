<?php

namespace App\Http\Requests\CommerceForge;

use Illuminate\Foundation\Http\FormRequest;

class CreateMerchantStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_slug' => ['required', 'string', 'min:3', 'max:48', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'unique:cf_stores,slug'],
            'template_slug' => ['required', 'string', 'exists:cf_templates,slug'],
            'store_name' => ['required', 'string', 'min:2', 'max:120'],
            'logo_url' => ['nullable', 'url', 'max:2048'],
            'primary_color' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'whatsapp' => ['required', 'regex:/^(?:\+20(?:10|11|12|15)[0-9]{8}|\+9665[0-9]{8})$/'],
            'market' => ['required', 'in:EG,SA'],
            'hosting_mode' => ['required', 'in:saas,client_hosting'],
            'domain_mode' => ['required', 'in:subdomain,custom'],
            'custom_domain' => ['required_if:hosting_mode,client_hosting', 'nullable', 'string', 'max:253', 'regex:/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z]{2,63}$/i'],
            'initial_products' => ['sometimes', 'array', 'max:5'],
            'initial_products.*.name_ar' => ['required', 'string', 'min:2', 'max:180'],
            'initial_products.*.name_en' => ['required', 'string', 'min:2', 'max:180'],
            'initial_products.*.price' => ['required', 'numeric', 'min:0', 'max:999999999'],
            'initial_products.*.stock_qty' => ['required', 'integer', 'min:0', 'max:10000000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $phone = (string) $this->input('whatsapp', '');
            $market = $this->input('market');
            if (($market === 'EG' && ! str_starts_with($phone, '+20')) || ($market === 'SA' && ! str_starts_with($phone, '+966'))) {
                $validator->errors()->add('whatsapp', 'مفتاح الدولة لا يتوافق مع السوق المختار.');
            }
        });
    }
}
