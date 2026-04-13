<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Boutique;
use App\Models\City;

class BoutiqueSeeder extends Seeder
{
    public function run(): void
    {
        $cities = City::all();
        
        $boutiques = [
            [
                'name' => 'Luxury Fashion House',
                'logo' => 'https://ui-avatars.com/api/?name=Luxury&background=000000&color=fff',
                'banner' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
                'description' => 'Premium luxury clothing and accessories from top international brands.',
                'category' => 'luxury',
                'address' => 'Anfa Place Shopping Center, Casablanca',
                'phone' => '+212522123456',
                'email' => 'contact@luxuryfashion.ma',
                'is_verified' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Street Style Morocco',
                'logo' => 'https://ui-avatars.com/api/?name=Street&background=14b8a6&color=fff',
                'banner' => 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2',
                'description' => 'Urban streetwear and casual fashion for the modern Moroccan.',
                'category' => 'streetwear',
                'address' => 'Marjane Mall, Casablanca',
                'phone' => '+212522234567',
                'email' => 'info@streetstyle.ma',
                'is_verified' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Casablanca Chic',
                'logo' => 'https://ui-avatars.com/api/?name=Chic&background=ec489a&color=fff',
                'banner' => 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b',
                'description' => 'Elegant and chic fashion for women who love style.',
                'category' => 'casual',
                'address' => 'Morocco Mall, Casablanca',
                'phone' => '+212522345678',
                'email' => 'hello@casablancachic.ma',
                'is_verified' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Modern Wear',
                'logo' => 'https://ui-avatars.com/api/?name=Modern&background=3b82f6&color=fff',
                'banner' => 'https://images.unsplash.com/photo-1483985988355-763728e1935b',
                'description' => 'Contemporary fashion for men and women.',
                'category' => 'casual',
                'address' => 'Guéliz, Marrakech',
                'phone' => '+212524456789',
                'email' => 'contact@modernwear.ma',
                'is_verified' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Elite Collection',
                'logo' => 'https://ui-avatars.com/api/?name=Elite&background=8b5cf6&color=fff',
                'banner' => 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04',
                'description' => 'Exclusive designer pieces and limited editions.',
                'category' => 'luxury',
                'address' => 'Agdal, Rabat',
                'phone' => '+212537567890',
                'email' => 'info@elitecollection.ma',
                'is_verified' => false,
                'is_active' => true,
            ],
        ];
        
        foreach ($boutiques as $index => $boutiqueData) {
            $city = $cities[$index % $cities->count()];
            $boutiqueData['city_id'] = $city->id;
            $boutique = Boutique::create($boutiqueData);
            
            // Update city boutique count
            $city->increment('boutiques_count');
        }
        
        $this->command->info('✅ Boutiques seeded!');
    }
}