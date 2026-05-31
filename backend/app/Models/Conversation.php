<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = [
        'order_id',
        'boutique_id',
        'customer_id',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function boutique()
    {
        return $this->belongsTo(Boutique::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    public static function findOrCreateForOrder(Order $order, int $boutiqueId): self
    {
        return self::firstOrCreate(
            ['order_id' => $order->id],
            [
                'boutique_id' => $boutiqueId,
                'customer_id' => $order->user_id,
            ]
        );
    }

    public static function findOrCreateDirect(Boutique $boutique, User $customer): self
    {
        $existing = self::where('boutique_id', $boutique->id)
            ->where('customer_id', $customer->id)
            ->whereNull('order_id')
            ->first();

        if ($existing) {
            return $existing;
        }

        return self::create([
            'order_id' => null,
            'boutique_id' => $boutique->id,
            'customer_id' => $customer->id,
        ]);
    }
}
