<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;

class Reminder extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'created_by',
        'event_name',
        'event_description',
        'event_at',
        'remind_at',
        'roles',
        'notify_self',
        'notification_methods',
        'status',
        'notified_at',
    ];

    protected $casts = [
        'event_at' => 'datetime',
        'remind_at' => 'datetime',
        'roles' => 'array',
        'notify_self' => 'boolean',
        'notification_methods' => 'array',
        'notified_at' => 'datetime',
    ];

    public const ROLES = ['chair', 'co_chair', 'committee', 'student', 'system_admin'];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function recipients(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'reminder_recipients');
    }

    // 'student' is resolved by existence in student_details (that table has no role column —
    // being in it is the "student" role). The other four roles are resolved against
    // committee_details.role, the only place role values are actually stored.
    public function resolveRecipients(): Collection
    {
        $users = collect();

        if ($this->notify_self && $this->creator) {
            $users->push($this->creator);
        }

        $users = $users->merge($this->recipients()->get());

        $roles = $this->roles ?? [];

        if (! empty($roles)) {
            $committeeRoles = array_values(array_intersect($roles, ['chair', 'co_chair', 'committee', 'system_admin']));

            $roleUsers = User::query()
                ->where(function ($query) use ($roles, $committeeRoles) {
                    if (in_array('student', $roles, true)) {
                        $query->orWhereHas('studentDetails');
                    }

                    if (! empty($committeeRoles)) {
                        $query->orWhereHas('committeeDetails', fn ($q) => $q->whereIn('role', $committeeRoles));
                    }
                })
                ->get();

            $users = $users->merge($roleUsers);
        }

        return $users->unique('id')->values();
    }
}
