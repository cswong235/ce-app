<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FacilitatorStatus extends Model
{
    protected $table = 'facilitator_statuses';

    protected $fillable = ['course_profile_id', 'student_id', 'status', 'appointed_at'];

    protected $casts = [
        'appointed_at' => 'datetime',
    ];

    public function courseProfile(): BelongsTo
    {
        return $this->belongsTo(CourseProfile::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}