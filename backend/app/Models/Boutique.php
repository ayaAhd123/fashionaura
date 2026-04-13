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
    ];

    protected $casts = [
        'opening_hours' => 'array',
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
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
}