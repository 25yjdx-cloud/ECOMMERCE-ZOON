<?php

namespace App\Http\Requests\CommerceForge;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateShipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'provider' => ['required', Rule::in(['bosta', 'oto', 'manual'])],
            'tracking_number' => ['required_if:provider,manual', 'nullable', 'string', 'max:120'],
            'label_url' => ['nullable', 'url', 'max:2048'],
        ];
    }
}
