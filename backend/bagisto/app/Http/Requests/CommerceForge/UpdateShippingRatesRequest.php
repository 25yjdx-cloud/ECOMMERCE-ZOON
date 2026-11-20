<?php

namespace App\Http\Requests\CommerceForge;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShippingRatesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'requires_approval' => ['required', 'boolean'],
            'rates' => ['required', 'array', 'size:27'],
            'rates.*.governorate' => ['required', 'string', 'distinct', 'exists:cf_shipping_rates,governorate'],
            'rates.*.fee' => ['required', 'numeric', 'min:0', 'max:999999'],
        ];
    }
}
