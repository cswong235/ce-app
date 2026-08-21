<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassEnrollment extends Model
{
    protected $table = 'class_enrollments';

    protected $fillable = [
        'class_id',
        'student_id',
        'status',
        'testimonial',
        'payment_status',
        'payment_receipt_path',
        'enrolled_at',
        'left_at',
        'completed_at',
    ];
    
    protected $casts = [
        'enrolled_at' => 'datetime',
        'left_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function classes(): BelongsTo
    {
        return $this->belongsTo(Classes::class, 'class_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}