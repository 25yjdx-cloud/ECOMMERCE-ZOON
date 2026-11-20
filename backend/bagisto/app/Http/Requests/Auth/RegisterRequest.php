<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'min:4', 'max:120', 'regex:/^[\p{Arabic}a-zA-Z\s.\'-]+$/u', 'not_regex:/([\p{Arabic}a-zA-Z])\1{2,}/u'],
            'email'    => ['required', 'email:rfc', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'whatsapp_phone' => ['required', 'regex:/^(?:\+20(?:10|11|12|15)[0-9]{8}|\+9665[0-9]{8})$/'],
            'market' => ['required', 'in:EG,SA'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $phone = (string) $this->input('whatsapp_phone', '');
            $market = $this->input('market');
            if (($market === 'EG' && ! str_starts_with($phone, '+20')) || ($market === 'SA' && ! str_starts_with($phone, '+966'))) {
                $validator->errors()->add('whatsapp_phone', 'مفتاح الدولة لا يتوافق مع السوق المختار.');
            }
        });
    }
}
