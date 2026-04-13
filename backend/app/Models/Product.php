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
        'price' => 'decimal:2',
        'promo_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function boutique()
    {
        return $this->belongsTo(Boutique::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function analytics()
    {
        return $this->hasMany(ProductAnalytics::class);
    }
}