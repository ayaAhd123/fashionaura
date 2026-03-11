<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Boutique;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $tangerElegance = Boutique::where('name', 'Tanger Élégance')->first();
        $medinaChic = Boutique::where('name', 'Médina Chic')->first();
        $detroitFashion = Boutique::where('name', 'Détroit Fashion')->first();
        $eleganceCasa = Boutique::where('name', 'Élégance Casa')->first();
        $marrakechChic = Boutique::where('name', 'Marrakech Chic')->first();

        $products = [
            // Tanger Élégance
            ['name' => 'Robe Bohème', 'boutique_id' => $tangerElegance->id, 'price' => 350, 'stock' => 10, 'description' => 'Robe légère style bohème.', 'category' => 'dress', 'image' => null],
            ['name' => 'Veste en Lin', 'boutique_id' => $tangerElegance->id, 'price' => 520, 'stock' => 7, 'description' => 'Veste élégante en lin naturel.', 'category' => 'jacket', 'image' => null],
            // Médina Chic
            ['name' => 'Caftan Moderne', 'boutique_id' => $medinaChic->id, 'price' => 890, 'stock' => 5, 'description' => 'Caftan revisité moderne.', 'category' => 'dress', 'image' => null],
            ['name' => 'Jupe Brodée', 'boutique_id' => $medinaChic->id, 'price' => 420, 'stock' => 8, 'description' => 'Jupe avec broderies marocaines.', 'category' => 'skirt', 'image' => null],
            // Détroit Fashion
            ['name' => 'Blazer Oversize', 'boutique_id' => $detroitFashion->id, 'price' => 680, 'stock' => 6, 'description' => 'Blazer tendance coupe oversize.', 'category' => 'jacket', 'image' => null],
            ['name' => 'Pantalon Wide Leg', 'boutique_id' => $detroitFashion->id, 'price' => 390, 'stock' => 12, 'description' => 'Pantalon large et confortable.', 'category' => 'pants', 'image' => null],
            // Élégance Casa
            ['name' => 'Robe de Soirée', 'boutique_id' => $eleganceCasa->id, 'price' => 1200, 'stock' => 3, 'description' => 'Robe pour occasions spéciales.', 'category' => 'dress', 'image' => null],
            // Marrakech Chic
            ['name' => 'Gandoura Femme', 'boutique_id' => $marrakechChic->id, 'price' => 750, 'stock' => 9, 'description' => 'Gandoura traditionnelle revisitée.', 'category' => 'dress', 'image' => null],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}