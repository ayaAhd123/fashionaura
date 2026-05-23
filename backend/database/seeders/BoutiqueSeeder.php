<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Boutique;
use App\Models\City;

class BoutiqueSeeder extends Seeder
{
    public function run(): void
    {
        $cities = City::all()->keyBy('name');

        $boutiques = [
            [
                'name' => 'Tanger Élégance',
                'slug' => 'tanger-elegance',
                'city_id' => $cities['Tanger']->id,
                'description' => 'La boutique tendance du boulevard Pasteur. Découvrez notre collection exclusive de vêtements haut de gamme.',
                'address' => 'Boulevard Pasteur, Tanger',
                'phone' => '+212 5 39 93 40 00',
                'email' => 'contact@tangerelegance.ma',
                'website' => 'https://tangerelegance.ma',
                'category' => 'luxury',
                'is_verified' => true,
                'rating' => 4.5,
            ],
            [
                'name' => 'Médina Chic',
                'slug' => 'medina-chic',
                'city_id' => $cities['Tanger']->id,
                'description' => 'Mode moderne inspirée de la médina de Tanger. Robes, vêtements traditionnels revisités.',
                'address' => 'Rue de la Médina, Tanger',
                'phone' => '+212 5 39 93 50 00',
                'email' => 'contact@medinachic.ma',
                'website' => 'https://medinachic.ma',
                'category' => 'casual',
                'is_verified' => true,
                'rating' => 4.3,
            ],
            [
                'name' => 'Détroit Fashion',
                'slug' => 'detroit-fashion',
                'city_id' => $cities['Tanger']->id,
                'description' => 'Style contemporain face au détroit. Collection de designers marocains.',
                'address' => 'Avenue Mohammed VI, Tanger',
                'phone' => '+212 5 39 93 60 00',
                'email' => 'contact@detroitfashion.ma',
                'category' => 'streetwear',
                'is_verified' => false,
                'rating' => 4.2,
            ],
            [
                'name' => 'Élégance Casa',
                'slug' => 'elegance-casa',
                'city_id' => $cities['Casablanca']->id,
                'description' => 'Boutique tendance au cœur de Casablanca. Luxe et sophistication.',
                'address' => 'Boulevard Anfa, Casablanca',
                'phone' => '+212 5 22 22 40 00',
                'email' => 'contact@elegancecasa.ma',
                'website' => 'https://elegancecasa.ma',
                'category' => 'luxury',
                'is_verified' => true,
                'rating' => 4.7,
            ],
            [
                'name' => 'Marrakech Chic',
                'slug' => 'marrakech-chic',
                'city_id' => $cities['Marrakech']->id,
                'description' => 'Mode et artisanat fusionnés. Vêtements uniques alliant tradition et modernité.',
                'address' => 'Rue de la Médina, Marrakech',
                'phone' => '+212 5 24 44 30 00',
                'email' => 'contact@marrakechChic.ma',
                'category' => 'casual',
                'is_verified' => true,
                'rating' => 4.4,
            ],
            [
                'name' => 'Rabat Style',
                'slug' => 'rabat-style',
                'city_id' => $cities['Rabat']->id,
                'description' => 'Mode contemporaine pour la capitale. Collection exclusive.',
                'address' => 'Avenue Abdelmoumen, Rabat',
                'phone' => '+212 5 37 20 40 00',
                'email' => 'contact@rabatstyle.ma',
                'category' => 'luxury',
                'is_verified' => true,
                'rating' => 4.6,
            ],
            [
                'name' => 'Fès Tradition',
                'slug' => 'fes-tradition',
                'city_id' => $cities['Fès']->id,
                'description' => 'Vêtements traditionnels avec touches modernes. L\'essence de Fès.',
                'address' => 'Rue de Fès El Bali, Fès',
                'phone' => '+212 5 35 65 70 00',
                'email' => 'contact@festradition.ma',
                'category' => 'casual',
                'is_verified' => false,
                'rating' => 4.1,
            ],
        ];

        foreach ($boutiques as $boutique) {
            $slug = $boutique['slug'];
            $media = DemoMediaUrls::boutique($slug);
            Boutique::create(array_merge($boutique, [
                'logo' => $media['logo'],
                'banner' => $media['banner'],
            ]));
        }
    }
}