<?php

namespace App\Http\Controllers;

use App\Models\CommitteeDetails;
use App\Models\CommitteeInvite;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CommitteeInviteController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'name' => ['required_without:user_id', 'nullable', 'string', 'max:255'],
            'email' => ['required_without:user_id', 'nullable', 'email', 'max:255', 'unique:users,email'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'role' => ['required', 'in:chair,co_chair,committee,system_admin'],
            'term_start_date' => ['required', 'date'],
        ]);

        $termEndDate = \Carbon\Carbon::parse($validated['term_start_date'])->addYears(2);

        DB::transaction(function () use ($validated, $termEndDate) {
            if (! empty($validated['user_id'])) {
                $user = User::findOrFail($validated['user_id']);

                $user->committeeDetails()->updateOrCreate([], [
                    'role' => $validated['role'],
                    'term_start_date' => $validated['term_start_date'],
                    'term_end_date' => $termEndDate,
                ]);

                return;
            }

            $tempPassword = Str::random(12);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone_number' => \App\Support\PhoneNumberSanitizer::sanitize($validated['phone_number'] ?? null),
                'password' => Hash::make($tempPassword),
            ]);

            CommitteeDetails::create([
                'committee_id' => $user->id,
                'role' => $validated['role'],
                'term_start_date' => $validated['term_start_date'],
                'term_end_date' => $termEndDate,
            ]);

            CommitteeInvite::create([
                'email' => $validated['email'],
                'role' => $validated['role'],
                'temp_password' => Crypt::encryptString($tempPassword),
                'status' => 'pending',
                'invited_at' => now(),
            ]);
        });

        return redirect()->route('user');
    }

    public function update(Request $request, CommitteeInvite $invite): RedirectResponse
    {
        $validated = $request->validate([
            'term_start_date' => ['required', 'date'],
        ]);

        $termEndDate = \Carbon\Carbon::parse($validated['term_start_date'])->addYears(2);

        $user = User::where('email', $invite->email)->first();

        if ($user?->committeeDetails) {
            $user->committeeDetails->update([
                'term_start_date' => $validated['term_start_date'],
                'term_end_date' => $termEndDate,
            ]);
        }

        return redirect()->route('user');
    }

    public function revealPassword(CommitteeInvite $invite): JsonResponse
    {
        if (! $invite->temp_password) {
            return response()->json(['temp_password' => null]);
        }

        return response()->json(['temp_password' => Crypt::decryptString($invite->temp_password)]);
    }
}