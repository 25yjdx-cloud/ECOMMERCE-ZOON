<?php

namespace App\Http\Requests\CommerceForge;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStoreConfigRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_name' => ['sometimes', 'required', 'string', 'min:2', 'max:120'],
            'logo_url' => ['nullable', 'url', 'max:2048'],
            'whatsapp' => ['nullable', 'regex:/^01[0125][0-9]{8}$/'],
            'primary_color' => ['sometimes', 'required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'background_color' => ['sometimes', 'required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'mode' => ['sometimes', 'required', 'in:light,dark'],
            'hero_title' => ['sometimes', 'required', 'string', 'max:180'],
            'hero_subtitle' => ['nullable', 'string', 'max:500'],
            'hero_cta' => ['sometimes', 'required', 'string', 'max:60'],
            'sections' => ['sometimes', 'required', 'array'],
            'sections.*' => ['boolean'],
        ];
    }
}
