<?php

namespace App\Http\Requests\CommerceForge;

use Illuminate\Foundation\Http\FormRequest;

class CloneStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_slug' => ['required', 'string', 'min:3', 'max:48', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'unique:cf_stores,slug'],
        ];
    }
}
