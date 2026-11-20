<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecurityLog extends Model
{
    protected $fillable = [
        'user_id',
        'event',
        'severity',
        'identifier_hash',
        'ip_address',
        'user_agent',
        'context',
    ];

    protected $hidden = [
        'identifier_hash',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'context' => 'array',
        ];
    }
}
