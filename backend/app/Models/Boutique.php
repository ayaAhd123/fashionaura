<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Boutique extends Model
{
    protected $fillable = [
        'city_id',
        'name',
        'logo',
        'banner',
        'description',
        'category',
        'rating',
        'reviews_count',
        'address',
        'phone',
        'email',
        'is_verified',
        'is_active',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
        'rating' => 'decimal:1',
    ];

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function owner()
    {
        return $this->hasOne(User::class, 'boutique_id');
    }

    public function analytics()
    {
        return $this->hasMany(BoutiqueAnalytics::class);
    }

    public function validationRequest()
    {
        return $this->hasOne(BoutiqueValidationRequest::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function orders()
    {
        return Order::whereHas('items.product', function($query) {
            $query->where('boutique_id', $this->id);
        });
    }
}