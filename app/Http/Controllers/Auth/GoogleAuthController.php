<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\CommitteeInvite;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        $googleUser = Socialite::driver('google')->user();

        $user = User::where('email', $googleUser->getEmail())->first();
        $invite = CommitteeInvite::where('email', $googleUser->getEmail())->first();

        if (! $user || ! $user->committeeDetails || $invite?->status === 'revoked') {
            return redirect()->route('login')->withErrors([
                'email' => 'This email is not authorized. Contact a committee administrator.',
            ]);
        }

        Auth::login($user);

        $user->committeeDetails?->update([
            'google_id' => $googleUser->getId(),
            'last_login_at' => now(),
        ]);

        CommitteeInvite::markAcceptedFor($googleUser->getEmail());

        return redirect()->route('dashboard');
    }
}
