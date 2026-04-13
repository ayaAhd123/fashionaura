<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoutiqueAnalytics extends Model
{
    protected $fillable = [
        'boutique_id', 'date', 'total_views', 'unique_visitors',
        'total_orders', 'total_revenue', 'products_sold',
        'average_order_value', 'conversion_rate', 'top_products'
    ];

    protected $casts = [
        'date' => 'date',
        'top_products' => 'array',
        'total_revenue' => 'decimal:2',
        'average_order_value' => 'decimal:2',
        'conversion_rate' => 'decimal:2',
    ];

    public function boutique()
    {
        return $this->belongsTo(Boutique::class);
    }

    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }

    public function scopeForPeriod($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }
}