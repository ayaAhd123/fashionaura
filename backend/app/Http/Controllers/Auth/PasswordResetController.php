<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;  // ← AJOUTE CETTE LIGNE
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    // Envoyer l'email de réinitialisation
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = User::where('email', $request->email)->first();
        
        // Générer un token
        $token = Str::random(60);
        
        // Stocker le token - utilise DB au lieu de \DB
        DB::table('password_resets')->updateOrInsert(
            ['email' => $user->email],
            ['token' => $token, 'created_at' => now()]
        );
        
        return response()->json([
            'message' => 'Un lien de réinitialisation a été envoyé',
            'token' => $token // À enlever en production
        ]);
    }
    
    // Réinitialiser le mot de passe
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required',
            'password' => 'required|min:6|confirmed'
        ]);
        
        $reset = DB::table('password_resets')  // ← Utilise DB ici aussi
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();
            
        if (!$reset) {
            return response()->json(['message' => 'Token invalide'], 400);
        }
        
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();
        
        DB::table('password_resets')->where('email', $request->email)->delete();  // ← Utilise DB ici aussi
        
        return response()->json(['message' => 'Mot de passe réinitialisé avec succès']);
    }
}