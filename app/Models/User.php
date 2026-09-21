<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone_number',
        'profile_picture',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function studentDetails(): HasOne
    {
        return $this->hasOne(StudentDetails::class, 'student_id');
    }

    public function committeeDetails(): HasOne
    {
        return $this->hasOne(CommitteeDetails::class, 'committee_id');
    }

    public function classEnrollments(): HasMany
    {
        return $this->hasMany(ClassEnrollment::class, 'student_id');
    }

    public function facilitatorStatuses(): HasMany
    {
        return $this->hasMany(FacilitatorStatus::class, 'student_id');
    }

    public function adminClasses(): HasMany
    {
        return $this->hasMany(ClassAdmin::class, 'committee_id');
    }

    public const FULL_ACCESS_ROLES = ['chair', 'co_chair', 'system_admin'];

    public function committeeRole(): ?string
    {
        return $this->committeeDetails?->role;
    }

    public function hasFullAccess(): bool
    {
        return in_array($this->committeeRole(), self::FULL_ACCESS_ROLES, true);
    }

    public function canManageClass(int $classId): bool
    {
        return $this->hasFullAccess()
            || $this->adminClasses()->where('class_id', $classId)->exists();
    }
}
