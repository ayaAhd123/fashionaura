<?php

namespace Database\Seeders;

use App\Models\Boutique;
use App\Models\City;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Données de test minimales : uniquement le magasin de Sarah.
 * Compte : sarah@luxuryfashion.com / password123
 */
class SarahBoutiqueSeeder extends Seeder
{
    public function run(): void
    {
        $tanger = City::where('slug', 'tanger')->first();
        if (! $tanger) {
            $this->command?->warn('Ville Tanger introuvable — lancez CitySeeder d\'abord.');

            return;
        }

        $media = DemoMediaUrls::boutique('tanger-elegance');

        $boutique = Boutique::updateOrCreate(
            ['slug' => 'luxury-fashion-tanger'],
            [
                'city_id' => $tanger->id,
                'name' => 'Luxury Fashion',
                'description' => 'Boutique de démo FashionAura — mode premium à Tanger.',
                'address' => 'Boulevard Pasteur, Tanger',
                'phone' => '+212 5 39 93 40 00',
                'email' => 'contact@luxuryfashion.ma',
                'category' => 'luxury',
                'logo' => $media['logo'],
                'banner' => $media['banner'],
                'is_verified' => true,
                'is_active' => true,
                'rating' => 0,
                'reviews_count' => 0,
                'followers_count' => 0,
                'offers_delivery' => true,
                'delivery_scope' => 'national',
                'delivery_note' => 'Livraison partout au Maroc.',
            ]
        );

        User::updateOrCreate(
            ['email' => 'sarah@luxuryfashion.com'],
            [
                'name' => 'Sarah Martinez',
                'password' => Hash::make('password123'),
                'phone' => '+212600000003',
                'avatar' => 'https://ui-avatars.com/api/?name=Sarah&background=ec489a&color=fff',
                'role' => 'boutique_owner',
                'boutique_id' => $boutique->id,
                'is_active' => true,
            ]
        );

        $this->command?->info('✅ Sarah — Luxury Fashion (Tanger) : sarah@luxuryfashion.com / password123');
    }
}
