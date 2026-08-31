<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Classes extends Model
{
    use SoftDeletes;
    protected $table = 'classes';

    protected $fillable = [
        'course_profile_id',
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
        'attendance_record_path',
    ];

    public function courseProfile(): BelongsTo
    {
        return $this->belongsTo(CourseProfile::class);
    }

    public function facilitators(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'class_facilitators', 'class_id', 'facilitator_id')
            ->withPivot('assigned_at')
            ->withTimestamps();
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
