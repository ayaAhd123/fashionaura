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
                'image' => 'https://images.unsplash.com/photo-1571736776837-e7d2c6ac1d47',
                'description' => 'Morocco\'s largest city and economic capital, known for modern fashion and luxury boutiques.',
                'region' => 'Casablanca-Settat',
                'boutiques_count' => 0,
            ],
            [
                'name' => 'Marrakech',
                'image' => 'https://images.unsplash.com/photo-1582459900452-26fcdb9ccaa3',
                'description' => 'The red city, famous for its traditional crafts and contemporary fashion scene.',
                'region' => 'Marrakech-Safi',
                'boutiques_count' => 0,
            ],
            [
                'name' => 'Rabat',
                'image' => 'https://images.unsplash.com/photo-1598995464392-6d05079c241f',
                'description' => 'The capital city, blending modern elegance with traditional style.',
                'region' => 'Rabat-Salé-Kénitra',
                'boutiques_count' => 0,
            ],
            [
                'name' => 'Fes',
                'image' => 'https://images.unsplash.com/photo-1563834922397-286abcfffb52',
                'description' => 'Cultural capital with rich heritage in traditional Moroccan fashion.',
                'region' => 'Fès-Meknès',
                'boutiques_count' => 0,
            ],
            [
                'name' => 'Tangier',
                'image' => 'https://images.unsplash.com/photo-1563834922397-286abcfffb52',
                'description' => 'International gateway with a mix of European and Moroccan style.',
                'region' => 'Tanger-Tétouan-Al Hoceima',
                'boutiques_count' => 0,
            ],
        ];
        
        foreach ($cities as $city) {
            City::create($city);
        }
        
        $this->command->info('✅ Cities seeded!');
    }
}