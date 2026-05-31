<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Boutique;
use App\Models\BoutiqueValidationRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect'
            ], 401);
        }

        $plainTextToken = Str::random(40);
        $token = $user->tokens()->create([
            'name' => 'auth_token',
            'token' => hash('sha256', $plainTextToken),
            'abilities' => ['*'],
        ]);

        return response()->json([
            'user' => $this->formatUser($user),
            'token' => $token->id . '|' . $plainTextToken,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function register(Request $request)
    {
        $role = $request->input('role', 'customer');

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6|confirmed',
            'phone' => 'nullable|string',
            'role' => 'nullable|in:customer,boutique_owner',
        ];

        if ($role === 'boutique_owner') {
            $rules['boutique_name'] = 'required|string|max:255';
            $rules['city_id'] = 'required|exists:cities,id';
            // Le paiement est obligatoire pour ouvrir un magasin.
            $rules['plan'] = 'required|in:mensuel,annuel';
            $rules['payment_reference'] = 'required|string|max:255';
        }

        $request->validate($rules);

        if ($role === 'boutique_owner') {
            return DB::transaction(function () use ($request) {
                $slug = Str::slug($request->boutique_name);
                $baseSlug = $slug;
                $counter = 1;
                while (Boutique::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter++;
                }

                $boutique = Boutique::create([
                    'city_id' => $request->city_id,
                    'name' => $request->boutique_name,
                    'slug' => $slug,
                    'description' => '',
                    'category' => 'general',
                    'is_verified' => false,
                    'is_active' => true,
                    'plan' => $request->plan,
                    'subscription_status' => 'active',
                    'subscription_paid_at' => now(),
                    'payment_reference' => $request->payment_reference,
                ]);

                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'phone' => $request->phone,
                    'role' => 'boutique_owner',
                    'boutique_id' => $boutique->id,
                    'is_active' => true,
                ]);

                BoutiqueValidationRequest::create([
                    'boutique_id' => $boutique->id,
                    'user_id' => $user->id,
                    'message' => 'Demande d\'inscription via FashionAura.',
                    'status' => 'pending',
                ]);

                $token = $user->createToken('auth_token')->plainTextToken;

                return response()->json([
                    'user' => $this->formatUser($user),
                    'token' => $token,
                ], 201);
            });
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'customer',
            'is_active' => true,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $this->formatUser($user),
            'token' => $token,
        ], 201);
    }

    // PUT /api/account/profile — met à jour les infos personnelles
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:30',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil mis à jour.',
            'user' => $this->formatUser($user->fresh()),
        ]);
    }

    // PUT /api/account/password — change le mot de passe
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required',
            'password' => 'required|min:6|confirmed',
        ]);

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Le mot de passe actuel est incorrect.',
                'errors' => ['current_password' => ['Mot de passe actuel incorrect.']],
            ], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Mot de passe mis à jour.']);
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'avatar' => $user->avatar,
            'boutique_id' => $user->boutique_id,
        ];
    }
}
