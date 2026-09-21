<?php

namespace Tests\Feature;

use App\Models\ClassAdmin;
use App\Models\ClassEnrollment;
use App\Models\Classes;
use App\Models\CommitteeDetails;
use App\Models\CommitteeInvite;
use App\Models\CourseProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Tests\TestCase;

class RolePermissionsTest extends TestCase
{
    use RefreshDatabase;

    private int $userCounter = 0;

    private function makeUser(): User
    {
        $this->userCounter++;

        return User::create([
            'name' => "Test User {$this->userCounter}",
            'email' => "user{$this->userCounter}@example.com",
            'password' => 'password',
        ]);
    }

    private function committeeMember(string $role): User
    {
        $user = $this->makeUser();
        CommitteeDetails::create(['committee_id' => $user->id, 'role' => $role]);

        return $user;
    }

    private function makeClass(): Classes
    {
        $profile = CourseProfile::create(['title' => 'Test Course', 'course_type' => 'standard']);

        return Classes::create([
            'course_profile_id' => $profile->id,
            'name' => 'Test Class',
            'language' => 'English',
            'mode' => 'online',
            'status' => 'open',
        ]);
    }

    public function test_full_access_roles_can_change_data(): void
    {
        foreach (['chair', 'co_chair', 'system_admin'] as $role) {
            $user = $this->committeeMember($role);
            $class = $this->makeClass();

            $this->actingAs($user)
                ->delete(route('class.destroy', $class->id))
                ->assertRedirect();

            $this->assertSoftDeleted('classes', ['id' => $class->id]);
        }
    }

    public function test_committee_is_view_only(): void
    {
        $committee = $this->committeeMember('committee');
        $class = $this->makeClass();

        $this->actingAs($committee)->get(route('class'))->assertOk();
        $this->actingAs($committee)->getJson(route('class.show', $class->id))->assertOk();

        $this->actingAs($committee)
            ->deleteJson(route('class.destroy', $class->id))
            ->assertForbidden()
            ->assertJson(['message' => "You don't have permission to do that."]);
        $this->assertNotSoftDeleted('classes', ['id' => $class->id]);

        $this->actingAs($committee)
            ->putJson(route('user.update', $committee->id), ['name' => 'X'])
            ->assertForbidden();

        $invite = CommitteeInvite::create([
            'email' => 'invitee@example.com',
            'role' => 'committee',
            'temp_password' => Crypt::encryptString('secret'),
            'status' => 'pending',
            'invited_at' => now(),
        ]);

        $this->actingAs($committee)
            ->getJson(route('committee_invite.reveal_password', $invite->id))
            ->assertForbidden();

        $this->actingAs($this->committeeMember('chair'))
            ->getJson(route('committee_invite.reveal_password', $invite->id))
            ->assertOk()
            ->assertJson(['temp_password' => 'secret']);
    }

    public function test_committee_forbidden_inertia_request_redirects_back_with_flash_error(): void
    {
        $committee = $this->committeeMember('committee');
        $class = $this->makeClass();

        $this->actingAs($committee)
            ->withHeaders(['X-Inertia' => 'true', 'Referer' => route('class')])
            ->delete(route('class.destroy', $class->id))
            ->assertRedirect(route('class'))
            ->assertSessionHas('error', "You don't have permission to do that.");
    }

    public function test_class_admin_can_manage_only_their_own_class(): void
    {
        $committee = $this->committeeMember('committee');
        $ownClass = $this->makeClass();
        $otherClass = $this->makeClass();
        ClassAdmin::create(['class_id' => $ownClass->id, 'committee_id' => $committee->id, 'assigned_at' => now()]);

        $this->actingAs($committee)
            ->postJson(route('graduation_item.store', $ownClass->id), ['item_name' => 'Certificate', 'quantity' => 1])
            ->assertOk();

        $this->actingAs($committee)
            ->postJson(route('graduation_item.store', $otherClass->id), ['item_name' => 'Certificate', 'quantity' => 1])
            ->assertForbidden();

        $student = $this->makeUser();
        $enrollment = ClassEnrollment::create(['class_id' => $ownClass->id, 'student_id' => $student->id, 'status' => 'active', 'enrolled_at' => now()]);
        $otherEnrollment = ClassEnrollment::create(['class_id' => $otherClass->id, 'student_id' => $student->id, 'status' => 'active', 'enrolled_at' => now()]);

        $this->actingAs($committee)
            ->patchJson(route('class_enrollment.update_status', $enrollment->id), ['status' => 'left'])
            ->assertOk();
        $this->actingAs($committee)
            ->patchJson(route('class_enrollment.update_status', $otherEnrollment->id), ['status' => 'left'])
            ->assertForbidden();

        $this->actingAs($committee)
            ->putJson(route('class.update', $ownClass->id), ['name' => 'Renamed'])
            ->assertForbidden();
    }

    public function test_chair_who_is_class_admin_keeps_full_access(): void
    {
        $chair = $this->committeeMember('chair');
        $class = $this->makeClass();
        ClassAdmin::create(['class_id' => $class->id, 'committee_id' => $chair->id, 'assigned_at' => now()]);

        $this->assertTrue($chair->canManageClass($class->id));
        $this->assertTrue($chair->hasFullAccess());
    }

    public function test_update_user_changes_role_and_term_rules(): void
    {
        $admin = $this->committeeMember('chair');
        $member = $this->committeeMember('committee');

        $this->actingAs($admin)
            ->put(route('user.update', $member->id), [
                'name' => 'Renamed Member',
                'role' => 'co_chair',
                'term_start_date' => '2026-01-01',
            ])
            ->assertRedirect(route('user'));

        $details = $member->fresh()->committeeDetails;
        $this->assertSame('co_chair', $details->role);
        $this->assertSame('2028-01-01', $details->term_end_date->toDateString());

        $this->actingAs($admin)
            ->put(route('user.update', $member->id), [
                'name' => 'Renamed Member',
                'role' => 'system_admin',
                'term_start_date' => '2026-01-01',
            ]);

        $this->assertNull($member->fresh()->committeeDetails->term_end_date);
    }

    public function test_user_cannot_change_their_own_role(): void
    {
        $chair = $this->committeeMember('chair');

        $this->actingAs($chair)
            ->put(route('user.update', $chair->id), ['name' => $chair->name, 'role' => 'committee'])
            ->assertSessionHasErrors('role');

        $this->assertSame('chair', $chair->fresh()->committeeDetails->role);
    }
}
