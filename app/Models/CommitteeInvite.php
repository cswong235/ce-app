<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommitteeInvite extends Model
{
    protected $table = 'committee_invites';

    protected $fillable = ['email', 'role', 'temp_password', 'status', 'invited_at', 'accepted_at'];

    protected $casts = [
        'invited_at' => 'datetime',
        'accepted_at' => 'datetime',
    ];

    public static function markAcceptedFor(string $email): void
    {
        static::where('email', $email)->where('status', 'pending')->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);
    }
}