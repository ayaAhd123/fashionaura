<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BoutiquePost;
use App\Models\BoutiquePostComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostCommentController extends Controller
{
    public function index(int $boutiqueId, int $postId)
    {
        $post = $this->resolvePost($boutiqueId, $postId);

        $comments = $post->comments()
            ->with('user:id,name,avatar')
            ->orderBy('created_at')
            ->get()
            ->map(fn ($c) => $this->formatComment($c));

        return response()->json(['data' => $comments]);
    }

    public function store(Request $request, int $boutiqueId, int $postId)
    {
        $post = $this->resolvePost($boutiqueId, $postId);

        $data = $request->validate([
            'body' => 'required|string|max:1000',
        ]);

        $comment = $post->comments()->create([
            'user_id' => Auth::id(),
            'body' => trim($data['body']),
        ]);

        $comment->load('user:id,name,avatar');

        return response()->json($this->formatComment($comment), 201);
    }

    private function resolvePost(int $boutiqueId, int $postId): BoutiquePost
    {
        return BoutiquePost::where('boutique_id', $boutiqueId)
            ->where('is_published', true)
            ->findOrFail($postId);
    }

    private function formatComment(BoutiquePostComment $comment): array
    {
        return [
            'id' => $comment->id,
            'body' => $comment->body,
            'user_id' => $comment->user_id,
            'user_name' => $comment->user?->name ?? 'Utilisateur',
            'user_avatar' => $comment->user?->avatar,
            'is_mine' => (int) $comment->user_id === (int) Auth::id(),
            'created_at' => $comment->created_at?->toIso8601String(),
        ];
    }
}
