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
        'address',
        'phone',
        'email',
        'is_verified',
        'is_active',
    ];

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}