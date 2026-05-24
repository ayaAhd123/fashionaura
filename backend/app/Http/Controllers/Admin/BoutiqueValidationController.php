<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BoutiqueValidationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BoutiqueValidationController extends Controller
{
    public function pending()
    {
        $pendingRequests = BoutiqueValidationRequest::with(['boutique', 'user'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($pendingRequests);
    }

    public function approve($id, Request $request)
    {
        $validationRequest = BoutiqueValidationRequest::with('boutique')->findOrFail($id);
        
        // Récupérer l'ID de l'admin connecté
        $adminId = Auth::id();
        $comment = $request->input('comment');
        
        $validationRequest->approve($adminId, $comment);
        
        return response()->json([
            'message' => 'Boutique validée avec succès',
            'boutique' => $validationRequest->boutique
        ]);
    }

    public function reject($id, Request $request)
    {
        $validationRequest = BoutiqueValidationRequest::with('boutique')->findOrFail($id);
        
        // Récupérer l'ID de l'admin connecté
        $adminId = Auth::id();
        $comment = $request->input('comment');
        
        $validationRequest->reject($adminId, $comment);
        
        return response()->json([
            'message' => 'Boutique rejetée',
            'boutique' => $validationRequest->boutique
        ]);
    }

    public function index()
    {
        $requests = BoutiqueValidationRequest::with(['boutique', 'user', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($requests);
    }
}