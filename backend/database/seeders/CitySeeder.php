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
                'image' => DemoMediaUrls::city('casablanca'),
                'is_active' => true,
            ],
            [
                'name' => 'Marrakech',
                'slug' => 'marrakech',
                'description' => 'La ville rouge, destination touristique majeure',
                'region' => 'Marrakech-Safi',
                'image' => DemoMediaUrls::city('marrakech'),
                'is_active' => true,
            ],
            [
                'name' => 'Rabat',
                'slug' => 'rabat',
                'description' => 'La capitale du Maroc',
                'region' => 'Rabat-Salé-Kénitra',
                'image' => DemoMediaUrls::city('rabat'),
                'is_active' => true,
            ],
            [
                'name' => 'Tanger',
                'slug' => 'tanger',
                'description' => 'Porte nord du Maroc sur la Méditerranée',
                'region' => 'Tanger-Tétouan-Al Hoceïma',
                'image' => DemoMediaUrls::city('tanger'),
                'is_active' => true,
            ],
            [
                'name' => 'Fès',
                'slug' => 'fes',
                'description' => 'La ville aux mille medinas, capitale artisanale du Maroc',
                'region' => 'Fès-Meknès',
                'image' => DemoMediaUrls::city('fes'),
                'is_active' => true,
            ],
        ];

        foreach ($cities as $city) {
            City::create($city);
        }
    }
}