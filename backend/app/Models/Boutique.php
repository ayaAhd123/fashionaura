<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Boutique extends Model
{
    protected $fillable = [
        'city_id',
        'name',
        'slug',
        'logo',
        'banner',
        'description',
        'category',
        'rating',
        'reviews_count',
        'followers_count',
        'address',
        'phone',
        'email',
        'website',
        'opening_hours',
        'is_verified',
        'is_active',
        'stock_alert_threshold',
        'offers_delivery',
        'delivery_scope',
        'delivery_note',
    ];

    protected $casts = [
        'opening_hours' => 'array',
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
        'offers_delivery' => 'boolean',
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

    public function followers()
    {
        return $this->hasMany(BoutiqueFollower::class);
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
}
