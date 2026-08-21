<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Classes extends Model
{
    use SoftDeletes;
    protected $table = 'classes';

    protected $fillable = [
        'course_profile_id',
        'facilitator_id',
        'name',
        'description',
        'status',
        'language',
        'mode',
        'venue',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'graduation_date',
    ];

    public function courseProfile(): BelongsTo
    {
        return $this->belongsTo(CourseProfile::class);
    }

    public function facilitator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'facilitator_id');
    }

    public function classAdmin(): HasOne
    {
        return $this->hasOne(ClassAdmin::class, 'class_id');
    }

    public function graduationItems(): HasMany
    {
        return $this->hasMany(GraduationItem::class, 'class_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(ClassEnrollment::class, 'class_id');
    }
}
