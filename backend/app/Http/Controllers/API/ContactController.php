<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    // POST /api/contact — enregistre le message et tente de l'envoyer par email
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $contact = ContactMessage::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'subject' => $validated['subject'] ?? 'Message depuis FashionAura',
            'message' => $validated['message'],
        ]);

        // Destinataire : configurable via .env, sinon adresse par défaut
        $to = env('CONTACT_MAIL_TO', 'aya.aouladahmidou@icloud.com');

        $body = "Nouveau message depuis FashionAura\n\n"
            . "Nom    : {$contact->name}\n"
            . "Email  : {$contact->email}\n"
            . "Sujet  : {$contact->subject}\n"
            . "-----------------------------------------\n\n"
            . $contact->message;

        try {
            Mail::raw($body, function ($mail) use ($to, $contact) {
                $mail->to($to)
                    ->subject('[FashionAura] ' . $contact->subject)
                    ->replyTo($contact->email, $contact->name);
            });
            $contact->update(['mail_sent' => true]);
        } catch (\Throwable $e) {
            // On garde le message en base même si l'envoi échoue (SMTP non configuré, etc.)
            Log::warning('Contact mail not sent: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Votre message a bien été envoyé. Nous vous répondrons rapidement.',
        ], 201);
    }
}
