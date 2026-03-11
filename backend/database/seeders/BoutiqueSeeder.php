<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Boutique;
use App\Models\City;

class BoutiqueSeeder extends Seeder
{
    public function run(): void
    {
        $tanger = City::where('name', 'Tanger')->first();
        $casablanca = City::where('name', 'Casablanca')->first();
        $marrakech = City::where('name', 'Marrakech')->first();

        $boutiques = [
            // Tanger
            ['name' => 'Tanger Élégance', 'city_id' => $tanger->id, 'description' => 'La boutique tendance du boulevard Pasteur.', 'address' => 'Boulevard Pasteur, Tanger', 'logo' => null, 'banner' => null],
            ['name' => 'Médina Chic', 'city_id' => $tanger->id, 'description' => 'Mode moderne inspirée de la médina de Tanger.', 'address' => 'Rue de la Médina, Tanger', 'logo' => null, 'banner' => null],
            ['name' => 'Détroit Fashion', 'city_id' => $tanger->id, 'description' => 'Style contemporain face au détroit.', 'address' => 'Avenue Mohammed VI, Tanger', 'logo' => null, 'banner' => null],
            // Casablanca
            ['name' => 'Élégance Casa', 'city_id' => $casablanca->id, 'description' => 'Boutique tendance au cœur de Casablanca.', 'address' => 'Boulevard Anfa, Casablanca', 'logo' => null, 'banner' => null],
            // Marrakech
            ['name' => 'Marrakech Chic', 'city_id' => $marrakech->id, 'description' => 'Mode et artisanat fusionnés.', 'address' => 'Rue de la Médina, Marrakech', 'logo' => null, 'banner' => null],
        ];

        foreach ($boutiques as $boutique) {
            Boutique::create($boutique);
        }
    }
}