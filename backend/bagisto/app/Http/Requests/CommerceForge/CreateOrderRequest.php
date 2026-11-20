<?php

namespace App\Http\Requests\CommerceForge;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'storeSlug' => ['required', 'string', 'exists:cf_stores,slug'],
            'customer.name' => ['required', 'string', 'min:4', 'max:120', 'regex:/^[\p{Arabic}a-zA-Z\s]+$/u', 'not_regex:/(.)\1{2,}/u'],
            'customer.phone' => ['required', 'regex:/^01[0125][0-9]{8}$/'],
            'customer.governorate' => ['required', 'exists:cf_shipping_rates,governorate'],
            'customer.address' => ['required', 'string', 'min:10', 'max:1000', 'not_regex:/(.)\1{3,}/u'],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.productId' => ['required', 'string', 'max:64'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100'],
        ];
    }
}
