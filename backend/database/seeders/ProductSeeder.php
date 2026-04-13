<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Boutique;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $boutiques = Boutique::all()->keyBy('name');
        $categories = \App\Models\Category::all()->keyBy('slug');

        $products = [
            // Tanger Élégance
            [
                'name' => 'Robe Bohème Luxe',
                'slug' => 'robe-boheme-luxe',
                'boutique_id' => $boutiques['Tanger Élégance']->id,
                'category_id' => $categories['robes']->id,
                'price' => 350,
                'discount_price' => 280,
                'stock_quantity' => 15,
                'description' => 'Robe légère style bohème avec broderies délicates. Parfaite pour les occasions spéciales.',
                'style' => 'luxury',
                'rating' => 4.5,
            ],
            [
                'name' => 'Veste en Lin Premium',
                'slug' => 'veste-lin-premium',
                'boutique_id' => $boutiques['Tanger Élégance']->id,
                'category_id' => $categories['chemises']->id,
                'price' => 520,
                'stock_quantity' => 8,
                'description' => 'Veste élégante en lin naturel. Très confortable pour l\'été.',
                'style' => 'casual',
                'rating' => 4.3,
            ],
            // Médina Chic
            [
                'name' => 'Caftan Moderne Brodé',
                'slug' => 'caftan-moderne-brode',
                'boutique_id' => $boutiques['Médina Chic']->id,
                'category_id' => $categories['robes']->id,
                'price' => 890,
                'discount_price' => 750,
                'stock_quantity' => 6,
                'description' => 'Caftan revisité moderne avec broderies artisanales.',
                'style' => 'luxury',
                'rating' => 4.7,
            ],
            [
                'name' => 'Jupe Brodée Marocaine',
                'slug' => 'jupe-brode-marocaine',
                'boutique_id' => $boutiques['Médina Chic']->id,
                'category_id' => $categories['robes']->id,
                'price' => 420,
                'stock_quantity' => 10,
                'description' => 'Jupe avec broderies marocaines traditionnelles.',
                'style' => 'casual',
                'rating' => 4.2,
            ],
            // Détroit Fashion
            [
                'name' => 'Blazer Oversize Noir',
                'slug' => 'blazer-oversize-noir',
                'boutique_id' => $boutiques['Détroit Fashion']->id,
                'category_id' => $categories['chemises']->id,
                'price' => 680,
                'discount_price' => 600,
                'stock_quantity' => 7,
                'description' => 'Blazer tendance coupe oversize. Incontournable de cette saison.',
                'style' => 'streetwear',
                'rating' => 4.4,
            ],
            [
                'name' => 'Pantalon Wide Leg',
                'slug' => 'pantalon-wide-leg',
                'boutique_id' => $boutiques['Détroit Fashion']->id,
                'category_id' => $categories['chemises']->id,
                'price' => 390,
                'stock_quantity' => 15,
                'description' => 'Pantalon large et confortable. Style décontracté chic.',
                'style' => 'casual',
                'rating' => 4.1,
            ],
            // Élégance Casa
            [
                'name' => 'Robe de Soirée Glamour',
                'slug' => 'robe-soiree-glamour',
                'boutique_id' => $boutiques['Élégance Casa']->id,
                'category_id' => $categories['robes']->id,
                'price' => 1200,
                'stock_quantity' => 4,
                'description' => 'Robe pour occasions spéciales avec paillettes.',
                'style' => 'luxury',
                'rating' => 4.8,
            ],
            // Marrakech Chic
            [
                'name' => 'Gandoura Femme Premium',
                'slug' => 'gandoura-femme-premium',
                'boutique_id' => $boutiques['Marrakech Chic']->id,
                'category_id' => $categories['robes']->id,
                'price' => 750,
                'stock_quantity' => 10,
                'description' => 'Gandoura traditionnelle revisitée avec matériaux premium.',
                'style' => 'luxury',
                'rating' => 4.6,
            ],
            // Rabat Style
            [
                'name' => 'Chemise Classique Blanche',
                'slug' => 'chemise-classique-blanche',
                'boutique_id' => $boutiques['Rabat Style']->id,
                'category_id' => $categories['chemises']->id,
                'price' => 280,
                'stock_quantity' => 20,
                'description' => 'Chemise classique blanche intemporelle.',
                'style' => 'casual',
                'rating' => 4.4,
            ],
            // Fès Tradition
            [
                'name' => 'Sac Cuir Artisanal',
                'slug' => 'sac-cuir-artisanal',
                'boutique_id' => $boutiques['Fès Tradition']->id,
                'category_id' => $categories['sacs']->id,
                'price' => 450,
                'stock_quantity' => 12,
                'description' => 'Sac en cuir artisanal Fassi. Fait main.',
                'style' => 'luxury',
                'rating' => 4.7,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}