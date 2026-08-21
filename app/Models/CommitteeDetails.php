<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommitteeDetails extends Model
{
    protected $table = 'committee_details';
    protected $primaryKey = 'committee_id';
    public $incrementing = false;

    protected $fillable = ['committee_id', 'role', 'term_start_date', 'term_end_date', 'google_id', 'last_login_at'];

    protected $casts = [
        'term_start_date' => 'date',
        'term_end_date' => 'date',
        'last_login_at' => 'datetime',
    ];

    public function committee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'committee_id');
    }

    public function adminClasses(): HasMany
    {
        return $this->hasMany(ClassAdmin::class, 'committee_id', 'committee_id');
    }
}