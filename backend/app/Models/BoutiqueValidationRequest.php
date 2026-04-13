<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoutiqueValidationRequest extends Model
{
    protected $fillable = [
        'boutique_id', 'user_id', 'message', 'documents',
        'status', 'admin_comment', 'reviewed_by', 'reviewed_at'
    ];

    protected $casts = [
        'documents' => 'array',
        'reviewed_at' => 'datetime',
    ];

    public function boutique()
    {
        return $this->belongsTo(Boutique::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function approve($adminId, $comment = null)
    {
        $this->update([
            'status' => 'approved',
            'admin_comment' => $comment,
            'reviewed_by' => $adminId,
            'reviewed_at' => now(),
        ]);

        $this->boutique->update(['is_verified' => true]);
    }

    public function reject($adminId, $comment = null)
    {
        $this->update([
            'status' => 'rejected',
            'admin_comment' => $comment,
            'reviewed_by' => $adminId,
            'reviewed_at' => now(),
        ]);
    }
}