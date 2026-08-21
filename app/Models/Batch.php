<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Batch extends Model
{
    use SoftDeletes;
    protected $table = 'batches';

    protected $fillable = [
        'course_profile_id',
        'name',
        'google_form_link',
    ];

    public function courseProfile(): BelongsTo
    {
        return $this->belongsTo(CourseProfile::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(ClassRegistration::class);
    }
}