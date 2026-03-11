<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\City;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            ['name' => 'Casablanca', 'region' => 'Casablanca-Settat', 'image' => null],
            ['name' => 'Marrakech', 'region' => 'Marrakech-Safi', 'image' => null],
            ['name' => 'Rabat', 'region' => 'Rabat-Salé-Kénitra', 'image' => null],
            ['name' => 'Tanger', 'region' => 'Tanger-Tétouan-Al Hoceïma', 'image' => null],
            ['name' => 'Fès', 'region' => 'Fès-Meknès', 'image' => null],
        ];

        foreach ($cities as $city) {
            City::create($city);
        }
    }
}