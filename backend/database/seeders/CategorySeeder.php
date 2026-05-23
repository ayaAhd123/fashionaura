<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Robes', 'slug' => 'robes', 'description' => 'Robes élégantes pour toutes occasions'],
            ['name' => 'Chemises', 'slug' => 'chemises', 'description' => 'Chemises de qualité'],
            ['name' => 'Chaussures', 'slug' => 'chaussures', 'description' => 'Chaussures premium'],
            ['name' => 'Accessoires', 'slug' => 'accessoires', 'description' => 'Accessoires mode'],
            ['name' => 'Sacs', 'slug' => 'sacs', 'description' => 'Sacs à main et de voyage'],
            ['name' => 'Bijoux', 'slug' => 'bijoux', 'description' => 'Bijoux luxe'],
        ];

        foreach ($categories as $category) {
            Category::create(array_merge($category, ['is_active' => true]));
        }
    }
}
