<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ClassRegistration extends Model
{
    protected $table = 'class_registrations';

    protected $fillable = [
        'batch_id',
        'imported_at',
        'form_name',
        'form_email',
        'form_phone',
        'form_answers',
        'status',
        'rejection_reason',
        'student_id',
        'reviewed_at',
    ];

    protected $casts = [
        'imported_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'form_answers' => 'array',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}