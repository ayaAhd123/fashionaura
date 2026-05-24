<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'phone',
        'role',
        'boutique_id',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function boutique()
    {
        return $this->belongsTo(Boutique::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function cart()
    {
        return $this->hasOne(Cart::class);
    }

    public function followedBoutiques()
    {
        return $this->hasMany(BoutiqueFollower::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isBoutiqueOwner(): bool
    {
        return $this->role === 'boutique_owner';
    }

    public function isCustomer(): bool
    {
        return in_array($this->role, ['customer', 'client'], true);
    }
}
