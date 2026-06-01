<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    public const KIND_BOUTIQUE = 'boutique';
    public const KIND_USER = 'user';

    protected $fillable = [
        'kind',
        'order_id',
        'boutique_id',
        'customer_id',
        'peer_user_id',
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

    public function peerUser()
    {
        return $this->belongsTo(User::class, 'peer_user_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    public function involvesUser(int $userId): bool
    {
        if ($this->kind === self::KIND_USER) {
            return $userId === (int) $this->customer_id || $userId === (int) $this->peer_user_id;
        }

        return $userId === (int) $this->customer_id
            || ($this->boutique_id && User::where('id', $userId)->where('boutique_id', $this->boutique_id)->exists());
    }

    public function counterpartFor(int $userId): ?User
    {
        if ($this->kind === self::KIND_USER) {
            if ($userId === (int) $this->customer_id) {
                return $this->peerUser;
            }
            if ($userId === (int) $this->peer_user_id) {
                return $this->customer;
            }

            return null;
        }

        $user = User::find($userId);
        if ($user?->role === 'boutique_owner' && (int) $user->boutique_id === (int) $this->boutique_id) {
            return $this->customer;
        }

        return $this->boutique?->owner ?? $this->boutique ? User::where('boutique_id', $this->boutique_id)->first() : null;
    }

    public static function findOrCreateForOrder(Order $order, int $boutiqueId): self
    {
        return self::firstOrCreate(
            ['order_id' => $order->id],
            [
                'kind' => self::KIND_BOUTIQUE,
                'boutique_id' => $boutiqueId,
                'customer_id' => $order->user_id,
            ]
        );
    }

    public static function findOrCreateDirect(Boutique $boutique, User $customer): self
    {
        $existing = self::where('kind', self::KIND_BOUTIQUE)
            ->where('boutique_id', $boutique->id)
            ->where('customer_id', $customer->id)
            ->whereNull('order_id')
            ->first();

        if ($existing) {
            return $existing;
        }

        return self::create([
            'kind' => self::KIND_BOUTIQUE,
            'order_id' => null,
            'boutique_id' => $boutique->id,
            'customer_id' => $customer->id,
        ]);
    }

    public static function findOrCreateUserDirect(User $userA, User $userB): self
    {
        abort_if((int) $userA->id === (int) $userB->id, 422, 'Impossible de discuter avec vous-même.');

        $low = min($userA->id, $userB->id);
        $high = max($userA->id, $userB->id);

        return self::firstOrCreate(
            [
                'kind' => self::KIND_USER,
                'customer_id' => $low,
                'peer_user_id' => $high,
            ],
            [
                'order_id' => null,
                'boutique_id' => null,
            ]
        );
    }
}
