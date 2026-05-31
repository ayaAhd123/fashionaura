<?php

namespace App\Models;

use App\Support\MediaUrl;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class BoutiquePost extends Model
{
    protected $fillable = [
        'boutique_id',
        'product_id',
        'image',
        'caption',
        'promo_code',
        'promo_text',
        'is_exclusive',
        'is_published',
    ];

    protected $casts = [
        'is_exclusive' => 'boolean',
        'is_published' => 'boolean',
    ];

    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => MediaUrl::resolve($value),
        );
    }

    public function boutique()
    {
        return $this->belongsTo(Boutique::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function comments()
    {
        return $this->hasMany(BoutiquePostComment::class, 'post_id');
    }
}
