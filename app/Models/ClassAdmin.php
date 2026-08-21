<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassAdmin extends Model
{
    protected $table = 'class_admins';

    protected $fillable = ['class_id', 'committee_id', 'assigned_at'];

    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    public function classes(): BelongsTo
    {
        return $this->belongsTo(Classes::class, 'class_id');
    }

    public function committee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'committee_id');
    }
}