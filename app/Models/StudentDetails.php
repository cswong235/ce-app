<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentDetails extends Model
{
    protected $table = 'student_details';
    protected $primaryKey = 'student_id';
    public $incrementing = false;

    protected $fillable = ['student_id', 'status'];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}