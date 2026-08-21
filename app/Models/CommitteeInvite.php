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
}