<?php

namespace App\Http\Requests\CommerceForge;

use Illuminate\Foundation\Http\FormRequest;

class CreateQuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:4', 'max:120', 'regex:/^[\p{Arabic}a-zA-Z\s]+$/u', 'not_regex:/(.)\1{2,}/u'],
            'phone' => ['required', 'regex:/^(?:\+20(?:10|11|12|15)[0-9]{8}|\+9665[0-9]{8})$/'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'package_id' => ['nullable', 'in:launch,growth,complete'],
            'message' => ['nullable', 'string', 'max:2000', 'not_regex:/(.)\1{5,}/u'],
            'market' => ['required', 'in:EG,SA'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $phone = (string) $this->input('phone', '');
            $market = $this->input('market');
            if (($market === 'EG' && ! str_starts_with($phone, '+20')) || ($market === 'SA' && ! str_starts_with($phone, '+966'))) {
                $validator->errors()->add('phone', 'مفتاح الدولة لا يتوافق مع السوق المختار.');
            }
        });
    }
}
