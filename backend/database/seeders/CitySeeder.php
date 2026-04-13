<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\City;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            [
                'name' => 'Casablanca',
                'slug' => 'casablanca',
                'description' => 'La plus grande ville du Maroc, centre économique et culturel',
                'region' => 'Casablanca-Settat',
                'image' => 'https://via.placeholder.com/300x200?text=Casablanca',
                'is_active' => true,
            ],
            [
                'name' => 'Marrakech',
                'slug' => 'marrakech',
                'description' => 'La ville rouge, destination touristique majeure',
                'region' => 'Marrakech-Safi',
                'image' => 'https://via.placeholder.com/300x200?text=Marrakech',
                'is_active' => true,
            ],
            [
                'name' => 'Rabat',
                'slug' => 'rabat',
                'description' => 'La capitale du Maroc',
                'region' => 'Rabat-Salé-Kénitra',
                'image' => 'https://via.placeholder.com/300x200?text=Rabat',
                'is_active' => true,
            ],
            [
                'name' => 'Tanger',
                'slug' => 'tanger',
                'description' => 'Porte nord du Maroc sur la Méditerranée',
                'region' => 'Tanger-Tétouan-Al Hoceïma',
                'image' => 'https://via.placeholder.com/300x200?text=Tanger',
                'is_active' => true,
            ],
            [
                'name' => 'Fès',
                'slug' => 'fes',
                'description' => 'La ville aux mille medinas, capitale artisanale du Maroc',
                'region' => 'Fès-Meknès',
                'image' => 'https://via.placeholder.com/300x200?text=Fes',
                'is_active' => true,
            ],
        ];

        foreach ($cities as $city) {
            City::create($city);
        }
    }
}