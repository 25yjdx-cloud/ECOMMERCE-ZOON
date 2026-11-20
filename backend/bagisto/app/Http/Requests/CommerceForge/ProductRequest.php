<?php

namespace App\Http\Requests\CommerceForge;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'external_id' => ['nullable', 'string', 'max:64'],
            'category_id' => ['nullable', 'integer', 'exists:cf_categories,id'],
            'name_ar' => ['required', 'string', 'min:2', 'max:180'],
            'name_en' => ['required', 'string', 'min:2', 'max:180'],
            'description_ar' => ['nullable', 'string', 'max:2000'],
            'description_en' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999999'],
            'old_price' => ['nullable', 'numeric', 'gt:price', 'max:999999999'],
            'stock_qty' => ['required', 'integer', 'min:0', 'max:10000000'],
            'variants' => ['nullable', 'array', 'max:100'],
            'variants.*' => ['string', 'max:100'],
        ];
    }
}
