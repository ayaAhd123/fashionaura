<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'boutique_id',
        'name',
        'description',
        'price',
        'promo_price',
        'image',
        'category',
        'style',
        'sizes',
        'colors',
        'stock',
        'is_active',
    ];

    protected $casts = [
        'sizes' => 'array',
        'colors' => 'array',
    ];

    public function boutique()
    {
        return $this->belongsTo(Boutique::class);
    }
}