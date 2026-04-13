<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // ← AJOUTER CETTE LIGNE

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // ← AJOUTER HasApiTokens ICI

    protected $fillable = [
        'name', 'email', 'password', 'avatar', 'phone', 'role', 'boutique_id', 'is_active',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    // Relations
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

    // Role helpers
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isBoutiqueOwner()
    {
        return $this->role === 'boutique_owner';
    }

    public function isCustomer()
    {
        return $this->role === 'customer' || $this->role === 'client';
    }
}