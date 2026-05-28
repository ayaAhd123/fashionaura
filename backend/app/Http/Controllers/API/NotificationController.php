<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = Notification::where('user_id', Auth::id());

        if ($request->boolean('unread_only')) {
            $query->where('is_read', false);
        }

        $notifications = $query->latest()->get()->map(function ($n) {
            return [
                'id' => $n->id,
                'title' => $n->title ?? 'Notification',
                'message' => $n->message,
                'read' => (bool)$n->is_read,
                'time' => $n->created_at ? $n->created_at->diffForHumans() : '',
                'type' => $n->type,
            ];
        });

        return response()->json($notifications);
    }

    public function markAsRead($id)
    {
        $notification = Notification::where('user_id', Auth::id())->findOrFail($id);
        $notification->update([
            'is_read' => true,
            'read_at' => now()
        ]);

        return response()->json([
            'message' => 'Notification marquée comme lue'
        ]);
    }

    public function destroy($id)
    {
        $notification = Notification::where('user_id', Auth::id())->findOrFail($id);
        $notification->delete();

        return response()->json([
            'message' => 'Notification supprimée avec succès'
        ]);
    }
}
