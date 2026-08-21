<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GraduationItem extends Model
{
    protected $table = 'graduation_items';

    protected $fillable = ['class_id', 'item_name', 'quantity'];

    public function classes(): BelongsTo
    {
        return $this->belongsTo(Classes::class, 'class_id');
    }
}