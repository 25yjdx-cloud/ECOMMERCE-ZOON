<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'member_role',
        'store_slug',
        'google_id',
        'two_factor_secret',
        'whatsapp_phone',
        'market',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
        'two_factor_secret',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'two_factor_enabled' => 'boolean',
            'two_factor_secret' => 'encrypted',
        ];
    }
}
