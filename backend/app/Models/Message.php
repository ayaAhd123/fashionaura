<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    public const TYPE_TEXT = 'text';
    public const TYPE_AUDIO = 'audio';
    public const TYPE_PRODUCT = 'product';

    protected $fillable = [
        'conversation_id',
        'user_id',
        'type',
        'body',
        'audio_path',
        'product_id',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
