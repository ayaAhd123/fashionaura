<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    protected $fillable = [
        'name',
        'image',
        'description',
        'region',
        'boutiques_count',
    ];

    public function boutiques()
    {
        return $this->hasMany(Boutique::class);
    }
}