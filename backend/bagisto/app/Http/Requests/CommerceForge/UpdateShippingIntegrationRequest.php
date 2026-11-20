<?php

namespace App\Http\Requests\CommerceForge;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateShippingIntegrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $provider = $this->input('provider');
        $enabled = $this->boolean('enabled');
        $requiredWhenEnabled = fn (string $providerName) => $provider === $providerName && $enabled;

        return [
            'provider' => ['required', Rule::in(['bosta', 'oto', 'manual'])],
            'enabled' => ['required', 'boolean'],
            'api_key' => ['nullable', 'string', 'min:8', 'max:4096'],
            'business_location_id' => [$requiredWhenEnabled('bosta') ? 'required' : 'nullable', 'string', 'max:100'],
            'package_type' => [$requiredWhenEnabled('bosta') ? 'required' : 'nullable', Rule::in(['SMALL', 'MEDIUM', 'LARGE', 'Light Bulky', 'Heavy Bulky'])],
            'delivery_option_id' => [$requiredWhenEnabled('oto') ? 'required' : 'nullable', 'string', 'max:100'],
            'pickup_location_code' => [$requiredWhenEnabled('oto') ? 'required' : 'nullable', 'string', 'max:100'],
            'sender_name' => [$requiredWhenEnabled('oto') ? 'required' : 'nullable', 'string', 'max:120'],
        ];
    }
}
