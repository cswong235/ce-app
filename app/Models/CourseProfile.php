<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CourseProfile extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'title',
        'description',
        'target_audience',
        'early_bird_fees',
        'standard_fees',
        'course_type',
        'suggested_class_capacity',
    ];

    public function prerequisites(): BelongsToMany
    {
        return $this->belongsToMany(
            self::class,
            'course_profile_prereq',
            'course_profile_id',
            'prereq_course_profile_id',
        );
    }
}
