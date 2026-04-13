<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductAnalytics extends Model
{
    protected $fillable = [
        'product_id', 'date', 'views', 'clicks', 'added_to_cart',
        'purchases', 'revenue', 'conversion_rate'
    ];

    protected $casts = [
        'date' => 'date',
        'revenue' => 'decimal:2',
        'conversion_rate' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }

    public function scopeTopProducts($query, $limit = 10)
    {
        return $query->orderBy('purchases', 'desc')
                     ->orderBy('revenue', 'desc')
                     ->limit($limit);
    }
}