<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'boutique_id',
        'name',
        'description',
        'price',
        'stock',
        'category',
        'colors', // Stored as JSON or comma-separated
        'sizes', // Stored as JSON or comma-separated
        'image_url',
        'is_featured',
    ];

    protected $casts = [
        'colors' => 'array',
        'sizes' => 'array',
        'is_featured' => 'boolean',
    ];

    public function boutique()
    {
        return $this->belongsTo(Boutique::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
