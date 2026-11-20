<?php

namespace App\Http\Requests\CommerceForge;

use Illuminate\Foundation\Http\FormRequest;

class TrackOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_number' => ['required', 'string', 'min:6', 'max:32'],
            'phone' => ['required', 'regex:/^01[0125][0-9]{8}$/'],
        ];
    }
}
